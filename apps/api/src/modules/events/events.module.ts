import { Module } from '@nestjs/common'
import { EventsService } from './events.service'
import { EventsController } from './events.controller'
import { EventsPublicController } from './events-public.controller'

@Module({
  controllers: [EventsController, EventsPublicController],
  providers: [EventsService],
  exports: [EventsService]
})
export class EventsModule {}