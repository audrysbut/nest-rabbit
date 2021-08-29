import { Inject, Injectable } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { Channel, ConsumeMessage } from 'amqplib'
import { RabbitConfig } from './dto/rabbit-config.dto'
import { MESSAGE_RECEIVED } from './on-message-received'

@Injectable()
export class MessageConsumptionService {
  constructor(
    @Inject('channel') private readonly channel: Channel,
    @Inject('config') private readonly config: RabbitConfig,
    private readonly emitter: EventEmitter2
  ) {
    setTimeout(() => this.startConsuming(), 500)
  }

  private startConsuming() {
    for (const q of this.config.queues) {
      const eventName = MESSAGE_RECEIVED + q.queue
      if (this.emitter.hasListeners(eventName)) {
        this.channel.consume(q.queue, (msg) =>
          this.consumeMessage(eventName, msg)
        )
      }
    }
  }

  private consumeMessage(eventName: string, msg: ConsumeMessage) {
    const content = JSON.parse(msg.content.toString())
    const contentToPublish = content.message ? content.message : content
    this.emitter.emit(eventName, contentToPublish)
    this.channel.ack(msg)
  }
}
