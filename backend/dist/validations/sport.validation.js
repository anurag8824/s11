"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveSeriesValidation = void 0;
const express_validator_1 = require("express-validator");
exports.saveSeriesValidation = [
    (0, express_validator_1.check)('seriesId', 'Series Id is requied').not().isEmpty(),
    (0, express_validator_1.check)('sportId', 'Sport Id is requied').not().isEmpty(),
    (0, express_validator_1.check)('seriesName', 'Series Name is requied').not().isEmpty(),
    (0, express_validator_1.check)('region', 'Region is requied').not().isEmpty(),
    (0, express_validator_1.check)('marketCount', 'MarketCount is requied').not().isEmpty(),
];
//# sourceMappingURL=sport.validation.js.map