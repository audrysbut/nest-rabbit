import { Inject } from '@nestjs/common'
import { Channel, Options } from 'amqplib'
import { RabbitModule } from './rabbit.module'

class PublisherOptions {
  queue?: string
  exchange?: string
  options?: Options.Publish
  routingKey?: string
}

export function Producer({ queue, exchange }: PublisherOptions) {
  if (queue) {
    return Inject(RabbitModule.QUEUE_PUBLISHER + queue)
  }

  if (exchange) {
    return Inject(RabbitModule.EXCHANGE_PUBLISHER + exchange)
  }

  throw new Error(`Wrong provider configuration`)
}

export class Publisher {
  public publish: (content: any) => void

  constructor(private channel: Channel, producerOptions: PublisherOptions) {
    const { queue, options } = producerOptions
    if (queue) {
      this.publish = (data) => {
        const buffer = this.makeContent(data)
        this.channel.sendToQueue(queue, buffer, options)
      }
    }

    const { exchange, routingKey } = producerOptions
    if (exchange) {
      this.publish = (content) => {
        const data = this.makeContent(content)
        this.channel.publish(exchange, routingKey, data, options)
      }
    }

    if (!this.publish) {
      throw new Error('Wrong publisher configuration provided')
    }
  }

  private makeContent(data: any): Buffer {
    const isObject = typeof data === 'object' && data !== null
    const content = isObject ? JSON.stringify(data) : `{ "message": "${data}"}`
    return Buffer.from(content)
  }
}
