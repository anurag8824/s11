"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountRoutes = void 0;
const express_1 = require("express");
const AccountController_1 = require("../controllers/AccountController");
const Passport_1 = __importDefault(require("../passport/Passport"));
const CasinoController_1 = require("../controllers/CasinoController");
class AccountRoutes {
    constructor() {
        this.AccountController = new AccountController_1.AccountController();
        this.CasinoController = new CasinoController_1.CasinoController();
        this.router = (0, express_1.Router)();
        this.routes();
    }
    routes() {
        // this.router.get(
        //   "/Account",
        //   Passport.authenticateJWT,
        //   this.AccountController.Account
        // );
        // this.router.get("/Account", this.AccountController.Accounts);
        // this.router.post("/Account", this.AccountController.saveAccount);
        this.router.post('/account-statement-list', Passport_1.default.authenticateJWT, this.AccountController.getAccountStmtList);
        this.router.get('/get-casino-games', Passport_1.default.authenticateJWT, this.CasinoController.getCasinoList);
        this.router.get('/get-casino-int-games', Passport_1.default.authenticateJWT, this.CasinoController.getCasinoIntList);
        this.router.get('/disable-casino-games', Passport_1.default.authenticateJWT, this.CasinoController.disableCasinoGame);
        this.router.get('/get-casino-data-by-id/:slug', Passport_1.default.authenticateJWT, this.CasinoController.getCasinoData);
        this.router.get("/html-cards/:type/:roundId", Passport_1.default.authenticateJWT, this.CasinoController.htmlCards);
        this.router.get("/done-results/:type", Passport_1.default.authenticateJWT, this.CasinoController.results);
        this.router.post('/profit-loss', Passport_1.default.authenticateJWT, this.AccountController.profitloss);
    }
}
exports.AccountRoutes = AccountRoutes;
//# sourceMappingURL=account.js.map