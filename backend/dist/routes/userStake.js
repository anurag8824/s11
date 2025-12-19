"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserStakeRoutes = void 0;
const express_1 = require("express");
const Passport_1 = __importDefault(require("../passport/Passport"));
const Http_1 = __importDefault(require("../middlewares/Http"));
const UserStakeController_1 = require("../controllers/UserStakeController");
const userStake_validation_1 = require("../validations/userStake.validation");
class UserStakeRoutes {
    constructor() {
        this.userStakeController = new UserStakeController_1.UserStakeController();
        this.router = (0, express_1.Router)();
        this.routes();
    }
    routes() {
        this.router.get('/get-user-stake', Passport_1.default.authenticateJWT, this.userStakeController.getStake);
        this.router.post('/save-user-stake', Passport_1.default.authenticateJWT, userStake_validation_1.userStakeValidation, Http_1.default.validateRequest, this.userStakeController.saveStake);
    }
}
exports.UserStakeRoutes = UserStakeRoutes;
//# sourceMappingURL=userStake.js.map