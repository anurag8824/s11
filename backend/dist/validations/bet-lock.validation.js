"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.betLockValidation = void 0;
const express_validator_1 = require("express-validator");
exports.betLockValidation = [
    (0, express_validator_1.check)('match.matchId', 'Match Id is requied').not().isEmpty(),
    (0, express_validator_1.check)('type', 'Type is requied').not().isEmpty().isIn(['M', 'B', 'F']), // M=>Match Odds, B=Book,F=Fancy
];
//# sourceMappingURL=bet-lock.validation.js.map