import { Module } from "@nestjs/common";
import { RabbitModule } from "src/rabbit/rabbit.module";
import { SomeConsumer } from "./some-consumer";
import { SomeProducer } from "./some-producer";

@Module({
  imports: [
    RabbitModule.configure({
      url: "amqp://localhost:5672",
      credentials: {
        user: "barbora",
        password: "barbora",
      },
    }),
  ],
  providers: [SomeConsumer, SomeProducer],
})
export class ClientModule {}
