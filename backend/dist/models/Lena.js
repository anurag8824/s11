"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lenah = void 0;
const mongoose_1 = require("mongoose");
const mongoose_2 = require("mongoose");
const Lenah = new mongoose_1.Schema({
    ParentId: { type: mongoose_2.Types.ObjectId, ref: 'User' },
    money: Number,
    ChildId: { type: mongoose_2.Types.ObjectId, ref: "User" },
    Username: String
});
const lenah = (0, mongoose_1.model)('lenah', Lenah);
exports.lenah = lenah;
//# sourceMappingURL=Lena.js.map