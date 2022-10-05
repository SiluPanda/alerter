import axios from 'axios'
import { CandleChartResult } from 'binance-api-node'
import * as dotenv from 'dotenv'
import binance from '../configurations/binanceClient'
import player from 'play-sound'
import path from 'path'
dotenv.config()


let THRESHOLD_MULTIPLIER = 5
let TRAILING_WINDOW = 15
let playerClient = player()

export async function runVolumeAlertJob() {
    let prices = await binance.prices()
    let count = 0
    for (let symbol in prices) {
        if (symbol.includes('USD')) {
            getVolumeDataAndAlert(symbol)

        }
    }
}

/**
 * Fetch volume data and detect spike if any
 * @param symbol symbol to fetch volume data of
 */
export async function getVolumeDataAndAlert(symbol: string) {
    try {
    
        let candles = await binance.candles({symbol: symbol, interval: '15m'})
        
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
    for (let i = N - 2; i >= N - TRAILING_WINDOW; i--) {
        totalVolume += parseFloat(candleChartResult[i].volume)
    }
    let averageVolume = totalVolume / TRAILING_WINDOW
    let isTrigger = averageVolume * THRESHOLD_MULTIPLIER < parseFloat(candleChartResult[N - 1].volume)
    if (isTrigger) {
        console.log("NEW VOLUME ALERT")
        console.log("==================================")
        console.log({
            volume: parseFloat(candleChartResult[N-1].volume),
            startTime: new Date(candleChartResult[N-1].openTime),
            endTime: new Date(candleChartResult[N-1].closeTime),
            symbol: symbol
        })
        console.log()
        await sendSignal()
    }

}

/**
 * Send signal incase of a spike
 */
export async function sendSignal() {
    try {
        let alertMp3Path = path.resolve(process.cwd(), "alert.mp3")
        console.log(alertMp3Path)
        playerClient.play(alertMp3Path, (error) => {
            console.log(`Error while playing sound, reason: ${error}`)
        })
    } catch (error) {
        console.log(error)
    }
}

