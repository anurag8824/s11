"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchGeneralSetting = void 0;
const mongoose_1 = require("mongoose");
const MatchGeneralSettingSchema = new mongoose_1.Schema({
    sportName: String,
}, {
    timestamps: true,
});
const MatchGeneralSetting = (0, mongoose_1.model)('MatchGeneralSetting', MatchGeneralSettingSchema);
exports.MatchGeneralSetting = MatchGeneralSetting;
//# sourceMappingURL=MatchGeneralSetting.js.map