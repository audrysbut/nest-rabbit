import { DynamicModule, Module, Provider } from '@nestjs/common'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { Channel, credentials, connect, Connection } from 'amqplib'
import { Publisher } from './publisher'
import { InfrastructureSetupService } from './infrastructure-setup.service'
import { MessageConsumptionService } from './message-consumption.service'
import { Exchange } from './dto/exchange.dto'
import { Queue } from './dto/queue.dto'
import { RabbitConfig } from './dto/rabbit-config.dto'

function killApp(err: Error) {
  if (err) {
    process.exit()
  }
}

async function getConnection(config: RabbitConfig): Promise<Connection> {
  try {
    const {
      url,
      credentials: { user, password },
    } = config

    const cred = credentials.plain(user, password)
    const connection = await connect(url, {
      credentials: cred,
    })
    connection.on('close', (err) => {
      killApp(err)
    })
    return connection
  } catch (err) {
    killApp(err)
  }
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
      useFactory: (channel: Channel) => {
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
  for (const { exchange } of exchanges) {
    const injectable = RabbitModule.EXCHANGE_PUBLISHER + exchange
    providers.push({
      provide: injectable,
      inject: ['channel'],
      useFactory: (channel: Channel) => {
        return new Publisher(channel, {
          exchange,
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

  static configure(config: RabbitConfig): DynamicModule {
    const exports: string[] = []
    const providers: Provider[] = [
      {
        provide: 'channel',
        useFactory: async () => {
          const connection = await getConnection(config)
          const channel = await connection.createChannel()
          return channel
        },
      },
      {
        provide: 'config',
        useValue: config,
      },
      InfrastructureSetupService,
      MessageConsumptionService,
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
