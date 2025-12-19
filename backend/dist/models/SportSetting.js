"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SportSetting = void 0;
const mongoose_1 = require("mongoose");
const SportSettingSchema = new mongoose_1.Schema({
    sportId: Number,
    inPlayMinLimit: Number,
    inPlayMaxLimit: Number,
    inPlayFancyMinLimit: Number,
    inPlayFancyMaxLimit: Number,
    offPlayMinLimit: Number,
    offPlayMaxLimit: Number,
    offPlayFancyMinLimit: Number,
    offPlayFancyMaxLimit: Number,
    // minStake: Number,
    // maxStake: Number,
    // maxProfit: Number,
    // maxLoss: Number,
    // betDelay: Number,
    // preInnplayProfit: Number,
    // preInplayStake: Number,
    // volumeLimit: Number,
    // isUnmatchBet: Number,
    // updateUser: Number,
    // lockBet: Number,
    // minOdds: Number,
    // maxOdds: Number,
    // commission: Number,
}, {
    timestamps: true,
});
const SportSetting = (0, mongoose_1.model)('SportSetting', SportSettingSchema);
exports.SportSetting = SportSetting;
//# sourceMappingURL=SportSetting.js.map