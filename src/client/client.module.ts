import { Module } from '@nestjs/common'
import { RabbitConfig, RabbitModule } from 'src/rabbit/rabbit.module'
import { SomeConsumer } from './some-consumer'
import { SomeProducer } from './some-producer'

const config: RabbitConfig = {
  url: 'amqp://localhost:5672',
  credentials: {
    user: 'barbora',
    password: 'barbora',
  },
  exchanges: [
    {
      exchange: 'audrius-exchange',
      type: 'direct',
      options: {
        autoDelete: true,
        durable: false,
      },
    },
  ],
  queues: [
    {
      queue: 'audrius-queue',
      bind: [
        {
          source: 'audrius-exchange',
          pattern: '',
        },
      ],
    },
  ],
}

@Module({
  imports: [RabbitModule.configure(config)],
  providers: [SomeConsumer, SomeProducer],
})
export class ClientModule {}
