"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketSelection = void 0;
const mongoose_1 = require("mongoose");
const MarketSelectionSchema = new mongoose_1.Schema({
    sportId: Number,
    matchId: Number,
    marketId: String,
    selectionId: Number,
    selectionName: Number,
    teamType: Number,
    meta_data: String,
}, {
    timestamps: true,
});
const MarketSelection = (0, mongoose_1.model)('MarketSelection', MarketSelectionSchema);
exports.MarketSelection = MarketSelection;
//# sourceMappingURL=MarketSelection.js.map