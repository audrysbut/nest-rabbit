import { Injectable } from '@nestjs/common'
import { Producer, Publisher } from '../rabbit/publisher'
import { Person } from './Person.dto'

@Injectable()
export class SomeProducer {
  @Producer({ exchange: 'audrius-exchange' })
  private producer: Publisher

  constructor() {
    setInterval(() => {
      const person: Person = {
        name: 'Jonas',
      }
      this.producer.publish(person)
    }, 5000)
  }
}
