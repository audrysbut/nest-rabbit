import { DynamicModule, Module } from "@nestjs/common";
import { EventEmitter2, EventEmitterModule } from "@nestjs/event-emitter";
import { Options } from "amqplib";
import { RabbitmqService } from "./rabbitmq.service";

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
@Module({})
export class RabbitModule {
  static configure(config: RabbitConfig): DynamicModule {
    return {
      imports: [EventEmitterModule.forRoot()],
      module: RabbitModule,
      providers: [
        {
          provide: RabbitmqService,
          inject: [EventEmitter2],
          useFactory: (emitter: EventEmitter2) => {
            return new RabbitmqService(config, emitter);
          },
        },
      ],
    };
  }
}
