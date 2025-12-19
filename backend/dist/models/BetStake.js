"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BetStake = void 0;
const mongoose_1 = require("mongoose");
const BetStakeSchema = new mongoose_1.Schema({
    name: String,
    value: Number,
}, {
    timestamps: true,
});
const BetStake = (0, mongoose_1.model)('BetStake', BetStakeSchema);
exports.BetStake = BetStake;
//# sourceMappingURL=BetStake.js.map