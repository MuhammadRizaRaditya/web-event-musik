import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { CreateEventDto } from './dto/create-event.dto'
import { UpdateEventDto } from './dto/update-event.dto'
import { EventStatus } from '@prisma/client'
import { slugify } from '@soundwave/ui'

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createEventDto: CreateEventDto, organizerId: string) {
    const slug = slugify(createEventDto.name)
    const existingSlug = await this.prisma.event.findUnique({ where: { slug } })
    if (existingSlug) {
      throw new ConflictException('Slug sudah digunakan, silakan gunakan nama event yang berbeda')
    }

    const venue = await this.prisma.venue.findUnique({
      where: { id: createEventDto.venueId }
    })
    if (!venue) {
      throw new NotFoundException('Venue tidak ditemukan')
    }

    const event = await this.prisma.event.create({
      data: {
        ...createEventDto,
        slug,
        organizerId,
        startDate: new Date(createEventDto.startDate),
        endDate: new Date(createEventDto.endDate),
        status: EventStatus.DRAFT
      } as any,
      include: { venue: true }
    })

    return event
  }

  async findAll(params: {
    page?: number
    limit?: number
    status?: EventStatus
    organizerId?: string
    search?: string
  }) {
    const { page = 1, limit = 10, status, organizerId, search } = params
    const skip = (page - 1) * limit

    const where: any = {}
    if (status) where.status = status
    if (organizerId) where.organizerId = organizerId
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [events, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          venue: true,
          organizer: { select: { id: true, name: true, email: true } },
          ticketTypes: true,
          _count: { select: { orders: true, tickets: true } }
        }
      }),
      this.prisma.event.count({ where })
    ])

    return {
      data: events,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    }
  }

  async findBySlug(slug: string) {
    const event = await this.prisma.event.findUnique({
      where: { slug },
      include: {
        venue: true,
        organizer: { select: { id: true, name: true } },
        ticketTypes: {
          where: { status: { not: 'CLOSED' } },
          orderBy: { price: 'asc' }
        },
        schedules: {
          include: { stage: true, artist: true },
          orderBy: { startTime: 'asc' }
        },
        artists: { include: { artist: true } },
        galleries: { include: { items: true } },
        playlists: true,
        promoCodes: { where: { isActive: true } }
      }
    })

    if (!event) {
      throw new NotFoundException('Event tidak ditemukan')
    }

    return event
  }

  async findById(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        venue: true,
        organizer: { select: { id: true, name: true, email: true } },
        ticketTypes: true,
        schedules: { include: { stage: true, artist: true } },
        artists: { include: { artist: true } }
      }
    })

    if (!event) {
      throw new NotFoundException('Event tidak ditemukan')
    }

    return event
  }

  async update(id: string, updateEventDto: UpdateEventDto, userId: string, userRole: string) {
    const event = await this.findById(id)

    if (userRole !== 'super_admin' && event.organizerId !== userId) {
      throw new ForbiddenException('Anda tidak memiliki akses untuk mengubah event ini')
    }

    const data: any = { ...updateEventDto }
    if (updateEventDto.startDate) data.startDate = new Date(updateEventDto.startDate)
    if (updateEventDto.endDate) data.endDate = new Date(updateEventDto.endDate)
    if (updateEventDto.name && updateEventDto.name !== event.name) {
      const newSlug = slugify(updateEventDto.name)
      const existingSlug = await this.prisma.event.findUnique({ where: { slug: newSlug } })
      if (existingSlug && existingSlug.id !== id) {
        throw new ConflictException('Slug sudah digunakan')
      }
      data.slug = newSlug
    }

    const updated = await this.prisma.event.update({
      where: { id },
      data,
      include: { venue: true, ticketTypes: true }
    })

    return updated
  }

  async updateStatus(id: string, status: EventStatus, userId: string, userRole: string) {
    const event = await this.findById(id)

    if (userRole !== 'super_admin' && event.organizerId !== userId) {
      throw new ForbiddenException('Anda tidak memiliki akses')
    }

    const validTransitions: Record<EventStatus, EventStatus[]> = {
      [EventStatus.DRAFT]: [EventStatus.PUBLISHED, EventStatus.CANCELLED],
      [EventStatus.PUBLISHED]: [EventStatus.ONGOING, EventStatus.CANCELLED],
      [EventStatus.ONGOING]: [EventStatus.COMPLETED, EventStatus.CANCELLED],
      [EventStatus.COMPLETED]: [],
      [EventStatus.CANCELLED]: [EventStatus.DRAFT]
    }

    if (!validTransitions[event.status].includes(status)) {
      throw new ConflictException(`Tidak bisa mengubah status dari ${event.status} ke ${status}`)
    }

    if (status === EventStatus.PUBLISHED) {
      const ticketTypes = await this.prisma.ticketType.findMany({
        where: { eventId: id, quota: { gt: 0 } }
      })
      if (ticketTypes.length === 0) {
        throw new ConflictException('Event harus memiliki minimal 1 tipe tiket dengan kuota > 0 untuk dipublish')
      }
    }

    if (status === EventStatus.CANCELLED) {
      await this.prisma.$transaction(async (tx) => {
        await tx.ticketType.updateMany({
          where: { eventId: id },
          data: { status: 'CLOSED' }
        })
        await tx.order.updateMany({
          where: { eventId: id, status: 'PENDING' },
          data: { status: 'CANCELLED' }
        })
        for (const order of await tx.order.findMany({
          where: { eventId: id, status: 'CANCELLED' },
          include: { items: true }
        })) {
          for (const item of order.items) {
            await tx.ticketType.update({
              where: { id: item.ticketTypeId },
              data: { soldCount: { decrement: item.quantity } }
            })
          }
        }
      })
    }

    return this.prisma.event.update({
      where: { id },
      data: { status }
    })
  }

  async delete(id: string, userId: string, userRole: string) {
    const event = await this.findById(id)

    if (userRole !== 'super_admin' && event.organizerId !== userId) {
      throw new ForbiddenException('Anda tidak memiliki akses')
    }

    if (event.status !== EventStatus.DRAFT && event.status !== EventStatus.CANCELLED) {
      throw new ConflictException('Hanya event draft atau cancelled yang bisa dihapus')
    }

    await this.prisma.event.update({
      where: { id },
      data: { deletedAt: new Date() }
    })

    return { message: 'Event berhasil dihapus (soft delete)' }
  }

  async getStats(eventId: string) {
    const [ticketsSold, revenue, orders, checkins] = await Promise.all([
      this.prisma.ticketType.aggregate({
        where: { eventId },
        _sum: { soldCount: true }
      }),
      this.prisma.order.aggregate({
        where: { eventId, status: 'PAID' },
        _sum: { totalAmount: true }
      }),
      this.prisma.order.count({ where: { eventId } }),
      this.prisma.ticket.count({ where: { eventId, status: 'USED' } })
    ])

    return {
      ticketsSold: ticketsSold._sum.soldCount || 0,
      revenue: revenue._sum.totalAmount || 0,
      totalOrders: orders,
      totalCheckins: checkins
    }
  }
}