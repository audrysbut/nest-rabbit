import { DynamicModule, Module } from "@nestjs/common";
import { EventEmitter2, EventEmitterModule } from "@nestjs/event-emitter";
import { RabbitmqService } from "./rabbitmq.service";

export interface RabbitConfig {
  url: string;
  credentials: {
    user: string;
    password: string;
  };
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
