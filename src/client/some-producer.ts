import { Injectable } from '@nestjs/common'
import { ContentProducer, Producer } from 'src/rabbit/content-producer'

@Injectable()
export class SomeProducer {
  constructor(
    @Producer({ exchange: 'audrius-exchange' }) producer: ContentProducer
  ) {
    setInterval(() => {
      const person = {
        name: 'Jonas',
      }
      producer.publish(person)
    }, 2000)
  }
}
