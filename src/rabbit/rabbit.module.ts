import { DynamicModule, Module, Provider } from '@nestjs/common'
import { EventEmitter2, EventEmitterModule } from '@nestjs/event-emitter'
import { Options } from 'amqplib'
import * as Amqp from 'amqplib'
import { MESSAGE_RECEIVED } from './on-message-received'
import { Publisher } from './publisher'

class Exchange {
  exchange: string
  type: 'direct' | 'topic' | 'headers' | 'fanout' | 'match' | string
  options?: Options.AssertExchange
}

class BindQueue {
  source: string
  pattern: string
  args?: any
}
class Queue {
  queue: string
  options?: Options.AssertQueue
  bind?: BindQueue[] = []
}

export class RabbitConfig {
  url: string
  credentials: {
    user: string
    password: string
  }
  exchanges?: Exchange[] = []
  queues?: Queue[] = []
}

function killApp(err: Error) {
  if (err) {
    process.exit()
  }
}

async function getConnection(config: RabbitConfig): Promise<Amqp.Connection> {
  try {
    const {
      url,
      credentials: { user, password },
    } = config

    const credentials = Amqp.credentials.plain(user, password)
    const connection = await Amqp.connect(url, {
      credentials,
    })
    connection.on('close', (err) => {
      killApp(err)
    })
    return connection
  } catch (err) {
    killApp(err)
  }
}

async function setupInfrastructure(
  connection: Amqp.Connection,
  eventEmitter: EventEmitter2,
  config: RabbitConfig
): Promise<Amqp.Channel> {
  const channel = await connection.createChannel()
  for (const ex of config.exchanges) {
    const { exchange, type, options } = ex
    channel.assertExchange(exchange, type, options)
  }

  for (const q of config.queues) {
    const { queue, options, bind } = q
    channel.assertQueue(queue, options)

    for (const b of bind) {
      const { source, pattern, args } = b
      channel.bindQueue(queue, source, pattern, args)
    }

    channel.consume(queue, (msg) => {
      const content = JSON.parse(msg.content.toString())
      const contentToPublish = content.message ? content.message : content
      eventEmitter.emit(MESSAGE_RECEIVED + queue, contentToPublish)
      channel.ack(msg)
    })
  }
  return channel
}

function makeProducersForQueues(
  queues: Queue[],
  providers: Provider<any>[],
  exports: string[]
) {
  for (const q of queues) {
    const injectable = RabbitModule.QUEUE_PUBLISHER + q.queue
    providers.push({
      provide: injectable,
      inject: ['channel'],
      useFactory: (channel: Amqp.Channel) => {
        return new Publisher(channel, {
          queue: q.queue,
        })
      },
    })
    exports.push(injectable)
  }
}

function makeProducersForExchanges(
  exchanges: Exchange[],
  providers: Provider<any>[],
  exports: string[]
) {
  for (const ex of exchanges) {
    const injectable = RabbitModule.EXCHANGE_PUBLISHER + ex.exchange
    providers.push({
      provide: injectable,
      inject: ['channel'],
      useFactory: (channel: Amqp.Channel) => {
        return new Publisher(channel, {
          exchange: ex.exchange,
        })
      },
    })
    exports.push(injectable)
  }
}
@Module({})
export class RabbitModule {
  public static EXCHANGE_PUBLISHER = 'rabbit.exchange.'
  public static QUEUE_PUBLISHER = 'rabbit.queue.'
  static async configure(config: RabbitConfig): Promise<DynamicModule> {
    const connection = await getConnection(config)
    const exports: string[] = []
    const providers: Provider[] = [
      {
        provide: 'channel',
        inject: [EventEmitter2],
        useFactory: async (emitter: EventEmitter2) => {
          const res = await setupInfrastructure(connection, emitter, config)
          return res
        },
      },
    ]

    makeProducersForQueues(config.queues, providers, exports)
    makeProducersForExchanges(config.exchanges, providers, exports)

    return {
      imports: [EventEmitterModule.forRoot()],
      module: RabbitModule,
      providers,
      exports,
    }
  }
}
