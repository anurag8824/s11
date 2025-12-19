"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFloat = exports.Bet = exports.BetOn = exports.BetType = void 0;
const mongoose_1 = require("mongoose");
const mongoose_paginate_v2_1 = __importDefault(require("mongoose-paginate-v2"));
var BetType;
(function (BetType) {
    BetType[BetType["B"] = 0] = "B";
    BetType[BetType["M"] = 1] = "M";
})(BetType = exports.BetType || (exports.BetType = {}));
var BetOn;
(function (BetOn) {
    BetOn["FANCY"] = "FANCY";
    BetOn["MATCH_ODDS"] = "MATCH_ODDS";
    BetOn["CASINO"] = "CASINO";
    BetOn["CASINOFANCY"] = "CASINOFANCY";
})(BetOn = exports.BetOn || (exports.BetOn = {}));
const getFloat = (value) => {
    if (typeof value !== 'undefined') {
        return parseFloat(value.toString());
    }
    return value;
};
exports.getFloat = getFloat;
const BetSchema = new mongoose_1.Schema({
    sportId: Number,
    userId: { type: mongoose_1.Types.ObjectId, ref: 'User', index: true },
    userName: { type: String, index: true },
    parentStr: [],
    parentNameStr: { type: String, index: true },
    ratioStr: Object,
    matchId: { type: Number, index: true },
    marketId: { type: String, index: true },
    selectionId: { type: Number, index: true },
    selectionName: String,
    matchName: String,
    odds: { type: mongoose_1.Schema.Types.Decimal128, default: 0, get: getFloat },
    volume: { type: mongoose_1.Schema.Types.Decimal128, default: 0, get: getFloat },
    stack: { type: mongoose_1.Schema.Types.Decimal128, default: 0, get: getFloat },
    pnl: { type: mongoose_1.Schema.Types.Decimal128, default: 0, get: getFloat },
    commission: { type: mongoose_1.Schema.Types.Decimal128, default: 0, get: getFloat },
    marketName: String,
    isBack: Boolean,
    isMatched: Boolean,
    matchedDate: Date,
    matchedOdds: { type: mongoose_1.Schema.Types.Decimal128, default: 0, get: getFloat },
    matchedInfo: String,
    betInfo: Object,
    parentPnl: Object,
    userIp: String,
    isResult: { type: Boolean, index: true },
    isDelete: { type: Boolean, index: true },
    betClickTime: Date,
    status: { type: String, default: 'pending', index: true },
    bet_on: { type: String, default: 'MATCH_ODDS', index: true },
    loss: { type: mongoose_1.Schema.Types.Decimal128, default: 0, get: getFloat },
    profitLoss: { type: mongoose_1.Schema.Types.Decimal128, default: 0, get: getFloat },
    gtype: String,
    C1: String,
    C2: String,
    C3: String,
    fancystatus: String
}, {
    timestamps: true,
    toJSON: { getters: true },
});
BetSchema.plugin(mongoose_paginate_v2_1.default);
const Bet = (0, mongoose_1.model)('Bet', BetSchema);
exports.Bet = Bet;
//# sourceMappingURL=Bet.js.map