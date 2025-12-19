"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Setting = void 0;
const mongoose_1 = require("mongoose");
const SettingSchema = new mongoose_1.Schema({
    name: String,
    value: String,
    active: Boolean,
}, {
    timestamps: true,
});
const Setting = (0, mongoose_1.model)('Setting', SettingSchema);
exports.Setting = Setting;
//# sourceMappingURL=Setting.js.map