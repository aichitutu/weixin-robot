import { getAIData } from '../services/actions/ai'
import { getBinanceData } from '../services/actions/binance'
import { holiday } from '../services/actions/fishingTime'
import { getFutureData } from '../services/actions/future'
import { repeatMessage } from '../services/actions/repeatMessage'
import { getHotSpot } from '../services/actions/stockHotSpot'
import { getCNMarketIndexData, getHKMarketIndexData, getStockData, getStockDetailData, getUSMarketIndexData } from '../services/actions/stockInfo'
import { getStockSummary } from '../services/actions/stockSummary'
import { getFutuStockMap, getYuntuStockMap, MapType } from '../services/actions/stockThermalMap'
import { getWeiboData } from '../services/actions/weibo'
import { checkTime } from '../services/actions/ocr'

export interface CommandParams {
  args?: string,
  sendMessage: (content: string) => void,
  key: string,
  roomId?: string
}
const commandMap: { key: string, callback: (params: CommandParams) => Promise<string>, msg: string, hasArgs: boolean, enable?: boolean }[]
  = [
    // 股市相关命令
    {
      key: 'scn',
      callback: getCNMarketIndexData,
      msg: 'scn - 获取上证指数信息，包含大盘涨跌幅、成交量等核心数据',
      hasArgs: false,
    },
    {
      key:'sus',
      callback: getUSMarketIndexData,
      msg: 'sus - 获取美股指数信息，包含大盘涨跌幅、成交量等核心数据',
      hasArgs: false,
    },
    {
      key:'shk',
      callback: getHKMarketIndexData,
      msg: 'shk - 获取港股指数信息，包含大盘涨跌幅、成交量等核心数据',
      hasArgs: false,
    },
    {
      key: 's ',
      callback: (params) => getStockData(params.args),
      msg: 's [股票代码] - 获取股票信息,支持一次查询多只股票 例如: s 600519 000858',
      hasArgs: true,
    },
    {
      key: 'sd ',
      callback: (params) => getStockDetailData(params.args),
      msg: 'sd [股票代码] - 获取股票详细信息 例如: sd gzmt',
      hasArgs: true,
    },
    {
      key: 'dp',
      callback: getStockSummary,
      msg: 'dp - 获取大盘市场信息，包括涨跌家数、板块概览等',
      hasArgs: false,
    },
    {
      key: 'mdp',
      callback: getYuntuStockMap,
      msg: 'mdp - 获取云图大盘热力图，直观展示市场热点分布',
      hasArgs: false,
    },
    {
      key: 'mcn',
      callback: (params) => getFutuStockMap('cn', params.args as MapType),
      msg: 'mcn [hy|gu] - 获取富途A股热力图 (hy:行业图 gu:个股图)',
      hasArgs: true,
    },
    {
      key: 'mhk',
      callback: (params) => getFutuStockMap('hk', params.args as MapType),
      msg: 'mhk [hy|gu] - 获取富途港股热力图 (hy:行业图 gu:个股图)',
      hasArgs: true,
    },
    {
      key: 'mus',
      callback: (params) => getFutuStockMap('us', params.args as MapType),
      msg: 'mus [hy|gu] - 获取富途美股热力图 (hy:行业图 gu:个股图)',
      hasArgs: true,
    },

    // AI对话
    {
      key: 'a ',
      callback: (params) => getAIData(params.args),
      msg: 'a [问题] - AI助手对话 例如: a 鲁迅与周树人的关系',
      hasArgs: true,
    },

    // 期货与数字货币
    {
      key: 'f ',
      callback: (params) => getFutureData(params.args),
      msg: 'f [期货代码] - 获取期货信息 例如: f XAU',
      hasArgs: true,
    },
    {
      key: 'b ',
      callback: (params) => getBinanceData(params.args),
      msg: 'b [货币代码] - 获取数字货币信息 例如: b btc',
      hasArgs: true,
    },

    // 热点资讯
    {
      key: 'hot',
      callback: getHotSpot,
      msg: 'hot - 获取今日热点概念板块及相关个股',
      hasArgs: false,
    },
    {
      key: 'wb',
      callback: getWeiboData,
      msg: 'wb - 获取微博热搜',
      hasArgs: false,
    },

    // 其他工具
    {
      key: 'hy',
      callback: holiday,
      msg: 'hy - 获取节假日信息',
      hasArgs: false,
    },
    {
      key: 'hp',
      callback: getHelp,
      msg: 'hp - 获取命令帮助',
      hasArgs: false,
    },
    // 复读
    {
      key: 're',
      callback: repeatMessage,
      msg: 're [文本] [次数] - 复读机器人, 例如: re 你好 3',
      hasArgs: true,
    },
    {
        key: 'picture',
        callback: checkTime,
        msg: '图片',
        hasArgs: true,
    }
  ];
// 解析命令
export async function parseCommand(msg: string, sendMessage: (content: string) => void, roomId?: string) : Promise<boolean> {
  let re = false
  for (const command of commandMap) {
    if (msg.startsWith(command.key)) {
      re = true
      const args = msg.slice(command.key.length).trim()
      const content = await command.callback({ args, sendMessage, key: command.key, roomId })
      if (content) {
        await sendMessage(content)
      }
    }
  }
  return re
}

export async function getHelp() {
  const commandMsg = commandMap.filter(command => command.enable !== true).map(command => command.msg).join('\n')
  return `命令列表：\n${commandMsg}\n项目地址：https://github.com/lxw15337674/weixin-robot`
}
