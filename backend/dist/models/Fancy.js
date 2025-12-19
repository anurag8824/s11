"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Fancy = void 0;
const mongoose_1 = require("mongoose");
const FancySchema = new mongoose_1.Schema({
    matchId: { type: Number, index: true },
    sportId: { type: Number, index: true },
    marketId: { type: String, index: true },
    fancyName: { type: String, index: true },
    active: { type: Boolean, index: true },
    gtype: { type: String, index: true },
    isSuspend: { type: Boolean, index: true, default: false },
    GameStatus: { type: String, index: true },
    sr_no: { type: Number, index: true },
    result: { type: String, index: false, default: '' },
    ballByBall: { type: String, index: true },
    status: { type: String }
}, {
    timestamps: true,
});
const Fancy = (0, mongoose_1.model)('Fancy', FancySchema);
exports.Fancy = Fancy;
//# sourceMappingURL=Fancy.js.map