import { Exchange } from './exchange.dto'
import { Queue } from './queue.dto'

export class RabbitConfig {
  url: string
  credentials: {
    user: string
    password: string
  }
  exchanges?: Exchange[] = []
  queues?: Queue[] = []
}
