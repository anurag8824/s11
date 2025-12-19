"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FancyRoutes = void 0;
const express_1 = require("express");
const FancyController_1 = require("../controllers/FancyController");
const Http_1 = __importDefault(require("../middlewares/Http"));
const Passport_1 = __importDefault(require("../passport/Passport"));
class FancyRoutes {
    constructor() {
        this.FancyController = new FancyController_1.FancyController();
        this.router = (0, express_1.Router)();
        this.routes();
    }
    routes() {
        this.router.get('/active-fancies', Passport_1.default.authenticateJWT, Http_1.default.adminUserRequest, this.FancyController.activeFancies);
        this.router.get('/suspend-fancy', Passport_1.default.authenticateJWT, Http_1.default.adminUserRequest, this.FancyController.suspendFancy);
        this.router.get('/result-fancy', Passport_1.default.authenticateJWT, Http_1.default.adminUserRequest, this.FancyController.declarefancyresult);
        this.router.get('/result-market', Passport_1.default.authenticateJWT, Http_1.default.adminUserRequest, this.FancyController.declaremarketresult);
        this.router.get('/rollback-result-market', Passport_1.default.authenticateJWT, Http_1.default.adminUserRequest, this.FancyController.rollbackmarketresult);
        this.router.get('/rollback-result-market-wise', Passport_1.default.authenticateJWT, Http_1.default.adminUserRequest, this.FancyController.rollbackmarketwiseresult);
        this.router.post('/get-cas-casino-play-url', Passport_1.default.authenticateJWT, this.FancyController.getCasPlayUrl);
        this.router.get('/fancy-result-rollback', Passport_1.default.authenticateJWT, Http_1.default.adminUserRequest, this.FancyController.rollbackfancyresult);
        this.router.post('/check-user-pnl', Passport_1.default.authenticateJWT, this.FancyController.apiupdateUserBal);
        // this.router.get(
        //   "/change-status-Fancy",
        //   Passport.authenticateJWT,
        //   Http.adminUserRequest,
        //   this.FancyController.FancyActiveInactive
        // );
        // this.router.get(
        //   "/delete-Fancy",
        //   Passport.authenticateJWT,
        //   Http.adminUserRequest,
        //   this.FancyController.FancyDelete
        // );
    }
}
exports.FancyRoutes = FancyRoutes;
//# sourceMappingURL=fancy.js.map