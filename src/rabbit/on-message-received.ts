import { OnEvent } from "@nestjs/event-emitter";

export function Comsumer(queueName: string) {
  return OnEvent(queueName);
}
