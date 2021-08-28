import { Inject, Injectable } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { Channel } from 'amqplib'
import { RabbitConfig } from './dto/rabbit-config.dto'
import { MESSAGE_RECEIVED } from './on-message-received'

@Injectable()
export class MessageConsumptionService {
  constructor(
    @Inject('channel') private readonly channel: Channel,
    @Inject('config') private readonly config: RabbitConfig,
    private readonly emitter: EventEmitter2
  ) {
    this.consume()
  }
  private consume() {
    for (const q of this.config.queues) {
      this.channel.consume(q.queue, (msg) => {
        const content = JSON.parse(msg.content.toString())
        const contentToPublish = content.message ? content.message : content
        this.emitter.emit(MESSAGE_RECEIVED + q.queue, contentToPublish)
        this.channel.ack(msg)
      })
    }
  }
}
