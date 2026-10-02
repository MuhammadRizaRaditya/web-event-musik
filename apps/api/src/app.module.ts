import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'
import { APP_GUARD } from '@nestjs/core'
import { PrismaModule } from './prisma/prisma.module'
import { AuthModule } from './modules/auth/auth.module'
import { UsersModule } from './modules/users/users.module'
import { EventsModule } from './modules/events/events.module'
import { ArtistsModule } from './modules/artists/artists.module'
import { TicketTypesModule } from './modules/ticket-types/ticket-types.module'
import { OrdersModule } from './modules/orders/orders.module'
import { PaymentsModule } from './modules/payments/payments.module'
import { TicketsModule } from './modules/tickets/tickets.module'
import { CheckInModule } from './modules/check-in/check-in.module'
import { PromoModule } from './modules/promo/promo.module'
import { NotificationsModule } from './modules/notifications/notifications.module'
import { ReportsModule } from './modules/reports/reports.module'
import { AdminModule } from './modules/admin/admin.module'
import { GalleryModule } from './modules/gallery/gallery.module'
import { PlaylistsModule } from './modules/playlists/playlists.module'
import { VenuesModule } from './modules/venues/venues.module'
import { SchedulesModule } from './modules/schedules/schedules.module'
import { MemoriesModule } from './modules/memories/memories.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      validate: (config) => {
        const required = [
          'DATABASE_URL',
          'JWT_SECRET',
          'JWT_REFRESH_SECRET',
          'JWT_PRIVATE_KEY',
          'JWT_PUBLIC_KEY'
        ]
        for (const key of required) {
          if (!config[key]) {
            throw new Error(`Missing required env var: ${key}`)
          }
        }
        return config
      }
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100
      }
    ]),
    PrismaModule,
    AuthModule,
    UsersModule,
    EventsModule,
    ArtistsModule,
    VenuesModule,
    SchedulesModule,
    TicketTypesModule,
    OrdersModule,
    PaymentsModule,
    TicketsModule,
    CheckInModule,
    PromoModule,
    NotificationsModule,
    ReportsModule,
    AdminModule,
    GalleryModule,
    PlaylistsModule,
    MemoriesModule
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    }
  ]
})
export class AppModule {}