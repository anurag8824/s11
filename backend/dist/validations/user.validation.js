"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetTxnPassword = exports.saveGenSettings = exports.refreshTokenValidation = exports.walletValidation = exports.accountBalanceValidation = exports.statusValidation = exports.passwordUpdateValidation = exports.signupValidation = void 0;
const express_validator_1 = require("express-validator");
exports.signupValidation = [
    (0, express_validator_1.check)('username', 'Username is requied').not().isEmpty(),
    // check("email", "Please include a valid email")
    //   .isEmail()
    //   .normalizeEmail({ gmail_remove_dots: true }),
    (0, express_validator_1.check)('password', 'Password must be 6 or more characters').isLength({
        min: 6,
    }),
    (0, express_validator_1.check)('role', 'Role is requied').not().isEmpty().isIn(['sadmin', 'smdl', 'mdl', 'dl', 'user']),
    (0, express_validator_1.check)('parent', 'Parent is requied').not().isEmpty(),
    // check('creditRefrences', 'Credit Refrences is requied').not().isEmpty(),
    //check('exposerLimit', 'exposerLimit is requied').not().isEmpty(),
    // check('transactionPassword', 'Transaction Password is required').not().isEmpty(),
];
exports.passwordUpdateValidation = [
    (0, express_validator_1.check)('username', 'Username is requied').not().isEmpty(),
    (0, express_validator_1.check)('password', 'Password must be 6 or more characters').isLength({
        min: 6,
    }),
    (0, express_validator_1.check)('confirmPassword', 'Password must be 6 or more characters').isLength({
        min: 6,
    }),
    (0, express_validator_1.check)('transactionPassword', 'Transaction Password is required').not().isEmpty(),
];
exports.statusValidation = [
    (0, express_validator_1.check)('username', 'Username is requied').not().isEmpty(),
    (0, express_validator_1.check)('isUserActive', 'User active value required').not().isEmpty(),
    (0, express_validator_1.check)('isUserBetActive', 'User bet value required').not().isEmpty(),
    // check('transactionPassword', 'Transaction Password is required').not().isEmpty(),
];
exports.accountBalanceValidation = [
    (0, express_validator_1.check)('userId', 'User id is requied').not().isEmpty(),
    (0, express_validator_1.check)('parentUserId', 'Parent user id is requied').not().isEmpty(),
    (0, express_validator_1.check)('amount', 'Amount value required').not().isEmpty(),
    (0, express_validator_1.check)('balanceUpdateType', 'Balance type required').not().isEmpty().isIn(['W', 'D']),
    (0, express_validator_1.check)('transactionPassword', 'Transaction Password is required').not().isEmpty(),
];
exports.walletValidation = [
    (0, express_validator_1.check)('username', 'User name is requied').not().isEmpty(),
    (0, express_validator_1.check)('amount', 'Amount value required').not().isEmpty(),
    (0, express_validator_1.check)('walletUpdateType', 'Wallet type required').not().isEmpty().isIn(['EXP', 'CRD']),
    (0, express_validator_1.check)('transactionPassword', 'Transaction Password is required').not().isEmpty(),
];
exports.refreshTokenValidation = [(0, express_validator_1.check)('token', 'token is requied').not().isEmpty()];
exports.saveGenSettings = [
    (0, express_validator_1.check)('userId', 'User id is requied').not().isEmpty(),
    (0, express_validator_1.check)('userSetting.1.minBet').isInt(),
    (0, express_validator_1.check)('userSetting.1.maxBet').isInt(),
    (0, express_validator_1.check)('userSetting.1.delay').isInt(),
    (0, express_validator_1.check)('userSetting.2.minBet').isInt(),
    (0, express_validator_1.check)('userSetting.2.maxBet').isInt(),
    (0, express_validator_1.check)('userSetting.2.delay').isInt(),
    (0, express_validator_1.check)('userSetting.4.minBet').isInt(),
    (0, express_validator_1.check)('userSetting.4.maxBet').isInt(),
    (0, express_validator_1.check)('userSetting.4.delay').isInt(),
    (0, express_validator_1.check)('transactionPassword', 'Transaction Password is required').not().isEmpty(),
];
exports.resetTxnPassword = [
    (0, express_validator_1.check)('userId', 'User id is requied').not().isEmpty(),
    (0, express_validator_1.check)('transactionPassword', 'Transaction Password is required').not().isEmpty(),
];
//# sourceMappingURL=user.validation.js.map