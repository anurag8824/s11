"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfitLoss = void 0;
const mongoose_1 = require("mongoose");
const ProfitLossSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Types.ObjectId, ref: 'User' },
    matchId: Number,
    marketId: String,
    sportId: Number,
    resultId: Number,
    matchName: String,
    marketName: String,
    winner: String,
    type: Number,
    parentStr: String,
    userPnl: Number,
    commission: Number,
    result: String,
}, {
    timestamps: true,
});
const ProfitLoss = (0, mongoose_1.model)('ProfitLoss', ProfitLossSchema);
exports.ProfitLoss = ProfitLoss;
//# sourceMappingURL=ProfitLoss.js.map