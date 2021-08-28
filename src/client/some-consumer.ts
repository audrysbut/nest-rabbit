import { Injectable } from '@nestjs/common'
import { Comsumer } from 'src/rabbit/on-message-received'

@Injectable()
export class SomeConsumer {
  @Comsumer('audrius-queue')
  consumeMessage(content: { name: string }) {
    console.log(`consumer received: '${content.name}'`)
  }
}
