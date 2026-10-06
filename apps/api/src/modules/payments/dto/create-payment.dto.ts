import { IsString, IsOptional, IsInt, IsEnum } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreatePaymentDto {
  @ApiProperty({ example: 'midtrans' })
  @IsString()
  gateway: 'midtrans' | 'xendit'

  @ApiProperty({ example: 500000 })
  @IsInt()
  amount: number

  @ApiProperty({ example: 'va' })
  @IsString()
  method: 'va' | 'qris' | 'ewallet' | 'card'
}