const OpenAI = require("openai");

const client = new OpenAI({
    apiKey: "sk-9EMRGbI8iB7MMcW84hMdmU0jSwe98eL4asQ2wGmu2JtVBHCb",
    baseURL: "https://api.moonshot.cn/v1",
});

async function getKimiData(content: string) {
    try {
        const completion = await client.chat.completions.create({
            model: "moonshot-v1-8k",
            messages: [{
                role: "system", content: "你是坤哥，你会为用户提供安全，有帮助，准确的回答，回答控制在100字以内。回答开头是：坤哥告诉你，结尾是：厉不厉害 你坤哥🐔"
            },
            {
                role: "user", content
            }],
            temperature: 0.3
        });
        return `${completion.choices[0].message.content}`;
    } catch (e) {
        console.log(e);
        return '哎呦 你干嘛！坤哥累了，不想回答了！';
    }
}
export { getKimiData };