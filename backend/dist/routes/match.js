"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchRoutes = void 0;
const express_1 = require("express");
const MatchController_1 = require("../controllers/MatchController");
const Http_1 = __importDefault(require("../middlewares/Http"));
const Passport_1 = __importDefault(require("../passport/Passport"));
class MatchRoutes {
    constructor() {
        this.MatchController = new MatchController_1.MatchController();
        this.router = (0, express_1.Router)();
        this.routes();
    }
    routes() {
        this.router.get('/active-matches', Passport_1.default.authenticateJWT, Http_1.default.adminUserRequest, this.MatchController.activeMatches);
        this.router.get('/change-status-match', Passport_1.default.authenticateJWT, Http_1.default.adminUserRequest, this.MatchController.matchActiveInactive);
        this.router.get('/delete-match', Passport_1.default.authenticateJWT, Http_1.default.adminUserRequest, this.MatchController.matchDelete);
        this.router.post('/get-match-list-suggestion', Passport_1.default.authenticateJWT, this.MatchController.getMatchListSuggestion);
    }
}
exports.MatchRoutes = MatchRoutes;
//# sourceMappingURL=match.js.map