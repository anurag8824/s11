"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Upi = void 0;
const mongoose_1 = require("mongoose");
const mongoose_2 = require("mongoose");
const UpiSchema = new mongoose_1.Schema({
    userId: { type: mongoose_2.Types.ObjectId, ref: 'User' },
    upiId: String,
}, {
    timestamps: true,
});
const Upi = (0, mongoose_1.model)('Upi', UpiSchema);
exports.Upi = Upi;
//# sourceMappingURL=Upi.js.map