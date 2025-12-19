"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepositWithdraw = void 0;
const mongoose_1 = require("mongoose");
const DepositWithdrawSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Types.ObjectId, ref: 'User' },
    parentId: { type: mongoose_1.Types.ObjectId, ref: 'User' },
    amount: Number,
    orderId: Number,
    status: { type: String, default: 'pending' },
    type: String,
    bankDetail: Object,
    remark: String,
    imageUrl: String,
    accountType: String,
    parentStr: [],
    username: String,
    utrno: Number
}, {
    timestamps: true,
    strict: true,
});
const DepositWithdraw = (0, mongoose_1.model)('DepositWithdraw', DepositWithdrawSchema);
exports.DepositWithdraw = DepositWithdraw;
//# sourceMappingURL=DepositWithdraw.js.map