import { runVolumeAlertJob, sendSignal } from "./alertScripts/volumeSpike"
import binance from './configurations/binanceClient'


async function setup() {
    await runVolumeAlertJob()
}


setup()


