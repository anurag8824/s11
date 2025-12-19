"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userStakeValidation = void 0;
const express_validator_1 = require("express-validator");
exports.userStakeValidation = [
    (0, express_validator_1.check)('name1', 'Name1 is requied').not().isEmpty(),
    (0, express_validator_1.check)('value1', 'Value1 is requied').not().isEmpty(),
    (0, express_validator_1.check)('name2', 'Name2 is requied').not().isEmpty(),
    (0, express_validator_1.check)('value2', 'Value2 is requied').not().isEmpty(),
    (0, express_validator_1.check)('name3', 'Name3 is requied').not().isEmpty(),
    (0, express_validator_1.check)('value3', 'Value3 is requied').not().isEmpty(),
    (0, express_validator_1.check)('name4', 'Name4 is requied').not().isEmpty(),
    (0, express_validator_1.check)('value4', 'Value4 is requied').not().isEmpty(),
    (0, express_validator_1.check)('name5', 'Name5 is requied').not().isEmpty(),
    (0, express_validator_1.check)('value5', 'Value5 is requied').not().isEmpty(),
    (0, express_validator_1.check)('name6', 'Name6 is requied').not().isEmpty(),
    (0, express_validator_1.check)('value6', 'Value6 is requied').not().isEmpty(),
    (0, express_validator_1.check)('name7', 'Name7 is requied').not().isEmpty(),
    (0, express_validator_1.check)('value7', 'Value7 is requied').not().isEmpty(),
    (0, express_validator_1.check)('name8', 'Name8 is requied').not().isEmpty(),
    (0, express_validator_1.check)('value8', 'Value8 is requied').not().isEmpty(),
    (0, express_validator_1.check)('name9', 'Name9 is requied').not().isEmpty(),
    (0, express_validator_1.check)('value9', 'Value9 is requied').not().isEmpty(),
    (0, express_validator_1.check)('name10', 'Name10 is requied').not().isEmpty(),
    (0, express_validator_1.check)('value10', 'Value10 is requied').not().isEmpty(),
];
//# sourceMappingURL=userStake.validation.js.map