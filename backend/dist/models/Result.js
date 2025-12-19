"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SportType = void 0;
const mongoose_1 = require("mongoose");
const SportTypeSchema = new mongoose_1.Schema({
    sportId: Number,
    matchId: Number,
    matchName: String,
    marketId: String,
    marketName: String,
    selectionId: Number,
    result: String,
    isFancy: Boolean,
    blockMarketDel: Boolean,
}, {
    timestamps: true,
});
const SportType = (0, mongoose_1.model)('SportType', SportTypeSchema);
exports.SportType = SportType;
//# sourceMappingURL=Result.js.map