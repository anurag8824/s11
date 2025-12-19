"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDepositWithdraw = exports.getDepositWithdraw = exports.addDepositWithdraw = exports.deleteBankUpiValidation = exports.upiValidation = exports.addBankAccountValidation = void 0;
const express_validator_1 = require("express-validator");
exports.addBankAccountValidation = [
    (0, express_validator_1.check)('accountHolderName', 'Account Holder name is required').not().isEmpty(),
    (0, express_validator_1.check)('accountNumber', 'Account number is required').not().isEmpty(),
    (0, express_validator_1.check)('ifscCode', 'IFSC code is required').not().isEmpty(),
];
exports.upiValidation = [(0, express_validator_1.check)('upiId', 'Upi id is required').not().isEmpty()];
exports.deleteBankUpiValidation = [
    (0, express_validator_1.check)('type', 'type is required')
        .not()
        .isEmpty()
        .isIn(['upi', 'bank'])
        .withMessage('type should be upi or bank'),
    (0, express_validator_1.check)('id', 'id is required').not().isEmpty(),
];
exports.addDepositWithdraw = [
    (0, express_validator_1.check)('type', 'type is required')
        .not()
        .isEmpty()
        .isIn(['deposit', 'withdraw'])
        .withMessage('type should be deposit or withdraw'),
    (0, express_validator_1.check)('amount', 'amount is required')
        .not()
        .isEmpty()
        .isNumeric()
        .withMessage('amount should be number'),
    (0, express_validator_1.check)('remark', 'remark is required').not().isEmpty(),
];
exports.getDepositWithdraw = [
    (0, express_validator_1.check)('type', 'type is required')
        .not()
        .isEmpty()
        .isIn(['deposit', 'withdraw'])
        .withMessage('type should be deposit or withdraw'),
];
exports.updateDepositWithdraw = [
    (0, express_validator_1.check)('id', 'id is required').not().isEmpty(),
    (0, express_validator_1.check)('narration', 'Narration is required').not().isEmpty(),
    (0, express_validator_1.check)('balanceUpdateType', 'Balance type required').not().isEmpty().isIn(['W', 'D']),
    (0, express_validator_1.check)('status', 'Status required').not().isEmpty().isIn(['approved', 'rejected']),
];
//# sourceMappingURL=deposit-withdraw.validation.js.map