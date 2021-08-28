import { OnEvent } from "@nestjs/event-emitter";

export function OnMessageReceived(queueName: string) {
  return OnEvent(queueName);
}
