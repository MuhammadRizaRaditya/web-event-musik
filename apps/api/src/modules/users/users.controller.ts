import { Controller, Get, Put, Body, Param, UseGuards, Request, Query } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger'
import { UsersService } from './users.service'
import { UpdateProfileDto } from './dto/update-profile.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { Roles } from '../auth/decorators/roles.decorator'

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@Request() req: any) {
    return this.usersService.findById(req.user.id)
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update user profile' })
  async updateProfile(@Request() req: any, @Body() updateProfileDto: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user.id, updateProfileDto)
  }

  @Put('password')
  @ApiOperation({ summary: 'Change password' })
  async changePassword(
    @Request() req: any,
    @Body() body: { currentPassword: string; newPassword: string }
  ) {
    return this.usersService.changePassword(req.user.id, body.currentPassword, body.newPassword)
  }

  @Get('orders')
  @ApiOperation({ summary: 'Get user orders' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  async getOrders(
    @Request() req: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string
  ) {
    return this.usersService.getOrders(req.user.id, { page, limit, status })
  }

  @Get('tickets')
  @ApiOperation({ summary: 'Get user tickets' })
  async getTickets(@Request() req: any) {
    return this.usersService.getTickets(req.user.id)
  }

  // Admin only endpoints
  @Get()
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  async getAllUsers() {
    // Implementation for admin
    return { message: 'Admin only endpoint' }
  }

  @Get(':id')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Get user by ID (Admin only)' })
  async getUserById(@Param('id') id: string) {
    return this.usersService.findById(id)
  }
}