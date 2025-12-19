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
exports.MarketController = void 0;
const Market_1 = require("../models/Market");
const ApiController_1 = require("./ApiController");
class MarketController extends ApiController_1.ApiController {
    constructor() {
        super(...arguments);
        this.activeMarkets = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { matchId } = req.query;
                if (!matchId)
                    return this.fail(res, 'matchId is required field');
                const match = yield Market_1.Market.find({ matchId, skipPreHook: true });
                return this.success(res, match);
            }
            catch (e) {
                return this.fail(res, e);
            }
        });
        this.marketActiveInactive = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { marketId, isActive, matchId } = req.query;
                if (!marketId)
                    return this.fail(res, 'marketId is required field');
                const market = yield Market_1.Market.findOne({ marketId, matchId });
                if (market) {
                    market.isActive = !market.isActive;
                    market.save();
                }
                return this.success(res, market);
            }
            catch (e) {
                return this.fail(res, e);
            }
        });
        this.marketDelete = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { marketId, isDelete, matchId } = req.query;
                if (!marketId)
                    return this.fail(res, 'marketId is required field');
                const market = yield Market_1.Market.findOne({ marketId, matchId });
                if (market) {
                    market.isDelete = !market.isDelete;
                    market.save();
                }
                return this.success(res, market);
            }
            catch (e) {
                return this.fail(res, e);
            }
        });
    }
}
exports.MarketController = MarketController;
//# sourceMappingURL=MarketController.js.map