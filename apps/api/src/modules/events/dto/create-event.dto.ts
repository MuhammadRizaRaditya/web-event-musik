import { IsString, IsOptional, IsDateString, IsEnum, MinLength, MaxLength, IsUrl } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { EventStatus } from '@prisma/client'

export class CreateEventDto {
  @ApiProperty({ example: 'Soundwave Fest 2026' })
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  name: string

  @ApiProperty({ example: 'Festival musik terbesar tahun 2026', required: false })
  @IsOptional()
  @IsString()
  description?: string

  @ApiProperty({ example: '2026-12-31T19:00:00+07:00' })
  @IsDateString()
  startDate: string

  @ApiProperty({ example: '2027-01-01T02:00:00+07:00' })
  @IsDateString()
  endDate: string

  @ApiProperty({ example: 'venue-uuid' })
  @IsString()
  venueId: string

  @ApiProperty({ example: 'https://example.com/banner.jpg', required: false })
  @IsOptional()
  @IsUrl()
  bannerUrl?: string

  @ApiProperty({ example: 'https://example.com/poster.jpg', required: false })
  @IsOptional()
  @IsUrl()
  posterUrl?: string

  @ApiProperty({ example: 'Syarat dan ketentuan event...', required: false })
  @IsOptional()
  @IsString()
  termsConditions?: string

  @ApiProperty({ example: 'Kebijakan refund...', required: false })
  @IsOptional()
  @IsString()
  refundPolicy?: string

  @ApiProperty({ example: 'Soundwave Fest 2026 - Festival Musik Terbaik', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  seoTitle?: string

  @ApiProperty({ example: 'Beli tiket Soundwave Fest 2026 secara online...', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  seoDescription?: string
}