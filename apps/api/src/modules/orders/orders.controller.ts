import { Controller, Post, Body, Get, Param, UseGuards, Query, Request } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger'
import { OrdersService } from './orders.service'
import { CreateOrderDto } from './dto/create-order.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { Permissions } from '../auth/decorators/permissions.decorator'

@ApiTags('orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Roles('customer')
  @Permissions('orders:create')
  @ApiOperation({ summary: 'Create new order' })
  async create(
    @Body() createOrderDto: CreateOrderDto,
    @Request() req: any
  ) {
    return this.ordersService.createOrder(
      req.user.id,
      createOrderDto.eventId,
      createOrderDto.items,
      createOrderDto.promoCode
    )
  }

  @Get()
  @Roles('customer')
  @Permissions('orders:read')
  @ApiOperation({ summary: 'Get user orders' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  async listByCustomer(
    @Request() req: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string
  ) {
    return this.ordersService.listByCustomer(req.user.id, { page, limit, status })
  }

  @Get(':id')
  @Roles('customer')
  @Permissions('orders:read')
  @ApiOperation({ summary: 'Get order by ID' })
  async getById(@Param('id') id: string, @Request() req: any) {
    return this.ordersService.findById(id, req.user.id)
  }

  @Post(':id/cancel')
  @Roles('customer')
  @Permissions('orders:cancel')
  @ApiOperation({ summary: 'Cancel order' })
  async cancel(@Param('id') id: string, @Request() req: any) {
    return this.ordersService.cancelOrder(id, req.user.id)
  }
}