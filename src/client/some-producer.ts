import { Injectable } from '@nestjs/common'
import { Producer, Publisher } from '../rabbit/publisher'
import { Person } from './Person.dto'

@Injectable()
export class SomeProducer {
  @Producer({ exchange: 'audrius-exchange' })
  private producer: Publisher

  constructor() {
    let i = 0
    setInterval(() => {
      const person: Person = {
        name: `Jonas ${++i}`,
      }
      this.producer.publish(person)
    }, 1000)
  }
}
