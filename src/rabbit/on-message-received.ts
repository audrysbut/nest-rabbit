import { OnEvent } from '@nestjs/event-emitter'

export const MESSAGE_RECEIVED = 'rabbit.message.received.'
export function Comsumer(queueName: string) {
  return OnEvent(MESSAGE_RECEIVED + queueName)
}
