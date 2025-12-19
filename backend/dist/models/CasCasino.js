"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CasCasino = void 0;
const mongoose_1 = require("mongoose");
const CasCasinoSchema = new mongoose_1.Schema({
    game_status: String,
    game_identifier: { type: String, index: true },
    game_image: String,
    game_name: String,
    game_group: String,
    game_slot_status: { type: Boolean, index: true },
    game_category: { type: String, index: true },
    game_provider: { type: String, index: true },
}, {
    timestamps: true,
});
const CasCasino = (0, mongoose_1.model)('cascasino', CasCasinoSchema);
exports.CasCasino = CasCasino;
//# sourceMappingURL=CasCasino.js.map