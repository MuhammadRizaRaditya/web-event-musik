import { IsString, IsArray, IsOptional, IsInt, Min, Max } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateOrderDto {
  @ApiProperty({ example: 'evt_123' })
  @IsString()
  eventId: string

  @ApiProperty({ type: ['object'], example: '[{"ticketTypeId": "tt_1", "quantity": 2}]' })
  @IsArray()
  @IsString({ each: true })
  items: { ticketTypeId: string; quantity: number }[]

  @ApiProperty({ example: 'PROMO10', required: false })
  @IsOptional()
  @IsString()
  promoCode?: string
}