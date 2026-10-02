import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger'
import { EventsService } from './events.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { Public } from '../auth/decorators/roles.decorator'

@ApiTags('events')
@Controller('events')
export class EventsPublicController {
  constructor(private readonly eventsService: EventsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get published events' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  async findPublished(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string
  ) {
    return this.eventsService.findAll({
      page,
      limit,
      status: 'PUBLISHED',
      search
    })
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Get event by slug' })
  async findBySlug(@Param('slug') slug: string) {
    return this.eventsService.findBySlug(slug)
  }

  @Public()
  @Get(':slug/lineup')
  @ApiOperation({ summary: 'Get event lineup' })
  async getLineup(@Param('slug') slug: string) {
    const event = await this.eventsService.findBySlug(slug)
    return {
      event: { id: event.id, name: event.name },
      artists: event.artists.map(ea => ({
        ...ea.artist,
        isHeadliner: ea.isHeadliner,
        displayOrder: ea.displayOrder
      }))
    }
  }

  @Public()
  @Get(':slug/schedule')
  @ApiOperation({ summary: 'Get event schedule' })
  async getSchedule(@Param('slug') slug: string) {
    const event = await this.eventsService.findBySlug(slug)
    return {
      event: { id: event.id, name: event.name },
      stages: event.schedules.reduce((acc, s) => {
        if (!acc[s.stage.name]) acc[s.stage.name] = []
        acc[s.stage.name].push({
          id: s.id,
          artist: s.artist,
          day: s.day,
          startTime: s.startTime,
          endTime: s.endTime,
          durationMinutes: s.durationMinutes,
          status: s.status
        })
        return acc
      }, {} as Record<string, any[]>)
    }
  }

  @Public()
  @Get(':slug/ticket-types')
  @ApiOperation({ summary: 'Get available ticket types' })
  async getTicketTypes(@Param('slug') slug: string) {
    const event = await this.eventsService.findBySlug(slug)
    return {
      event: { id: event.id, name: event.name },
      ticketTypes: event.ticketTypes
    }
  }

  @Public()
  @Get(':slug/gallery')
  @ApiOperation({ summary: 'Get event gallery' })
  async getGallery(@Param('slug') slug: string) {
    const event = await this.eventsService.findBySlug(slug)
    return {
      event: { id: event.id, name: event.name },
      galleries: event.galleries
    }
  }
}