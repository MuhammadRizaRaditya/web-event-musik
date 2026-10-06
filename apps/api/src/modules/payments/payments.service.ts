import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { Payment, PaymentStatus } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'
import { addMinutes } from 'date-fns'

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async createPayment(orderId: string, gateway: 'midtrans' | 'xendit', amount: number, method: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { event: true }
    })

    if (!order) {
      throw new NotFoundException('Order not found')
    }

    if (order.status !== 'PENDING') {
      throw new ConflictException('Order is not in pending status')
    }

    const idempotencyKey = uuidv4()

    const payment = await this.prisma.payment.create({
      data: {
        orderId,
        gateway,
        amount,
        method,
        status: 'PENDING',
        idempotencyKey,
        gatewayTransactionId: uuidv4() // Generate transaction ID
      } as any,
    })

    return {
      payment,
      order,
      idempotencyKey
    }
  }

  async verifyPaymentStatus(gateway: 'midtrans' | 'xendit', gatewayTransactionId: string) {
    // In production, this would call the gateway's API to verify
    // For now, we'll simulate the verification
    const payment = await this.prisma.payment.findFirst({
      where: { gatewayTransactionId }
    })

    if (!payment) {
      return { valid: false, message: 'Payment not found' }
    }

    // Simulate verification - in production, this would be the actual gateway API call
    const isValid = Math.random() > 0.1 // Simulate 90% success rate

    if (isValid) {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'SUCCESS' }
      })

      // Update order status
      await this.prisma.order.update({
        where: { id: payment.orderId },
        data: { status: 'PAID', paidAt: new Date() }
      })

      // Generate e-tickets
      await this.generateETickets(payment.orderId)

      return { valid: true, payment }
    } else {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED' }
      })

      return { valid: false, message: 'Payment verification failed' }
    }
  }

  private async generateETickets(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        event: true,
        items: {
          include: { ticketType: true }
        }
      }
    })

    if (!order) {
      throw new NotFoundException('Order not found')
    }

    // Generate tickets for each order item
    for (const item of order.items) {
      const event = order.event
      const ticketType = item.ticketType

      for (let i = 0; i < item.quantity; i++) {
        const ticketNumber = `EVT-${event.id}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
        const jwtPayload = {
          ticketId: uuidv4(),
          tno: ticketNumber,
          hn: 'Holder Name', // Will be filled from order data
          eid: event.id,
          tty: ticketType.name,
          exp: event.endDate?.getTime() || Date.now() + 30 * 24 * 60 * 60 * 1000,
          iat: Date.now()
        }
        const qrCodeData = JSON.stringify(jwtPayload) // Convert to string for Prisma String field

        // Sign JWT with private key
        // const qrToken = sign(jwtPayload, privateKey, { algorithm: 'RS256' })
        // For now, we'll just create the ticket record

        await this.prisma.ticket.create({
          data: {
            ticketNumber,
            orderId,
            ticketTypeId: item.ticketTypeId,
            eventId: event.id,
            holderName: 'Holder Name', // Will be filled from order data
            holderEmail: 'holder@example.com', // Will be filled from order data
            qrCodeData: qrCodeData, // In production, this would be the signed JWT
            status: 'VALID'
          }
        })
      }
    }
  }

  async refundPayment(orderId: string, amount: number, reason: string, adminId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: { ticketType: true }
        }
      }
    })

    if (!order) {
      throw new NotFoundException('Order not found')
    }

    if (order.status !== 'PAID') {
      throw new ConflictException('Only paid orders can be refunded')
    }

    const payment = await this.prisma.payment.findFirst({
      where: { orderId, status: 'SUCCESS' }
    })

    if (!payment) {
      throw new NotFoundException('Payment record not found')
    }

    // Create refund record
    const refund = await this.prisma.refund.create({
      data: {
        orderId,
        amount,
        reason,
        status: 'REQUESTED',
        processedBy: adminId
      }
    })

    // Update payment status
    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'REFUNDED' }
    })

    // Update order status
    await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'REFUNDED' }
    })

    // Release quota
    for (const item of order.items) {
      await this.prisma.ticketType.update({
        where: { id: item.ticketTypeId },
        data: { soldCount: { decrement: item.quantity } }
      })
    }

    return { refund, message: 'Refund initiated successfully' }
  }
}