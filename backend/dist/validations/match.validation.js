"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.matchIdValidation = exports.saveMatchValidation = void 0;
const express_validator_1 = require("express-validator");
exports.saveMatchValidation = [
    (0, express_validator_1.check)('matches.*.sportId', 'Sport Id is requied').not().isEmpty(),
    (0, express_validator_1.check)('matches.*.seriesId', 'Series Id is requied').not().isEmpty(),
    (0, express_validator_1.check)('matches.*.countryCode', 'Country Code is requied').not().isEmpty(),
    (0, express_validator_1.check)('matches.*.matchDateTime', 'Match Date Time is requied').not().isEmpty(),
    (0, express_validator_1.check)('matches.*.name', 'name is requied').not().isEmpty(),
    (0, express_validator_1.check)('matches.*.matchId', 'Match Id is requied').not().isEmpty(),
];
exports.matchIdValidation = [(0, express_validator_1.check)('matchId', 'Match Id is requied').not().isEmpty()];
//# sourceMappingURL=match.validation.js.map