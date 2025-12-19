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
exports.User = exports.userSchema = exports.GameType = void 0;
const mongoose_1 = require("mongoose");
const bcrypt_nodejs_1 = __importDefault(require("bcrypt-nodejs"));
const Role_1 = require("./Role");
const recachegoose_1 = __importDefault(require("recachegoose"));
const mongoose_paginate_v2_1 = __importDefault(require("mongoose-paginate-v2"));
var GameType;
(function (GameType) {
    GameType["Football"] = "1";
    GameType["Tennis"] = "2";
    GameType["Cricket"] = "4";
})(GameType = exports.GameType || (exports.GameType = {}));
exports.userSchema = new mongoose_1.Schema({
    username: String,
    password: { type: String, expose: false },
    role: { type: String, enum: Role_1.RoleType },
    level: Number,
    parentId: { type: mongoose_1.Types.ObjectId, ref: 'User' },
    parentStr: [],
    betLock: Boolean,
    // isMaster: Boolean,
    isLogin: Boolean,
    isDeleted: Boolean,
    lastLogin: Boolean,
    partnership: Object,
    refreshToken: String,
    fullName: String,
    city: String,
    phone: String,
    creditRefrences: String,
    exposerLimit: String,
    userSetting: Object,
    changePassAndTxn: { type: Boolean, default: false },
    transactionPassword: String,
    sessionId: Number,
    isDemo: Boolean
}, {
    timestamps: true,
});
exports.userSchema.plugin(mongoose_paginate_v2_1.default);
exports.userSchema.post('findOneAndUpdate', function (user) {
    return __awaiter(this, void 0, void 0, function* () {
        if (user.username) {
            recachegoose_1.default.clearCache(`user-cache-${user.username.toLowerCase()}`, () => { });
        }
    });
});
exports.userSchema.pre('save', function save(next) {
    const user = this;
    if (user.username) {
        recachegoose_1.default.clearCache('user-cache-' + user.username, () => { });
    }
    if (!user.isModified('password'))
        return next();
    bcrypt_nodejs_1.default.genSalt(10, (err, salt) => {
        if (err) {
            return next(err);
        }
        // @ts-ignore
        bcrypt_nodejs_1.default.hash(this.password, salt, undefined, (err, hash) => {
            if (err) {
                return next(err);
            }
            user.password = hash;
            next();
        });
    });
});
exports.userSchema.methods.comparePassword = function (candidatePassword) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            bcrypt_nodejs_1.default.compare(candidatePassword, 
            // @ts-ignore
            this.password, (err, isMatch) => {
                if (err)
                    reject(err);
                resolve(isMatch);
            });
        });
    });
};
exports.userSchema.methods.compareTxnPassword = function (candidatePassword) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            bcrypt_nodejs_1.default.compare(candidatePassword, 
            // @ts-ignore
            this.transactionPassword, (err, isMatch) => {
                if (err)
                    reject(err);
                resolve(isMatch);
            });
        });
    });
};
exports.User = (0, mongoose_1.model)('User', exports.userSchema);
//# sourceMappingURL=User.js.map