import { Injectable } from '@nestjs/common'
import { Producer, Publisher } from '../rabbit/publisher'

@Injectable()
export class SomeProducer {
  constructor(@Producer({ exchange: 'audrius-exchange' }) producer: Publisher) {
    setInterval(() => {
      const person = {
        name: 'Jonas',
      }
      producer.publish(person)
    }, 2000)
  }
}
