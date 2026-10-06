import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { Order, OrderStatus, TicketType } from '@prisma/client'
import { generateOrderCode } from '@soundwave/ui'
import { addMinutes } from 'date-fns'

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async createOrder(
    customerId: string,
    eventId: string,
    items: { ticketTypeId: string; quantity: number }[],
    promoCodeId?: string
  ) {
    // Start transaction with row-level locking for anti-overselling
    const order = await this.prisma.$transaction(async (tx) => {
      // Validate event exists and is published
      const event = await tx.event.findUnique({
        where: { id: eventId, status: 'PUBLISHED' }
      })
      if (!event) {
        throw new NotFoundException('Event not found or not published')
      }

      // Validate and process each ticket type
      const processedItems = []
      let subtotal = 0

      for (const item of items) {
        const ticketType = await tx.ticketType.findUnique({
          where: { id: item.ticketTypeId },
          include: { event: true }
        })

        if (!ticketType) {
          throw new NotFoundException(`Ticket type not found: ${item.ticketTypeId}`)
        }

        if (ticketType.eventId !== eventId) {
          throw new ConflictException('Ticket type does not belong to this event')
        }

        if (ticketType.status !== 'AVAILABLE') {
          throw new ConflictException(`Ticket type is not available: ${ticketType.status}`)
        }

        // Anti-overselling: check quota with row-level locking
        if (item.quantity > ticketType.quota - ticketType.soldCount) {
          throw new ConflictException('Insufficient quota for this ticket type')
        }

        // Lock the ticket type row and update sold_count
        await tx.ticketType.update({
          where: { id: item.ticketTypeId },
          data: {
            soldCount: {
              increment: item.quantity
            }
          }
        })

        const price = Number(ticketType.price)
        subtotal += price * item.quantity

        processedItems.push({
          ticketTypeId: item.ticketTypeId,
          quantity: item.quantity,
          unitPrice: price,
          totalPrice: price * item.quantity
        })
      }

      // Calculate total
      const serviceFee = subtotal * 0.05 // 5% service fee
      const taxRate = 0.1 // 10% tax
      const taxAmount = subtotal * taxRate
      const discountAmount = promoCodeId ? 0 : 0 // Will be calculated if promo code provided
      const totalAmount = subtotal + serviceFee + taxAmount - discountAmount

      // Generate order code
      const orderCode = generateOrderCode('EVT')

      // Calculate payment deadline (30 minutes from now)
      const paymentDeadline = addMinutes(new Date(), 30)

      // Create order
      const order = await tx.order.create({
        data: {
          orderCode,
          customerId,
          eventId,
          status: 'PENDING',
          subtotal,
          serviceFee,
          taxAmount,
          discountAmount,
          totalAmount,
          paymentDeadline: new Date(paymentDeadline),
          promoCodeId
        },
        include: {
          event: true,
          items: true
        }
      })

      return { order, processedItems }
    })

    return order
  }

  async findById(id: string, customerId?: string) {
    const where: any = { id }
    if (customerId) where.customerId = customerId

    return this.prisma.order.findUnique({
      where,
      include: {
        event: true,
        items: {
          include: { ticketType: true }
        },
        payments: true
      }
    })
  }

  async listByCustomer(customerId: string, params: { page?: number; limit?: number; status?: string }) {
    const { page = 1, limit = 10, status } = params
    const skip = (page - 1) * limit

    const where: any = { customerId }
    if (status) where.status = status

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          event: { select: { name: true, slug: true } },
          items: { include: { ticketType: true } }
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

  async cancelOrder(id: string, customerId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: { ticketType: true }
        }
      }
    })

    if (!order) {
      throw new NotFoundException('Order not found')
    }

    if (order.customerId !== customerId) {
      throw new ForbiddenException('You do not own this order')
    }

    if (order.status !== 'PENDING') {
      throw new ConflictException('Only pending orders can be cancelled')
    }

    // Return quota and update order status
    await this.prisma.$transaction(async (tx) => {
      // Release quota - decrement sold_count
      for (const item of order.items) {
        await tx.ticketType.update({
          where: { id: item.ticketTypeId },
          data: { soldCount: { decrement: item.quantity } }
        })
      }

      await tx.order.update({
        where: { id },
        data: { status: 'CANCELLED' }
      })
    })

    return { message: 'Order cancelled successfully', order }
  }
}