import { getVolumeDataAndAlert, runVolumeAlertJob, sendSignal } from "./alertScripts/volumeSpike"
import binance from './configurations/binanceClient'
import * as cron from 'node-cron'


async function setup() {
   runVolumeAlertJob()
}
setup()

// cron.schedule('0 */15 * * * *', async () => {
//     console.log("Starting volume alert job")
//     try {
//         await runVolumeAlertJob()
//     } catch(error) {
//         console.log(error)
//     }
   
// })


