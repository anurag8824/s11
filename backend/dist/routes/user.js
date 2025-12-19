"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoutes = void 0;
const express_1 = require("express");
const AuthController_1 = require("../controllers/AuthController");
const Passport_1 = __importDefault(require("../passport/Passport"));
const user_validation_1 = require("../validations/user.validation");
const Http_1 = __importDefault(require("../middlewares/Http"));
const DealersController_1 = require("../controllers/DealersController");
const AccountController_1 = require("../controllers/AccountController");
class UserRoutes {
    constructor() {
        this.authController = new AuthController_1.AuthController();
        this.dealerController = new DealersController_1.DealersController();
        this.accountController = new AccountController_1.AccountController();
        this.router = (0, express_1.Router)();
        this.routes();
    }
    routes() {
        this.router.get('/user-info', Passport_1.default.authenticateJWT, this.authController.getUser);
        /* Dealer Routes */
        this.router.post('/register', user_validation_1.signupValidation, Http_1.default.validateRequest, Passport_1.default.authenticateJWT, this.dealerController.signUp);
        this.router.post('/refresh-token', user_validation_1.refreshTokenValidation, Http_1.default.validateRequest, this.authController.refreshToken);
        this.router.get('/get-user-list', Passport_1.default.authenticateJWT, this.dealerController.getUserList);
        this.router.get('/get-user-detail', Passport_1.default.authenticateJWT, this.dealerController.getUserDetail);
        this.router.get('/get-parent-user-detail', Passport_1.default.authenticateJWT, this.dealerController.getParentUserDetail);
        this.router.post('/update-user', user_validation_1.passwordUpdateValidation, Http_1.default.validateRequest, Passport_1.default.authenticateJWT, this.dealerController.updateUser);
        this.router.post('/update-user-status', user_validation_1.statusValidation, Http_1.default.validateRequest, Passport_1.default.authenticateJWT, this.dealerController.updateUserStatus);
        this.router.post('/update-user-wallet', user_validation_1.walletValidation, Http_1.default.validateRequest, Passport_1.default.authenticateJWT, this.dealerController.updateUserWallet);
        this.router.post('/update-user-whatsapp', Http_1.default.validateRequest, Passport_1.default.authenticateJWT, this.dealerController.updateUserWhatsapp);
        this.router.post('/user-account-balance', user_validation_1.accountBalanceValidation, Http_1.default.validateRequest, Passport_1.default.authenticateJWT, this.accountController.saveUserDepositFC);
        this.router.get('/get-user-balance', Passport_1.default.authenticateJWT, this.accountController.getUserBalanceWithExposer);
        this.router.post('/update-password', Passport_1.default.authenticateJWT, this.authController.updatePassword);
        this.router.post('/get-user-list-suggestion', Passport_1.default.authenticateJWT, this.dealerController.getUserListSuggestion);
        this.router.post('/add-transaction-password', Passport_1.default.authenticateJWT, this.authController.addTransactionPassword);
        this.router.post('/save-general-setting', user_validation_1.saveGenSettings, Http_1.default.validateRequest, Passport_1.default.authenticateJWT, this.dealerController.saveGeneralSettings);
        this.router.post('/reset-transaction-password', user_validation_1.resetTxnPassword, Http_1.default.validateRequest, Passport_1.default.authenticateJWT, this.dealerController.resetTransactionPassword);
    }
}
exports.UserRoutes = UserRoutes;
//# sourceMappingURL=user.js.map