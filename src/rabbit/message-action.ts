import { Channel, ConsumeMessage } from 'amqplib'

export class MessageAction {
  private acnActionExecuted = false
  constructor(
    private readonly channel: Channel,
    private readonly message: ConsumeMessage
  ) {}

  acn() {
    if (!this.acnActionExecuted) {
      this.channel.ack(this.message)
      this.acnActionExecuted = true
    }
  }

  nack() {
    if (!this.acnActionExecuted) {
      this.channel.nack(this.message)
      this.acnActionExecuted = true
    }
  }
}
