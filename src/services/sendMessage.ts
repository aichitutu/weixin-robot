import { log } from 'wechaty'
import type { Wechaty } from 'wechaty'
import { PromiseQueue } from '../utils/PromiseQueue';
import { randomSleep } from '../utils/sleep';
const queue = new PromiseQueue()


export async function sendContactMsg(bot: Wechaty, content: string, alias?: string, name?: string) {
  let query: Record<string, string> = {}
  if (alias)
    query = { alias }
  else if (name)
    query = { name }
  queue.addTask(async () => {
    try {
      const contact = await bot.Contact.find(query)
      await randomSleep(3000, 5000)
      if (contact)
        await contact.say(content)
    }
    catch (error) {
      log.error('发送联系人信息错误')
    }
  })
}

export async function sendRoomMsg(bot: Wechaty, content: string, topic: string) {
  const query: Record<string, string> = {
    topic,
  }
  queue.addTask(async () => {
    try {
      const room = await bot.Room.find(query)
      await randomSleep(3000, 5000)
      if (room)
        await room.say(content)
    }
    catch (error) {
      log.error('发送群信息错误')
    }
  })
}
