"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Settlement = void 0;
const mongoose_1 = require("mongoose");
const UserChip_1 = require("./UserChip");
const SettlementSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Types.ObjectId, ref: 'User' },
    oppId: { type: mongoose_1.Types.ObjectId, ref: 'User' },
    settleId: Number,
    txnType: {
        type: String,
        enum: UserChip_1.TxnType,
    },
    amount: UserChip_1.Double,
    narration: String,
    loginId: { type: mongoose_1.Types.ObjectId, ref: 'User' },
    remark: String,
}, {
    toJSON: { getters: true },
    timestamps: true,
});
const Settlement = (0, mongoose_1.model)('Settlement', SettlementSchema);
exports.Settlement = Settlement;
//# sourceMappingURL=Settlement.js.map