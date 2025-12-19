"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveSportSettings = void 0;
const express_validator_1 = require("express-validator");
exports.saveSportSettings = [
    (0, express_validator_1.check)('matchId', 'Series Id is requied').not().isEmpty(),
    (0, express_validator_1.check)('inPlayMinLimit', 'inPlayMinLimit is requied').not().isEmpty(),
    (0, express_validator_1.check)('inPlayMaxLimit', 'inPlayMaxLimit is requied').not().isEmpty(),
    (0, express_validator_1.check)('offPlayMinLimit', 'offPlayMinLimit is requied').not().isEmpty(),
    (0, express_validator_1.check)('offPlayMaxLimit', 'offPlayMaxLimit is requied').not().isEmpty(),
];
//# sourceMappingURL=sport-settings.validation.js.map