import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { Ticket, TicketStatus, TicketCheckin } from '@prisma/client'

@Injectable()
export class CheckInService {
  constructor(private readonly prisma: PrismaService) {}

  async validateTicket(qrData: any, gateId: string, staffId: string) {
    let payload: any
    try {
      payload = qrData
    } catch (error) {
      throw new NotFoundException('Invalid QR code format')
    }

    const { ticketId } = payload

    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { event: true, order: true }
    })

    if (!ticket) {
      throw new NotFoundException('Ticket not found')
    }

    if (ticket.status !== 'VALID') {
      if (ticket.status === 'USED') {
        return { status: 'used', message: 'Tiket sudah digunakan' }
      }
      if (ticket.status === 'CANCELLED') {
        return { status: 'cancelled', message: 'Tiket dibatalkan' }
      }
      if (ticket.status === 'EXPIRED') {
        return { status: 'expired', message: 'Tiket telah expired' }
      }
      return { status: 'invalid', message: 'Tiket tidak valid' }
    }

    const existingCheckin = await this.prisma.ticketCheckin.findFirst({
      where: { ticketId: ticket.id }
    })

    if (existingCheckin && existingCheckin.status !== 'DUPLICATE') {
      await this.prisma.ticket.update({
        where: { id: ticket.id },
        data: { status: 'USED', checkedInAt: new Date(), checkedInGate: gateId, checkedInBy: staffId }
      })

      await this.prisma.ticketCheckin.create({
        data: {
          ticketId: ticket.id,
          gateId,
          staffId,
          scannedAt: new Date(),
          isOffline: false
        }
      })

      return { status: 'valid', message: 'Check-in berhasil', ticket }
    }

    await this.prisma.ticketCheckin.create({
      data: {
        ticketId: ticket.id,
        gateId,
        staffId,
        scannedAt: new Date(),
        isOffline: false,
        status: 'DUPLICATE'
      }
    })

    return { status: 'duplicate', message: 'Tiket sudah digunakan pada check-in sebelumnya' }
  }

  async offlineSync(checkIns: any[]) {
    const results: any[] = []

    for (const checkIn of checkIns) {
      try {
        const result = await this.validateTicket(checkIn.qrData, checkIn.gateId, checkIn.staffId)
        results.push({ ...checkIn, ...result, synced: true })
      } catch (error) {
        results.push({ ...checkIn, ...{ error: error.message }, synced: false })
      }
    }

    return results
  }
}