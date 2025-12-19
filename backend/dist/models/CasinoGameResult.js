"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CasinoGameResult = void 0;
const mongoose_1 = require("mongoose");
const mongoose_paginate_v2_1 = __importDefault(require("mongoose-paginate-v2"));
const CasinoGameResultSchema = new mongoose_1.Schema({
    mid: String,
    gameType: String,
    data: Object,
}, {
    timestamps: true,
});
CasinoGameResultSchema.plugin(mongoose_paginate_v2_1.default);
const CasinoGameResult = (0, mongoose_1.model)('CasinoGameResult', CasinoGameResultSchema);
exports.CasinoGameResult = CasinoGameResult;
//# sourceMappingURL=CasinoGameResult.js.map