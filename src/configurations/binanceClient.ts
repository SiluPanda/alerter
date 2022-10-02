import * as dotenv from 'dotenv'
import Binance from 'binance-api-node'

dotenv.config()

let binance = Binance({
    apiKey: process.env.BINANCE_API_LEY,
    apiSecret: process.env.BINANCE_API_SECRET
})

export default binance