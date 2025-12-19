"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BankAccount = void 0;
const mongoose_1 = require("mongoose");
const mongoose_2 = require("mongoose");
const BankAccountSchema = new mongoose_1.Schema({
    userId: { type: mongoose_2.Types.ObjectId, ref: 'User' },
    accountHolderName: String,
    ifscCode: String,
    accountNumber: Number,
}, {
    timestamps: true,
});
const BankAccount = (0, mongoose_1.model)('BankAccount', BankAccountSchema);
exports.BankAccount = BankAccount;
//# sourceMappingURL=BankAccount.js.map