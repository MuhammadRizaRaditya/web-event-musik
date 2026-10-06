import { Controller, Post, Body, Get, Param, UseGuards, Request, HttpCode } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger'
import { PrismaService } from '../../prisma/prisma.service'
import { PaymentsService } from './payments.service'
import { CreatePaymentDto } from './dto/create-payment.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { Permissions } from '../auth/decorators/permissions.decorator'

@ApiTags('payments')
@Controller('payments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly prisma: PrismaService
  ) {}

  @Post()
  @Roles('customer')
  @Permissions('payments:create')
  @ApiOperation({ summary: 'Create payment intent' })
  async create(
    @Body() createPaymentDto: CreatePaymentDto,
    @Request() req: any
  ) {
    return this.paymentsService.createPayment(
      req.user.id,
      createPaymentDto.gateway,
      createPaymentDto.amount,
      createPaymentDto.method
    )
  }

  @Post('webhook')
  @HttpCode(200)
  @ApiOperation({ summary: 'Payment webhook handler' })
  async webhook(@Body() body: any, @Request() req: any) {
    // Verify webhook signature (in production)
    // For now, just process the payment status
    const { gateway, gatewayTransactionId, status } = body

    return this.paymentsService.verifyPaymentStatus(gateway, gatewayTransactionId)
  }

  @Get('order/:orderId')
  @Roles('customer')
  @Permissions('payments:read')
  @ApiOperation({ summary: 'Get payment status for order' })
  async getPaymentStatus(@Param('orderId') orderId: string, @Request() req: any) {
    const payment = await this.prisma.payment.findFirst({
      where: { orderId },
      include: { order: true }
    })

    return payment
  }

  @Get('order/:orderId/tickets')
  @Roles('customer')
  @Permissions('tickets:read')
  @ApiOperation({ summary: 'Get e-tickets for order' })
  async getTickets(@Param('orderId') orderId: string) {
    const tickets = await this.prisma.ticket.findMany({
      where: { orderId },
      include: { ticketType: true, event: true }
    })

    return tickets
  }
}