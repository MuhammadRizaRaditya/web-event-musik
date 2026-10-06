import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ConfigService } from '@nestjs/config'
import { AuthService } from '../auth.service'

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    configService: ConfigService,
    private authService: AuthService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_REFRESH_SECRET'),
      passReqToCallback: true
    })
  }

  async validate(req: any, payload: any) {
    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Token bukan refresh token')
    }

    const user = await this.authService.validateUser(payload.sub)
    if (!user) {
      throw new UnauthorizedException('User tidak ditemukan atau tidak aktif')
    }

    req.user = user
    return user
  }
}