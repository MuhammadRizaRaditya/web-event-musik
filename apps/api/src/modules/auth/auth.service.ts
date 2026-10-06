import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { PrismaService } from '../../prisma/prisma.service'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'
import { ResetPasswordDto } from './dto/reset-password.dto'
import { v4 as uuidv4 } from 'uuid'
import { addMinutes, addDays } from 'date-fns'

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email }
    })

    if (existingUser) {
      throw new ConflictException('Email sudah terdaftar')
    }

    const passwordHash = await bcrypt.hash(registerDto.password, 12)

    const verificationToken = uuidv4()
    const verificationExpires = addDays(new Date(), 1)

    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        passwordHash,
        name: registerDto.name,
        phone: registerDto.phone,
        emailVerifiedAt: null,
        isActive: false
      }
    })

    // TODO: Send verification email with token
    this.logger.log(`User registered: ${user.email}, verification token: ${verificationToken}`)

    return {
      message: 'Registrasi berhasil. Silakan cek email untuk verifikasi.',
      userId: user.id
    }
  }

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: { permission: true }
                }
              }
            }
          }
        }
      }
    })

    if (!user) {
      throw new UnauthorizedException('Email atau password salah')
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Akun belum diverifikasi. Silakan cek email Anda.')
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash)
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email atau password salah')
    }

    const tokens = await this.generateTokens(user)
    await this.saveRefreshToken(user.id, tokens.refreshToken)

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { updatedAt: new Date() }
    })

    return {
      user: this.sanitizeUser(user),
      ...tokens
    }
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET
      })

      const storedToken = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, passwordHash: true }
      })

      if (!storedToken) {
        throw new UnauthorizedException('Refresh token tidak valid')
      }

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: {
          userRoles: {
            include: {
              role: {
                include: {
                  rolePermissions: {
                    include: { permission: true }
                  }
                }
              }
            }
          }
        }
      })

      if (!user || !user.isActive) {
        throw new UnauthorizedException('User tidak ditemukan atau tidak aktif')
      }

      const tokens = await this.generateTokens(user)
      await this.saveRefreshToken(user.id, tokens.refreshToken)

      return tokens
    } catch (error) {
      throw new UnauthorizedException('Refresh token tidak valid atau expired')
    }
  }

  async logout(userId: string) {
    // Invalidate refresh token (in production, use a blacklist or token store)
    await this.prisma.user.update({
      where: { id: userId },
      data: { updatedAt: new Date() }
    })
    return { message: 'Logout berhasil' }
  }

  async verifyEmail(token: string) {
    // In production, verify token from database
    // For now, simple implementation
    const user = await this.prisma.user.findFirst({
      where: { email: token }
    })

    if (!user) {
      throw new UnauthorizedException('Token verifikasi tidak valid')
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerifiedAt: new Date(),
        isActive: true
      }
    })

    return { message: 'Email berhasil diverifikasi' }
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } })
    if (!user) {
      // Don't reveal if email exists
      return { message: 'Jika email terdaftar, link reset password akan dikirim' }
    }

    const resetToken = uuidv4()
    const resetExpires = addMinutes(new Date(), 60)

    // TODO: Save reset token to database and send email
    this.logger.log(`Password reset requested for: ${email}, token: ${resetToken}`)

    return { message: 'Jika email terdaftar, link reset password akan dikirim' }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    // TODO: Verify reset token from database
    // For now, simplified
    const user = await this.prisma.user.findUnique({
      where: { email: resetPasswordDto.email }
    })

    if (!user) {
      throw new UnauthorizedException('Token reset tidak valid')
    }

    const passwordHash = await bcrypt.hash(resetPasswordDto.password, 12)

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        updatedAt: new Date()
      }
    })

    // Invalidate all refresh tokens
    // TODO: Implement token invalidation

    return { message: 'Password berhasil direset' }
  }

  private async generateTokens(user: { id: string; email: string; isActive: boolean; userRoles: any[] }) {
    const permissions = user.userRoles.flatMap(
      (ur: any) => ur.role.rolePermissions.map((rp: any) => rp.permission.name)
    )

    const roles = user.userRoles.map(ur => ur.role.name)

    const accessToken = this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        roles,
        permissions
      },
      {
        algorithm: 'RS256',
        expiresIn: '15m'
      }
    )

    const refreshToken = this.jwtService.sign(
      { sub: user.id, type: 'refresh' },
      {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '7d'
      }
    )

    return { accessToken, refreshToken }
  }

  private async saveRefreshToken(userId: string, refreshToken: string) {
    // In production, store hashed refresh token in database
    // For now, we'll just log it
    this.logger.debug(`Refresh token generated for user ${userId}`)
  }

  private sanitizeUser(user: any) {
    const { passwordHash, ...sanitized } = user
    return sanitized
  }

  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: { permission: true }
                }
              }
            }
          }
        }
      }
    })

    if (!user || !user.isActive) {
      return null
    }

    return this.sanitizeUser(user)
  }
}