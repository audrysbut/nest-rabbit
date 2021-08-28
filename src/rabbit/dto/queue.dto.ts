import { Options } from 'amqplib'
import { BindQueue } from './bind-queue.dto'

export class Queue {
  queue: string
  options?: Options.AssertQueue
  bind?: BindQueue[] = []
}
