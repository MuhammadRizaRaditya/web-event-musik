import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name)

  constructor() {
    super({
      log: [
        { level: 'query', emit: 'event' },
        { level: 'error', emit: 'stdout' },
        { level: 'warn', emit: 'stdout' }
      ],
      errorFormat: 'pretty'
    })
  }

  async onModuleInit() {
    await this.$connect()
    this.logger.log('Database connected successfully')

    // Log slow queries in development
    if (process.env.NODE_ENV === 'development') {
      this.$on('query', (e) => {
        if (e.duration > 1000) {
          this.logger.warn(`Slow query: ${e.duration}ms - ${e.query.substring(0, 200)}...`)
        }
      })
    }
  }

  async onModuleDestroy() {
    await this.$disconnect()
    this.logger.log('Database disconnected')
  }

  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot clean database in production')
    }
    const models = Reflect.ownKeys(this).filter(
      (key) => typeof key === 'string' && !key.startsWith('_') && !key.startsWith('$')
    )
    for (const model of models) {
      if (typeof this[model] === 'object' && this[model] !== null && 'deleteMany' in this[model]) {
        await this[model].deleteMany()
      }
    }
  }

  // Helper for transaction with retry
  async transactionWithRetry<T>(
    fn: (prisma: PrismaClient) => Promise<T>,
    maxRetries = 3
  ): Promise<T> {
    let lastError: Error
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await this.$transaction(fn, {
          maxWait: 5000,
          timeout: 10000,
          isolationLevel: 'Serializable'
        })
      } catch (error) {
        lastError = error as Error
        if (error.code === 'P2034' || error.code === 'P2033') {
          // Transaction conflict or deadlock - retry
          await new Promise(resolve => setTimeout(resolve, Math.random() * 100 * (i + 1)))
          continue
        }
        throw error
      }
    }
    throw lastError!
  }
}