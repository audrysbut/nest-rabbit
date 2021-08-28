import { DynamicModule, Module } from "@nestjs/common";
import { EventEmitter2, EventEmitterModule } from "@nestjs/event-emitter";
import { Options } from "amqplib";
import * as Amqp from "amqplib";
import { MESSAGE_RECEIVED } from "./on-message-received";

class Exchange {
  exchange: string;
  type: "direct" | "topic" | "headers" | "fanout" | "match" | string;
  options?: Options.AssertExchange;
}

class BindQueue {
  source: string;
  pattern: string;
  args?: any;
}
class Queue {
  queue: string;
  options?: Options.AssertQueue;
  bind?: BindQueue[] = [];
}

export class RabbitConfig {
  url: string;
  credentials: {
    user: string;
    password: string;
  };
  exchanges?: Exchange[] = [];
  queues?: Queue[] = [];
}

function killApp(err: Error) {
  if (err) {
    // logger.info('Killing payments microservice due to rabbitMq error')
    // logger.error(err)
    process.exit();
  }
}

async function getConnection(config: RabbitConfig): Promise<Amqp.Connection> {
  try {
    const {
      url,
      credentials: { user, password },
    } = config;

    const credentials = Amqp.credentials.plain(user, password);
    const connection = await Amqp.connect(url, {
      credentials,
    });
    // await this.setupInfrastructure();
    connection.on("close", (err) => {
      killApp(err);
    });
    return connection;
  } catch (err) {
    killApp(err);
  }
}

async function setupInfrastructure(
  connection: Amqp.Connection,
  eventEmitter: EventEmitter2,
  config: RabbitConfig
): Promise<Amqp.Channel> {
  const channel = await connection.createChannel();
  for (const ex of config.exchanges) {
    const { exchange, type, options } = ex;
    channel.assertExchange(exchange, type, options);
  }

  for (const q of config.queues) {
    const { queue, options, bind } = q;
    channel.assertQueue(queue, options);

    for (const b of bind) {
      const { source, pattern, args } = b;
      channel.bindQueue(queue, source, pattern, args);
    }

    channel.consume(queue, (msg) => {
      eventEmitter.emit(MESSAGE_RECEIVED + queue, msg.content);
      channel.ack(msg);
    });
  }
  return channel;
}

@Module({})
export class RabbitModule {
  static async configure(config: RabbitConfig): Promise<DynamicModule> {
    const connection = await getConnection(config);
    return {
      imports: [EventEmitterModule.forRoot()],
      module: RabbitModule,
      providers: [
        {
          provide: "channel",
          inject: [EventEmitter2],
          useFactory: async (emitter: EventEmitter2) => {
            const res = await setupInfrastructure(connection, emitter, config);
            return res;
          },
        },
      ],
    };
  }
}
