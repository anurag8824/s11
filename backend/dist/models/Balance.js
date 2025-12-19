"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Balance = void 0;
const mongoose_1 = require("mongoose");
const BalanceSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Types.ObjectId, ref: 'User', index: true },
    balance: Number,
    exposer: { type: Number, default: 0 },
    profitLoss: { type: Number, default: 0 },
    casinoexposer: { type: Number, default: 0 },
    mainBalance: { type: Number, default: 0 },
    // free_chip: Double,
    // pnl: Double,
    // settlement: Double,
    // creditLimit: Double,
    // creditGiven: Double,
}, {
    toJSON: { getters: true },
    timestamps: true,
});
const Balance = (0, mongoose_1.model)('Balance', BalanceSchema);
exports.Balance = Balance;
//# sourceMappingURL=Balance.js.map