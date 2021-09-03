import { Inject, Injectable } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { Channel } from 'amqplib'
import { Queue } from './dto/queue.dto'
import { RabbitConfig } from './dto/rabbit-config.dto'
import { MessageAction } from './message-action'
import { MESSAGE_RECEIVED } from './on-message-received'

@Injectable()
export class MessageConsumptionService {
  constructor(
    @Inject('channel') private readonly channel: Channel,
    @Inject('config') private readonly config: RabbitConfig,
    private readonly emitter: EventEmitter2
  ) {}

  onApplicationBootstrap() {
    this.startConsuming()
  }

  private startConsuming() {
    for (const { queue } of this.config.queues) {
      const eventName = MESSAGE_RECEIVED + queue
      if (this.emitter.hasListeners(eventName)) {
        this.onListenersExist(eventName, queue)
      }
    }
  }

  private onListenersExist(eventName: string, queue: string) {
    const listeners = this.emitter.listeners(eventName)
    if (listeners.length > 0) {
      this.channel.consume(queue, (msg) => {
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
