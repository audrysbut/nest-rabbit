import { Options } from 'amqplib'

export class Exchange {
  exchange: string
  type: 'direct' | 'topic' | 'headers' | 'fanout' | 'match' | string
  options?: Options.AssertExchange
}
