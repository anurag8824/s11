"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SportType = void 0;
const mongoose_1 = require("mongoose");
const SportTypeSchema = new mongoose_1.Schema({
    betId: { type: mongoose_1.Types.ObjectId, ref: 'Bet' },
    userId: { type: mongoose_1.Types.ObjectId, ref: 'User' },
    winValue: mongoose_1.Types.Decimal128,
    lossValue: mongoose_1.Types.Decimal128,
    matchId: Number,
    marketId: String,
    selectionId: Number,
    parentStr: Object,
    ratioStr: Object,
    ratioArr: Array,
    teamType: Number,
    isMatched: Boolean,
    isDelete: Boolean,
}, {
    timestamps: true,
});
const SportType = (0, mongoose_1.model)('SportType', SportTypeSchema);
exports.SportType = SportType;
//# sourceMappingURL=BetLiabilities.js.map