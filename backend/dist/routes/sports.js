"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SportRoutes = void 0;
const express_1 = require("express");
const SportsController_1 = __importDefault(require("../controllers/SportsController"));
const Http_1 = __importDefault(require("../middlewares/Http"));
const Passport_1 = __importDefault(require("../passport/Passport"));
const match_validation_1 = require("../validations/match.validation");
const sport_validation_1 = require("../validations/sport.validation");
class SportRoutes {
    constructor() {
        this.SportController = new SportsController_1.default();
        this.router = (0, express_1.Router)();
        this.routes();
    }
    routes() {
        this.router.get('/get-sport-list', this.SportController.getSportList);
        this.router.post('/add-new-fancy', this.SportController.addFancyToDb);
        this.router.post('/deactivate-fancy', this.SportController.deactivateFancy);
        this.router.post('/deactivate-markets', this.SportController.deactivateMarkets);
        this.router.post('/activate-markets', this.SportController.activateMarkets);
        this.router.get('/get-series-with-market', this.SportController.getSeriesWithMarket);
        this.router.get('/get-series-with-market-with-date', this.SportController.getSeriesWithMarketWithDate);
        this.router.post('/inplay-market', this.SportController.inplayMarket);
        this.router.post('/save-series', sport_validation_1.saveSeriesValidation, Http_1.default.validateRequest, this.SportController.saveSeries);
        this.router.post('/save-match', match_validation_1.saveMatchValidation, Http_1.default.validateRequest, this.SportController.saveMatch);
        this.router.get('/get-match-list', this.SportController.getMatchList);
        this.router.get('/get-fancy-list', match_validation_1.matchIdValidation, Http_1.default.validateRequest, this.SportController.getFancyList);
        this.router.get('/get-match-by-id', Passport_1.default.authenticateJWT, match_validation_1.matchIdValidation, Http_1.default.validateRequest, this.SportController.getMatchById);
        this.router.get('/get-market-list', Passport_1.default.authenticateJWT, match_validation_1.matchIdValidation, Http_1.default.validateRequest, this.SportController.getMarketList);
    }
}
exports.SportRoutes = SportRoutes;
//# sourceMappingURL=sports.js.map