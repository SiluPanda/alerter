"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSignal = exports.detectSpike = exports.getVolumeDataAndAlert = exports.runVolumeAlertJob = void 0;
const dotenv = __importStar(require("dotenv"));
const binanceClient_1 = __importDefault(require("../configurations/binanceClient"));
const play_sound_1 = __importDefault(require("play-sound"));
dotenv.config();
let THRESHOLD_MULTIPLIER = 5;
let TRAILING_WINDOW = 15;
let playerClient = (0, play_sound_1.default)();
function runVolumeAlertJob() {
    return __awaiter(this, void 0, void 0, function* () {
        let prices = yield binanceClient_1.default.prices();
        let count = 0;
        for (let symbol in prices) {
            if (symbol.includes('USD')) {
                getVolumeDataAndAlert(symbol);
            }
        }
    });
}
exports.runVolumeAlertJob = runVolumeAlertJob;
/**
 * Fetch volume data and detect spike if any
 * @param symbol symbol to fetch volume data of
 */
function getVolumeDataAndAlert(symbol) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let candles = yield binanceClient_1.default.candles({ symbol: symbol, interval: '15m' });
            yield detectSpike(symbol, candles);
        }
        catch (error) {
            console.log(error);
        }
    });
}
exports.getVolumeDataAndAlert = getVolumeDataAndAlert;
/**
 * Detect volume splike over a range
 * @param volumeData array of volume numbers
 * @returns boolean representing if there is a spike
 */
function detectSpike(symbol, candleChartResult) {
    return __awaiter(this, void 0, void 0, function* () {
        if (candleChartResult.length === 0) {
            return false;
        }
        let totalVolume = 0;
        let N = candleChartResult.length;
        for (let i = N - 2; i >= N - TRAILING_WINDOW; i--) {
            totalVolume += parseFloat(candleChartResult[i].volume);
        }
        let averageVolume = totalVolume / TRAILING_WINDOW;
        let isTrigger = averageVolume * THRESHOLD_MULTIPLIER < parseFloat(candleChartResult[N - 1].volume);
        if (isTrigger) {
            console.log({
                volume: parseFloat(candleChartResult[N - 1].volume),
                startTime: new Date(candleChartResult[N - 1].openTime),
                endTime: new Date(candleChartResult[N - 1].closeTime),
                symbol: symbol
            });
            yield sendSignal();
        }
    });
}
exports.detectSpike = detectSpike;
/**
 * Send signal incase of a spike
 */
function sendSignal() {
    return __awaiter(this, void 0, void 0, function* () {
        playerClient.play('alert.mp3', err => {
            if (err) {
                throw err;
            }
        });
    });
}
exports.sendSignal = sendSignal;
//# sourceMappingURL=volumeSpike.js.map