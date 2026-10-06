import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name)

  constructor() {
    super({
      log: [
        { level: 'error', emit: 'stdout' },
        { level: 'warn', emit: 'stdout' }
      ],
      errorFormat: 'pretty'
    })
  }

  async onModuleInit() {
    await this.$connect()
    this.logger.log('Database connected successfully')
  }

  async onModuleDestroy() {
    await this.$disconnect()
    this.logger.log('Database disconnected')
  }

  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot clean database in production')
    }
    // Delete all data in reverse dependency order
    await this.ticket.deleteMany()
    await this.ticketType.deleteMany()
    await this.event.deleteMany()
    await this.order.deleteMany()
    await this.payment.deleteMany()
    await this.promoCode.deleteMany()
    await this.venue.deleteMany()
  }
}