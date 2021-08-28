import { Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import * as Amqp from "amqplib";
import { RabbitConfig } from "./rabbit.module";

@Injectable()
export class RabbitmqService {
  private _connection: Amqp.Connection;
  private _channel: Amqp.Channel;

  constructor(
    private readonly config: RabbitConfig,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async onModuleInit() {
    await this.initialize();
  }
  private async initialize() {
    try {
      const {
        url,
        credentials: { user, password },
      } = this.config;

      const credentials = Amqp.credentials.plain(user, password);
      this._connection = await Amqp.connect(url, {
        credentials,
      });
      await this.setupInfrastructure();
      this._connection.on("close", (err) => {
        this.killApp(err);
      });
    } catch (err) {
      this.killApp(err);
    }
  }

  private killApp(err: Error) {
    if (err) {
      // logger.info('Killing payments microservice due to rabbitMq error')
      // logger.error(err)
      process.exit();
    }
  }

  private async setupInfrastructure() {
    this._channel = await this._connection.createChannel();
    for (const ex of this.config.exchanges) {
      const { exchange, type, options } = ex;
      this._channel.assertExchange(exchange, type, options);
    }

    for (const q of this.config.queues) {
      const { queue, options, bind } = q;
      this._channel.assertQueue(queue, options);

      for (const b of bind) {
        const { source, pattern, args } = b;
        this._channel.bindQueue(queue, source, pattern, args);
      }

      this._channel.consume(queue, (msg) => {
        this.eventEmitter.emit(queue, msg.content);
        this._channel.ack(msg);
      });
    }
  }
}
