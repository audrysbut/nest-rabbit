import { Module } from "@nestjs/common";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { SomeConsumer } from "src/clientModule/some-consumer";
import { SomeProducer } from "src/clientModule/consumer/some-producer";
import { RabbitmqService } from "./rabbitmq/rabbitmq.service";

@Module({
  imports: [EventEmitterModule.forRoot()],
  providers: [RabbitmqService, SomeConsumer, SomeProducer],
})
export class RabbitModule {}
