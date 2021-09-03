import { Injectable } from '@nestjs/common'
import { Comsumer } from 'src/rabbit/consumer'
import { Person } from './Person.dto'

@Injectable()
export class SomeConsumer {
  @Comsumer('audrius-queue')
  consumeMessage(person: Person) {
    console.log(`consumer received: '${person.name}'`)
  }
}
