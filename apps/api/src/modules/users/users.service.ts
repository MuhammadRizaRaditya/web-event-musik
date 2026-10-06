import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { UpdateProfileDto } from './dto/update-profile.dto'
import * as bcrypt from 'bcrypt'

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
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
      throw new NotFoundException('User tidak ditemukan')
    }

    const { passwordHash, ...sanitized } = user
    return sanitized
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } })
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      throw new NotFoundException('User tidak ditemukan')
    }

    const data: any = {}
    if (updateProfileDto.name) data.name = updateProfileDto.name
    if (updateProfileDto.phone) data.phone = updateProfileDto.phone
    if (updateProfileDto.avatarUrl) data.avatarUrl = updateProfileDto.avatarUrl

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data,
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

    const { passwordHash, ...sanitized } = updated
    return sanitized
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      throw new NotFoundException('User tidak ditemukan')
    }

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!isValid) {
      throw new ConflictException('Password saat ini tidak benar')
    }

    const passwordHash = await bcrypt.hash(newPassword, 12)

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash }
    })

    return { message: 'Password berhasil diubah' }
  }

  async getOrders(userId: string, params: { page?: number; limit?: number; status?: string }) {
    const { page = 1, limit = 10, status } = params
    const skip = (page - 1) * limit

    const where: any = { customerId: userId }
    if (status) where.status = status

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: { ticketType: true }
          },
          event: true,
          payments: true
        }
      }),
      this.prisma.order.count({ where })
    ])

    return {
      data: orders,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }
  }

  async getTickets(userId: string) {
    return this.prisma.ticket.findMany({
      where: { holderEmail: (await this.findById(userId)).email },
      include: {
        ticketType: true,
        event: true,
        checkins: true
      },
      orderBy: { createdAt: 'desc' }
    })
  }
}