import { Module } from "@nestjs/common";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { SomeConsumer } from "src/consumer/some-consumer";
import { SomeProducer } from "src/consumer/some-producer";
import { RabbitmqService } from "./rabbitmq/rabbitmq.service";

@Module({
  imports: [EventEmitterModule.forRoot()],
  providers: [RabbitmqService, SomeConsumer, SomeProducer],
})
export class RabbitModule {}
