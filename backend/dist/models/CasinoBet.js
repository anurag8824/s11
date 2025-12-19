"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CasinoBet = void 0;
const mongoose_1 = require("mongoose");
const mongoose_paginate_v2_1 = __importDefault(require("mongoose-paginate-v2"));
const getFloat = (value) => {
    if (typeof value !== 'undefined') {
        return parseFloat(value.toString());
    }
    return value;
};
const CasinoBetSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Types.ObjectId, ref: 'User', index: true },
    userName: { type: String, index: true },
    parentStr: [],
    parentNameStr: { type: String, index: true },
    ratioStr: Object,
    gameCode: { type: String, index: true },
    gameName: String,
    round: { type: String, index: true },
    currency: String,
    providerCode: String,
    providerTransactionId: String,
    status: String,
    rolledBack: String,
    marketId: String,
    amount: { type: mongoose_1.Schema.Types.Decimal128, default: 0, get: getFloat },
    gameId: String,
    description: String,
    requestUuid: String,
    transactionUuid: String,
    matchId: String,
}, {
    timestamps: true,
    toJSON: { getters: true },
});
CasinoBetSchema.plugin(mongoose_paginate_v2_1.default);
const CasinoBet = (0, mongoose_1.model)('CasinoBet', CasinoBetSchema);
exports.CasinoBet = CasinoBet;
//# sourceMappingURL=CasinoBet.js.map