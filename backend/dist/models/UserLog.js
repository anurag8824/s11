"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserLog = exports.userLogSchema = void 0;
const mongoose_1 = require("mongoose");
exports.userLogSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Types.ObjectId, ref: 'User' },
    logs: Object,
}, {
    timestamps: true,
});
exports.UserLog = (0, mongoose_1.model)('UserLog', exports.userLogSchema);
//# sourceMappingURL=UserLog.js.map