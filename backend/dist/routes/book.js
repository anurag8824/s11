"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserBookRoutes = void 0;
const express_1 = require("express");
const Passport_1 = __importDefault(require("../passport/Passport"));
const UserBookController_1 = require("../controllers/UserBookController");
class UserBookRoutes {
    constructor() {
        this.userBookController = new UserBookController_1.UserBookController();
        this.router = (0, express_1.Router)();
        this.routes();
    }
    routes() {
        this.router.post('/get-fancy-position', Passport_1.default.authenticateJWT, this.userBookController.getfancybook);
        this.router.get('/get-market-analysis', Passport_1.default.authenticateJWT, this.userBookController.getmarketanalysis);
        this.router.get('/get-user-book', Passport_1.default.authenticateJWT, this.userBookController.getuserbook);
        this.router.post('/get-user-wise-book', Passport_1.default.authenticateJWT, this.userBookController.getUserWiseBook);
    }
}
exports.UserBookRoutes = UserBookRoutes;
//# sourceMappingURL=book.js.map