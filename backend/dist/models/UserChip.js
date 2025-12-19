"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserChip = exports.Double = exports.TxnType = void 0;
const mongoose_1 = require("mongoose");
var TxnType;
(function (TxnType) {
    TxnType["cr"] = "cr";
    TxnType["dr"] = "dr";
})(TxnType = exports.TxnType || (exports.TxnType = {}));
exports.Double = {
    type: Number,
    get: (v) => v / 100,
    set: (v) => v * 100,
};
const UserChipSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Types.ObjectId, ref: 'User' },
    assignId: mongoose_1.Types.ObjectId,
    name: String,
    txnId: String,
    txnType: {
        type: String,
        enum: TxnType,
    },
    amount: exports.Double,
    narration: String,
}, {
    toJSON: { getters: true },
    timestamps: true,
});
const UserChip = (0, mongoose_1.model)('UserChip', UserChipSchema);
exports.UserChip = UserChip;
//# sourceMappingURL=UserChip.js.map