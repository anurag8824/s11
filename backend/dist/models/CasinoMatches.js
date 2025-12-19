"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Casino = void 0;
const mongoose_1 = require("mongoose");
const CasinoMatchSchema = new mongoose_1.Schema({
    status: Number,
    match_id: Number,
    image: String,
    title: String,
    slug: String,
    id: Number,
    event_data: Object,
    isDisable: Boolean,
    order: Number
}, {
    timestamps: true,
});
const Casino = (0, mongoose_1.model)('Casinomatches', CasinoMatchSchema);
exports.Casino = Casino;
//# sourceMappingURL=CasinoMatches.js.map