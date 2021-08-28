import { Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import * as Amqp from "amqplib";

@Injectable()
export class RabbitmqService {
  private _connection: Amqp.Connection;
  private _channel: Amqp.Channel;

  constructor(private readonly eventEmitter: EventEmitter2) {}

  async onModuleInit() {
    await this.initialize();
  }
  private async initialize() {
    try {
      const credentials = Amqp.credentials.plain("barbora", "barbora");
      this._connection = await Amqp.connect("amqp://localhost:5672", {
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
    this._channel.assertExchange("audrius-exchange", "direct", {
      autoDelete: true,
      durable: false,
    });
    this._channel.assertQueue("audrius-queue", {
      // autoDelete: true,
      // durable: false,
    });
    this._channel.bindQueue("audrius-queue", "audrius-exchange", "");
    this._channel.consume("audrius-queue", (msg) => {
      // console.log(`consumed from 'audrius-queue': ${msg.content}`)
      this.eventEmitter.emit("audrius-queue", msg.content);
      this._channel.ack(msg);
    });

    // for await (const exchange of this.setupOptions.exchanges) {
    //   await this._channel.assertExchange(
    //     exchange.name,
    //     exchange.type,
    //     exchange.options
    //   )

    //   if (exchange.bindQueues) {
    //     for await (const queue of exchange.bindQueues) {
    //       await this._channel.assertQueue(queue.name, queue.options)
    //       if (queue.args) {
    //         for await (const args of queue.args) {
    //           await this._channel.bindQueue(queue.name, exchange.name, '', args)
    //         }
    //       } else {
    //         await this._channel.bindQueue(queue.name, exchange.name, '')
    //       }
    //     }
    //   }
    // }

    // logger.info('connected to RabbitMq')
  }
}
