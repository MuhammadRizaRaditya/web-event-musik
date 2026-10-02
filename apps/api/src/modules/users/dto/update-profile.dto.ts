import { IsString, IsOptional, MinLength, MaxLength, Matches, IsUrl } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class UpdateProfileDto {
  @ApiProperty({ example: 'Budi Santoso', required: false })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string

  @ApiProperty({ example: '081234567890', required: false })
  @IsOptional()
  @IsString()
  @Matches(/^(\+62|62|0)8[1-9][0-9]{7,9}$/, {
    message: 'Format nomor telepon Indonesia tidak valid'
  })
  phone?: string

  @ApiProperty({ example: 'https://example.com/avatar.jpg', required: false })
  @IsOptional()
  @IsUrl()
  avatarUrl?: string
}