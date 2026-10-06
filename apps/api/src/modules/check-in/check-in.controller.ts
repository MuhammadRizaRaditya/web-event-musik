import { Controller, Post, Body, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { CheckInService } from './check-in.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { Permissions } from '../auth/decorators/permissions.decorator'

@ApiTags('check-in')
@Controller('check-in')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CheckInController {
  constructor(private readonly checkInService: CheckInService) {}

  @Post('validate')
  @Roles('gate_staff')
  @Permissions('check-in:validate')
  @ApiOperation({ summary: 'Validate QR code at gate' })
  async validate(@Body() body: { qrData: any; gateId: string; staffId: string }) {
    return this.checkInService.validateTicket(
      body.qrData,
      body.gateId,
      body.staffId
    )
  }

  @Post('sync')
  @Roles('gate_staff')
  @Permissions('check-in:sync')
  @ApiOperation({ summary: 'Sync offline check-ins' })
  async sync(@Body() body: { checkIns: any[] }) {
    return this.checkInService.offlineSync(body.checkIns)
  }
}