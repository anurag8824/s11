"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sport = void 0;
const mongoose_1 = require("mongoose");
const SportSchema = new mongoose_1.Schema({
    sportId: Number,
    typeId: Number,
    icon: String,
    name: String,
    otherName: String,
    marketCount: Number,
}, {
    timestamps: true,
});
const Sport = (0, mongoose_1.model)('Sport', SportSchema);
exports.Sport = Sport;
//# sourceMappingURL=Sport.js.map