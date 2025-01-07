import OpenAI from "openai";
import Redis from 'ioredis'
require('dotenv').config(); // 在其他代码之前加载 .env 文件

const apiKey = process.env.API_KEY ?? '';
const baseURL = process.env.BASE_URL ?? 'https://api.stepfun.com/v1';
const model = process.env.MODEL ?? 'step-2-16k';
const aiPrompt = process.env.AI_PROMPT ?? '你是坤哥，你会为用户提供安全，有帮助，准确的回答。回答开头是：坤哥告诉你，结尾是：厉不厉害 你坤哥🐔';

const client = new OpenAI({
    apiKey,
    baseURL
});

const redis = new Redis({
    host: 'localhost',
    port: 6379,
    password: process.env.REDISPW,
    db: 0
});

async function getHistory(content: string, user: string) {
    const arr = [
        { role: "system", content: aiPrompt },
        {role: "user", content}
    ]
    try{
        if (!user) return arr
        const value = await redis.get(`weixin:${user}`)
        if (!value) return arr
        const data = JSON.parse(value)
        if (data) {
            data.push({role: "user", content})
            return data
        }
        return arr
    }catch (e) {
        console.error('getHistory:', e.message)
        return arr
    }
}

async function getAIData(content: string, user: string = '') {
    try {
        if (!content) return
        const messages = await getHistory(content, user)
        const completion = await client.chat.completions.create({
            model,
            messages,
        });
        if (user) {
            await redis.setex(`weixin:${user}`, 24 * 3600, JSON.stringify(messages))
        }
        return completion.choices[0].message.content || '你好，你说吧'
    } catch (e) {
        return '哎呦 你干嘛！坤哥累了，不想回答！';
    }
}

export { getAIData };