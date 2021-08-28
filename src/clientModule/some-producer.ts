import { Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";

@Injectable()
export class SomeProducer {
  constructor(eventEmitter: EventEmitter2) {
    let i = 0;
    setInterval(() => {
      eventEmitter.emit("audrius-queue", `message ${++i}`);
    }, 2000);
  }
}
