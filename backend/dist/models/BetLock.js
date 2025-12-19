"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BetLock = void 0;
const mongoose_1 = require("mongoose");
const mongoose_paginate_v2_1 = __importDefault(require("mongoose-paginate-v2"));
const BetLockSchema = new mongoose_1.Schema({
    sportId: Number,
    matchId: { type: Number, index: true },
    parentId: { type: mongoose_1.Types.ObjectId, ref: 'User', index: true },
    userId: { type: mongoose_1.Types.ObjectId, ref: 'User', index: true },
    betFair: Boolean,
    book: Boolean,
    fancy: Boolean,
}, {
    timestamps: true,
    toJSON: { getters: true },
});
BetLockSchema.plugin(mongoose_paginate_v2_1.default);
const BetLock = (0, mongoose_1.model)('BetLock', BetLockSchema);
exports.BetLock = BetLock;
//# sourceMappingURL=BetLock.js.map