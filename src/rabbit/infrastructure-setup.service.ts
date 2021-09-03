import { Inject, Injectable } from '@nestjs/common'
import { Channel } from 'amqplib'
import { RabbitConfig } from './dto/rabbit-config.dto'

@Injectable()
export class InfrastructureSetupService {
  constructor(
    @Inject('channel') private readonly channel: Channel,
    @Inject('config') private readonly config: RabbitConfig
  ) {
    this.setupInfrastructure()
  }

  private setupInfrastructure() {
    for (const ex of this.config.exchanges) {
      const { exchange, type, options } = ex
      this.channel.assertExchange(exchange, type, options)
    }

    for (const q of this.config.queues) {
      const { queue, options, bind } = q
      this.channel.assertQueue(queue, options)

      for (const b of bind) {
        const { source, pattern, args } = b
        this.channel.bindQueue(queue, source, pattern, args)
      }
    }
  }
}
