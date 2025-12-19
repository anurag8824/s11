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
exports.UserStakeController = void 0;
const UserBetStake_1 = require("../models/UserBetStake");
const ApiController_1 = require("./ApiController");
class UserStakeController extends ApiController_1.ApiController {
    constructor() {
        super(...arguments);
        this.getStake = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const user = req.user;
            const userStake = yield UserBetStake_1.UserBetStake.findOne({ userId: user === null || user === void 0 ? void 0 : user._id });
            this.success(res, { userStake });
        });
        this.saveStake = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const userStake = req.body;
            const user = req.user;
            userStake.userId = user._id;
            const userStakes = yield UserBetStake_1.UserBetStake.findOneAndUpdate({ userId: user._id }, userStake, {
                new: true,
                upsert: true,
            });
            this.success(res, { userStakes });
        });
    }
}
exports.UserStakeController = UserStakeController;
//# sourceMappingURL=UserStakeController.js.map