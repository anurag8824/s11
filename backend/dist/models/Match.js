"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Match = void 0;
const mongoose_1 = require("mongoose");
const mongoose_paginate_v2_1 = __importDefault(require("mongoose-paginate-v2"));
const recachegoose_1 = __importDefault(require("recachegoose"));
const MatchSchema = new mongoose_1.Schema({
    matchId: { type: Number, index: true },
    sportId: { type: Number, index: true },
    seriesId: { type: Number, index: true },
    matchDateTime: Date,
    active: { type: Boolean, index: true },
    isDelete: { type: Boolean, index: true, default: false },
    name: String,
    countryCode: String,
    result_delare: { type: Boolean, index: true },
    result: String,
    inPlay: { type: Boolean, index: true, default: false },
    isBookMaker: Boolean,
    isFancy: Boolean,
    isT10: Boolean,
    inPlayMinLimit: Number,
    inPlayMaxLimit: Number,
    inPlayFancyMinLimit: Number,
    inPlayFancyMaxLimit: Number,
    inPlayBookMinLimit: Number,
    inPlayBookMaxLimit: Number,
    offPlayMinLimit: Number,
    offPlayMaxLimit: Number,
    offPlayFancyMinLimit: Number,
    offPlayFancyMaxLimit: Number,
    offPlayBookMinLimit: Number,
    offPlayBookMaxLimit: Number,
}, {
    timestamps: true,
});
MatchSchema.pre('find', function () {
    // @ts-ignore
    if (!this._conditions.skipPreHook) {
        this.sort({ matchDateTime: 1 });
    }
    // @ts-ignore
    delete this._conditions.skipPreHook;
});
MatchSchema.pre('findOneAndUpdate', function () {
    return __awaiter(this, void 0, void 0, function* () {
        // @ts-ignore
        const query = this.getQuery();
        if (query.matchId) {
            recachegoose_1.default.clearCache('Match-' + query.matchId, () => { });
        }
    });
});
MatchSchema.pre('save', function () {
    // @ts-ignore
    if (this.matchId)
        recachegoose_1.default.clearCache('Match-' + this.matchId, () => { });
});
MatchSchema.plugin(mongoose_paginate_v2_1.default);
const Match = (0, mongoose_1.model)('Match', MatchSchema);
exports.Match = Match;
//# sourceMappingURL=Match.js.map