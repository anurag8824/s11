"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SportSettingsRoutes = void 0;
const express_1 = require("express");
const SportSettingsController_1 = require("../controllers/SportSettingsController");
const Http_1 = __importDefault(require("../middlewares/Http"));
const Passport_1 = __importDefault(require("../passport/Passport"));
const sport_settings_validation_1 = require("../validations/sport-settings.validation");
class SportSettingsRoutes {
    constructor() {
        this.SportSettingsController = new SportSettingsController_1.SportSettingsController();
        this.router = (0, express_1.Router)();
        this.routes();
    }
    routes() {
        this.router.post('/save-sport-settings', Passport_1.default.authenticateJWT, sport_settings_validation_1.saveSportSettings, Http_1.default.validateRequest, this.SportSettingsController.saveSportSettings);
    }
}
exports.SportSettingsRoutes = SportSettingsRoutes;
//# sourceMappingURL=sport-settings.js.map