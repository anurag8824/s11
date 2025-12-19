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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BetLockController = void 0;
const mongoose_1 = require("mongoose");
const BetLock_1 = require("../models/BetLock");
const Match_1 = require("../models/Match");
const Role_1 = require("../models/Role");
const User_1 = require("../models/User");
const ApiController_1 = require("./ApiController");
class BetLockController extends ApiController_1.ApiController {
    constructor() {
        super(...arguments);
        this.betLock = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { match, type, status, userId } = req.body;
                const user = req.user;
                const types = { M: 'betFair', B: 'book', F: 'fancy' };
                const isMatch = yield Match_1.Match.findOne({ matchId: match.matchId }).count();
                if (isMatch && !userId) {
                    const updateField = types[type];
                    const updateQuery = {
                        [updateField]: status,
                        matchId: match.matchId,
                        parentId: mongoose_1.Types.ObjectId(user === null || user === void 0 ? void 0 : user._id),
                        sportId: match.sportId,
                    };
                    yield BetLock_1.BetLock.findOneAndUpdate({ matchId: match.matchId, parentId: mongoose_1.Types.ObjectId(user === null || user === void 0 ? void 0 : user._id) }, { $set: updateQuery }, { upsert: true, new: true });
                    return this.success(res, req.body);
                }
                else if (isMatch && userId) {
                    const updateField = types[type];
                    const updateQuery = {
                        [updateField]: status,
                        matchId: match.matchId,
                        parentId: mongoose_1.Types.ObjectId(user === null || user === void 0 ? void 0 : user._id),
                        sportId: match.sportId,
                        userId: mongoose_1.Types.ObjectId(userId),
                    };
                    yield BetLock_1.BetLock.findOneAndUpdate({
                        matchId: match.matchId,
                        parentId: mongoose_1.Types.ObjectId(user === null || user === void 0 ? void 0 : user._id),
                        userId: mongoose_1.Types.ObjectId(userId),
                    }, { $set: updateQuery }, { upsert: true, new: true });
                    return this.success(res, req.body);
                }
                return this.fail(res, 'Match not found');
            }
            catch (e) {
                const err = e;
                return this.fail(res, err.message);
            }
        });
        this.getChildUserList = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const currentUser = req.user;
                const { username, matchId } = req.query;
                const regex = username ? new RegExp(username, 'i') : '';
                const users = yield User_1.User.paginate({
                    username: { $regex: regex },
                    parentStr: { $elemMatch: { $eq: mongoose_1.Types.ObjectId(currentUser._id) } },
                    role: Role_1.RoleType.user,
                }, { select: { _id: 1, username: 1 }, lean: true });
                const searchUsers = users.docs.map((user) => {
                    return mongoose_1.Types.ObjectId(user._id);
                });
                const betLockUsers = yield BetLock_1.BetLock.find({
                    userId: { $in: searchUsers },
                    parentId: mongoose_1.Types.ObjectId(currentUser._id),
                    matchId,
                }).lean();
                const usersWithBetLock = users.docs.map((user) => {
                    const lockUser = betLockUsers.find((u) => u.userId.equals(user._id));
                    if (lockUser && lockUser._id)
                        delete lockUser._id;
                    return Object.assign(Object.assign({}, user), lockUser);
                });
                users.docs = usersWithBetLock;
                return this.success(res, users);
            }
            catch (e) {
                const err = e;
                return this.fail(res, err.message);
            }
        });
        this.usersLock = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { ids, lock, type } = req.body;
                const user = req.user;
                switch (type) {
                    case 'betLock':
                        yield User_1.User.updateMany({
                            _id: { $in: ids },
                            parentStr: { $elemMatch: { $eq: mongoose_1.Types.ObjectId(user._id) } },
                            role: { $ne: Role_1.RoleType.admin },
                        }, { $set: { betLock: lock } });
                        break;
                    case 'loginLock':
                        yield User_1.User.updateMany({
                            _id: { $in: ids },
                            parentStr: { $elemMatch: { $eq: mongoose_1.Types.ObjectId(user._id) } },
                            role: { $ne: Role_1.RoleType.admin },
                        }, { $set: { isLogin: lock } });
                        break;
                }
                this.success(res, { success: true }, 'Actions succesfully saved');
            }
            catch (e) {
                const err = e;
                this.fail(res, err.message);
            }
        });
    }
}
exports.BetLockController = BetLockController;
//# sourceMappingURL=BetLockController.js.map