import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger'
import { EventsService } from './events.service'
import { CreateEventDto } from './dto/create-event.dto'
import { UpdateEventDto } from './dto/update-event.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { Permissions } from '../auth/decorators/permissions.decorator'
import { EventStatus } from '@prisma/client'

@ApiTags('admin/events')
@Controller('admin/events')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @Roles('super_admin', 'organizer')
  @Permissions('events:create')
  @ApiOperation({ summary: 'Create new event' })
  async create(@Body() createEventDto: CreateEventDto, @Request() req: any) {
    return this.eventsService.create(createEventDto, req.user.id)
  }

  @Get()
  @Roles('super_admin', 'organizer', 'finance')
  @Permissions('events:read')
  @ApiOperation({ summary: 'Get all events' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: EventStatus })
  @ApiQuery({ name: 'search', required: false, type: String })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Request() req?: any
  ) {
    const organizerId = req?.user?.roles?.includes('super_admin') ? undefined : req.user.id
    return this.eventsService.findAll({ page, limit, status: status as any, organizerId, search })
  }

  @Get('stats/:id')
  @Roles('super_admin', 'organizer', 'finance')
  @Permissions('events:read')
  @ApiOperation({ summary: 'Get event statistics' })
  async getStats(@Param('id') id: string) {
    return this.eventsService.getStats(id)
  }

  @Get(':id')
  @Roles('super_admin', 'organizer', 'finance', 'gate_staff')
  @Permissions('events:read')
  @ApiOperation({ summary: 'Get event by ID' })
  async findById(@Param('id') id: string) {
    return this.eventsService.findById(id)
  }

  @Put(':id')
  @Roles('super_admin', 'organizer')
  @Permissions('events:update')
  @ApiOperation({ summary: 'Update event' })
  async update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto, @Request() req: any) {
    return this.eventsService.update(id, updateEventDto, req.user.id, req.user.roles[0])
  }

  @Put(':id/status')
  @Roles('super_admin', 'organizer')
  @Permissions('events:update')
  @ApiOperation({ summary: 'Update event status' })
  async updateStatus(@Param('id') id: string, @Body('status') status: string, @Request() req: any) {
    return this.eventsService.updateStatus(id, status as any, req.user.id, req.user.roles[0])
  }

  @Delete(':id')
  @Roles('super_admin', 'organizer')
  @Permissions('events:delete')
  @ApiOperation({ summary: 'Delete event (soft delete)' })
  async delete(@Param('id') id: string, @Request() req: any) {
    return this.eventsService.delete(id, req.user.id, req.user.roles[0])
  }
}