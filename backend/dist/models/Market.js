"use strict";
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
exports.Market = exports.YesNo = exports.OddsType = void 0;
const mongoose_1 = require("mongoose");
const recachegoose_1 = __importDefault(require("recachegoose"));
var OddsType;
(function (OddsType) {
    OddsType["B"] = "berFair";
    OddsType["BM"] = "bookMaker";
    OddsType["T10"] = "t10";
})(OddsType = exports.OddsType || (exports.OddsType = {}));
var YesNo;
(function (YesNo) {
    YesNo[YesNo["Y"] = 0] = "Y";
    YesNo[YesNo["N"] = 1] = "N";
})(YesNo = exports.YesNo || (exports.YesNo = {}));
const MarketSchema = new mongoose_1.Schema({
    marketId: { type: String, index: true },
    marketName: { type: String, index: true },
    matchId: { type: Number, index: true },
    sportId: { type: Number, index: true },
    seriesId: { type: Number, index: true },
    runners: { type: Array, default: [] },
    oddsType: {
        type: String,
        enum: OddsType,
    },
    marketStartTime: Date,
    isActive: { type: Boolean, index: true, default: true },
    isDelete: { type: Boolean, index: true, default: false },
    marketType: String,
    oddsLimit: Number,
    volumeLimit: Number,
    minOdds: Number,
    maxOdds: Number,
    goingInPlayBet: {
        type: String,
        enum: YesNo,
    },
    goingInStake: Number,
    goingInProfitLimit: Number,
    minStakeLimit: Number,
    stakeLimit: Number,
    profitLimit: Number,
    lossLimit: Number,
    isUnmatchBet: {
        type: String,
        enum: YesNo,
    },
    isShow: {
        type: String,
        enum: YesNo,
    },
    totalMatchRange: Number,
    totalMatchProfit: Number,
    totalMatchStake: Number,
    betDelay: Number,
    isVolume: Boolean,
    isRollback: Boolean,
    checkDiffVal: Number,
    checkDiffVal1: Number,
    checkDiffVal2: Number,
    checkDiffVal3: Number,
    resultDelcare: { type: String, default: 'no' },
    result: String,
}, {
    timestamps: true,
});
// Market.find({ matchId, skipPreHook: true }); use this type of query for avoid middleware
MarketSchema.pre('find', function () {
    // @ts-ignore
    if (!this._conditions.skipPreHook) {
        this.where({ $or: [{ isDelete: false }, { isDelete: null }] });
    }
    // @ts-ignore
    delete this._conditions.skipPreHook;
});
MarketSchema.pre('findOne', function () {
    return __awaiter(this, void 0, void 0, function* () {
        // @ts-ignore
        const query = this.getQuery();
        if (query.matchId) {
            recachegoose_1.default.clearCache('Markets-' + query.matchId, () => { });
            recachegoose_1.default.clearCache('Markets-Match-Odds-' + query.matchId, () => { });
            recachegoose_1.default.clearCache('Markets-ne-Match-Odds-' + query.matchId, () => { });
        }
    });
});
MarketSchema.pre('findOneAndUpdate', function () {
    return __awaiter(this, void 0, void 0, function* () {
        // @ts-ignore
        const query = this.getQuery();
        if (query.matchId) {
            recachegoose_1.default.clearCache('Markets-' + query.matchId, () => { });
            recachegoose_1.default.clearCache('Markets-Match-Odds-' + query.matchId, () => { });
            recachegoose_1.default.clearCache('Markets-ne-Match-Odds-' + query.matchId, () => { });
        }
    });
});
//MarketSchema.pre('updateMany')
const Market = (0, mongoose_1.model)('Market', MarketSchema);
exports.Market = Market;
//# sourceMappingURL=Market.js.map