"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepositWithdrawRoutes = void 0;
const express_1 = require("express");
const Passport_1 = __importDefault(require("../passport/Passport"));
const Http_1 = __importDefault(require("../middlewares/Http"));
const multer_1 = __importDefault(require("multer"));
const node_path_1 = __importDefault(require("node:path"));
const DepositWithdrawController_1 = require("../controllers/DepositWithdrawController");
const deposit_withdraw_validation_1 = require("../validations/deposit-withdraw.validation");
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        // Set the destination folder
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        // Preserve the original extension
        const ext = node_path_1.default.extname(file.originalname);
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
        cb(null, uniqueName);
    },
});
const upload = (0, multer_1.default)({ storage });
class DepositWithdrawRoutes {
    constructor() {
        this.DepositWithdrawController = new DepositWithdrawController_1.DepositWithdrawController();
        this.router = (0, express_1.Router)();
        this.routes();
    }
    routes() {
        this.router.post('/add-bank-account', Passport_1.default.authenticateJWT, deposit_withdraw_validation_1.addBankAccountValidation, Http_1.default.validateRequest, this.DepositWithdrawController.addBankAccount);
        this.router.post('/add-upi', Passport_1.default.authenticateJWT, deposit_withdraw_validation_1.upiValidation, Http_1.default.validateRequest, this.DepositWithdrawController.addUpi);
        this.router.post('/delete-upi-bank', Passport_1.default.authenticateJWT, deposit_withdraw_validation_1.deleteBankUpiValidation, Http_1.default.validateRequest, this.DepositWithdrawController.deleteBankAndUpiAccount);
        this.router.post('/add-deposit-withdraw', upload.single('imageUrl'), Passport_1.default.authenticateJWT, deposit_withdraw_validation_1.addDepositWithdraw, Http_1.default.validateRequest, this.DepositWithdrawController.addDepositWithdraw);
        this.router.get('/get-bank-and-upi-list', Passport_1.default.authenticateJWT, this.DepositWithdrawController.getBankAndUpiAccount);
        this.router.post('/get-deposit-withdraw-list', Passport_1.default.authenticateJWT, deposit_withdraw_validation_1.getDepositWithdraw, Http_1.default.validateRequest, this.DepositWithdrawController.getDepositWithdraw);
        this.router.post('/update-deposit-withdraw-status', Passport_1.default.authenticateJWT, deposit_withdraw_validation_1.updateDepositWithdraw, Http_1.default.validateRequest, this.DepositWithdrawController.updateDepositWithdraw);
    }
}
exports.DepositWithdrawRoutes = DepositWithdrawRoutes;
//# sourceMappingURL=deposit-withdraw.js.map