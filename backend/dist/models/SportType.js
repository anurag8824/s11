"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SportType = void 0;
const mongoose_1 = require("mongoose");
const SportTypeSchema = new mongoose_1.Schema({
    name: String,
}, {
    timestamps: true,
});
const SportType = (0, mongoose_1.model)('SportType', SportTypeSchema);
exports.SportType = SportType;
//# sourceMappingURL=SportType.js.map