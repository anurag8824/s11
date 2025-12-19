"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Payment = void 0;
const mongoose_1 = require("mongoose");
const mongoose_2 = require("mongoose");
const PaymentSchema = new mongoose_2.Schema({
    name: String,
    value: String,
    label: String,
    domain: String,
    active: Boolean,
    userId: { type: mongoose_1.Types.ObjectId, ref: 'User' },
}, {
    timestamps: true,
});
const Payment = (0, mongoose_2.model)('payment', PaymentSchema);
exports.Payment = Payment;
//# sourceMappingURL=Payments.js.map