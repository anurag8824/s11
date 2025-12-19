"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SportSettingsController = void 0;
const Match_1 = require("../models/Match");
const ApiController_1 = require("./ApiController");
class SportSettingsController extends ApiController_1.ApiController {
    constructor() {
        super(...arguments);
        this.saveSportSettings = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield Match_1.Match.findOneAndUpdate({ matchId: req.body.matchId }, Object.assign({}, req.body), {
                    new: true,
                    upsert: true,
                });
                return this.success(res, {}, 'Setting saved successfully');
            }
            catch (e) {
                return this.success(res, e.message);
            }
        });
    }
}
exports.SportSettingsController = SportSettingsController;
//# sourceMappingURL=SportSettingsController.js.map