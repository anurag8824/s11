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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.T10ResultController = void 0;
const axios_1 = __importDefault(require("axios"));
const Fancy_1 = require("../models/Fancy");
const ApiController_1 = require("./ApiController");
class T10ResultController extends ApiController_1.ApiController {
    constructor() {
        super(...arguments);
        this.fancyOverRunResult = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { result, matchId, over, type } = req.query;
                if (!type)
                    return this.fail(res, 'type is required field');
                if (!over)
                    return this.fail(res, 'over is required field');
                if (!result)
                    return this.fail(res, 'result is required field');
                if (!matchId)
                    return this.fail(res, 'matchId is required field');
                switch (type) {
                    case 'run':
                    case 'only-run':
                        {
                            const orConditions = [];
                            const orCondition = type == 'run' ? `^${over} over run` : `^Only ${over} over run`;
                            orConditions.push({ fancyName: { $regex: orCondition } });
                            if (over == '1') {
                                orConditions.push({ fancyName: { $regex: `^Match 1st over run` } });
                            }
                            const fancies = yield Fancy_1.Fancy.find({
                                matchId: matchId,
                                result: null,
                                $or: orConditions,
                            }).lean();
                            if (fancies.length > 0) {
                                this.callResultApi(fancies, matchId, result);
                                return this.success(res, {}, 'Result Set');
                            }
                        }
                        break;
                    case 'wkt':
                        {
                            const fancies = yield Fancy_1.Fancy.find({
                                matchId: matchId,
                                result: null,
                                $or: [{ fancyName: { $regex: `^Fall of ${over}` } }],
                            }).lean();
                            if (fancies.length > 0) {
                                this.callResultApi(fancies, matchId, result);
                                return this.success(res, {}, 'Result Set');
                            }
                        }
                        break;
                }
                return this.success(res, {}, 'No result to set');
            }
            catch (e) {
                return this.fail(res, e);
            }
        });
        this.callResultApi = (fancies, matchId, result) => {
            fancies.map((fancy) => __awaiter(this, void 0, void 0, function* () {
                yield axios_1.default
                    .get(`http://localhost:${process.env.PORT}/api/result-fancy-no-token?matchId=${matchId}&marketId=${fancy.marketId}&result=${result}`)
                    .catch((e) => console.log(e.stack));
            }));
        };
    }
}
exports.T10ResultController = T10ResultController;
//# sourceMappingURL=T10ResultController.js.map