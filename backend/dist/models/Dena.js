"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.denah = void 0;
const mongoose_1 = require("mongoose");
const mongoose_2 = require("mongoose");
const Denah = new mongoose_1.Schema({
    ParentId: { type: mongoose_2.Types.ObjectId, ref: 'User' },
    money: Number,
    ChildId: { type: mongoose_2.Types.ObjectId, ref: "User" },
    Username: String
});
const denah = (0, mongoose_1.model)('denah', Denah);
exports.denah = denah;
//# sourceMappingURL=Dena.js.map