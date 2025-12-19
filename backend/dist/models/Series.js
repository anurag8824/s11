"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Series = void 0;
const mongoose_1 = require("mongoose");
const SeriesSchema = new mongoose_1.Schema({
    seriesId: Number,
    sportId: Number,
    seriesName: String,
    region: String,
    marketCount: Number,
    isActive: Boolean,
}, {
    timestamps: true,
});
const Series = (0, mongoose_1.model)('Series', SeriesSchema);
exports.Series = Series;
//# sourceMappingURL=Series.js.map