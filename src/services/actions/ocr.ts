import axios from 'axios'
import {CommandParams} from "@/services/command";

function getTime(data) {
    if (!data || !data.length) return ''
    const dateRegex = /\d{4}([\/\.])\d{2}\1\d{2}/
    const timeRegex = /\d{2}(:|：)\d{2}/

    let date = ''
    let time = ''

    data.forEach(item => {
        const dateMatch = item.match(dateRegex)
        if (dateMatch) {
            date = dateMatch[0]
        }

        const timeMatch = item.match(timeRegex)
        if (timeMatch) {
            time = timeMatch[0]
        }
    });

    if (date && time) {
        const result = `${date} ${time}`.replace('：', ':')
        return result
    } else {
        console.log('未能提取到日期或时间')
    }
    return ''
}

async function ocr(msg) {
    try {
        const options = {
            method: 'POST',
            url: `https://aip.baidubce.com/rest/2.0/ocr/v1/accurate_basic?access_token=${await getAccessToken()}`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
            },
            data: {
                image: msg,
                detect_direction: 'false',
                paragraph: 'false',
                probability: 'false',
                multidirectional_recognize: 'false',
            },
        }

        const data = await axios(options)
        if (data.status === 200) {
            let arr = data.data.words_result
            arr = arr.map(v => v.words)
            return arr
        }
        return []
    } catch (e) {
        console.error(e.message)
        return []
    }
}

function getAccessToken() {
    let options = {
        'method': 'POST',
        'url': 'https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=' + process.env.AK + '&client_secret=' + process.env.SK,
    }
    return new Promise((resolve, reject) => {
        axios(options)
            .then(res => {
                resolve(res.data.access_token)
            })
            .catch(error => {
                reject(error)
            })
    })
}

export const checkTime = async (params: CommandParams): Promise<string> => {
    const {args, sendMessage} = params
    const [content, rawCount] = args.split(' ')
    if (!content) return
    const data = await ocr(content)
    const time = await getTime(data)
    if (time) {
        await sendMessage(time)
    }
}
