import { getVolumeDataAndAlert, runVolumeAlertJob, sendSignal } from "./alertScripts/volumeSpike"
import binance from './configurations/binanceClient'
import * as cron from 'node-cron'


async function setup() {
    // await getVolumeDataAndAlert('CELRETH')
}
setup()

cron.schedule('* */15 * * * *', async () => {
    console.log("Starting volume alert job")
    await runVolumeAlertJob()
})


