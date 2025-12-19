"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketRoutes = void 0;
const express_1 = require("express");
const MarketController_1 = require("../controllers/MarketController");
const Http_1 = __importDefault(require("../middlewares/Http"));
const Passport_1 = __importDefault(require("../passport/Passport"));
class MarketRoutes {
    constructor() {
        this.MarketController = new MarketController_1.MarketController();
        this.router = (0, express_1.Router)();
        this.routes();
    }
    routes() {
        this.router.get('/active-markets', Passport_1.default.authenticateJWT, Http_1.default.adminUserRequest, this.MarketController.activeMarkets);
        this.router.get('/change-status-markets', Passport_1.default.authenticateJWT, Http_1.default.adminUserRequest, this.MarketController.marketActiveInactive);
        this.router.get('/delete-market', Passport_1.default.authenticateJWT, Http_1.default.adminUserRequest, this.MarketController.marketDelete);
    }
}
exports.MarketRoutes = MarketRoutes;
//# sourceMappingURL=market.js.map