import axios from 'axios'
import { CandleChartResult } from 'binance-api-node'
import * as dotenv from 'dotenv'
import binance from '../configurations/binanceClient'
import player from 'play-sound'
dotenv.config()


let THRESHOLD_MULTIPLIER = 5
let SYMBOLS_TO_TRACK = ['BTC']
let playerClient = player()

export async function runVolumeAlertJob() {
    let prices = await binance.prices()
    console.log(prices.length)
    for (let symbol in prices) {
       getVolumeDataAndAlert(symbol)
    }
}

/**
 * Fetch volume data and detect spike if any
 * @param symbol symbol to fetch volume data of
 */
export async function getVolumeDataAndAlert(symbol: string) {
    try {
    
        let candles = await binance.candles({symbol: 'BNBBTC', interval: '15m'})
        
       await detectSpike(symbol, candles)
    } catch (error) {
        console.log(error)
    }
    
}


/**
 * Detect volume splike over a range
 * @param volumeData array of volume numbers
 * @returns boolean representing if there is a spike
 */
export async function detectSpike(symbol: string, candleChartResult: CandleChartResult[]) {
    if (candleChartResult.length === 0) {
        return false
    }
    let totalVolume = 0
    let N =  candleChartResult.length
    for (let i = N - 2; i >= N - 15; i--) {
        totalVolume += parseFloat(candleChartResult[i].volume)
    }
    let isTrigger = (totalVolume / N) * THRESHOLD_MULTIPLIER < parseFloat(candleChartResult[N - 1].volume)
    if (isTrigger) {
        console.log({
            volume: parseFloat(candleChartResult[N-1].volume),
            startTime: new Date(candleChartResult[N-1].openTime),
            endTime: new Date(candleChartResult[N-1].closeTime),
            symbol: symbol
        })
    }

}

/**
 * Send signal incase of a spike
 */
export async function sendSignal() {
    playerClient.play('alert.mp3', err => {
        if (err) {
            throw err
        }
    })
}