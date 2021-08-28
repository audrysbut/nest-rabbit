import { Injectable } from "@nestjs/common";
import { OnMessageReceived } from "src/rabbit/rabbitmq/on-message-received";

@Injectable()
export class SomeConsumer {
  @OnMessageReceived("audrius-queue")
  consumeMessage(content: string) {
    console.log(`consumer received: '${content}'`);
  }
}
