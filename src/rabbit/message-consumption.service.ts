import { Inject, Injectable } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { Channel, ConsumeMessage } from 'amqplib'
import { RabbitConfig } from './dto/rabbit-config.dto'
import { MessageAction } from './message-action'
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
        const listeners = this.emitter.listeners(eventName)
        if (listeners.length > 0) {
          this.channel.consume(q.queue, (msg) => {
            const content = JSON.parse(msg.content.toString())
            const contentToPublish = content.message ? content.message : content

            const actions = new MessageAction(this.channel, msg)
            try {
              for (const listener of listeners) {
                listener(contentToPublish, actions)
              }
              actions.acn()
            } catch (err) {
              actions.nack()
            }
          })
        }
      }
    }
  }
}
