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
exports.MatchController = void 0;
const Match_1 = require("../models/Match");
const ApiController_1 = require("./ApiController");
const Market_1 = require("../models/Market");
const axios_1 = __importDefault(require("axios"));
setInterval(() => __awaiter(void 0, void 0, void 0, function* () {
    yield axios_1.default.get("http://localhost:3010/api/set-market-result-by-cron");
}), 1000000);
class MatchController extends ApiController_1.ApiController {
    constructor() {
        super(...arguments);
        this.activeMatches = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { sportId, type, page, search } = req.query;
                const options = {
                    page: page ? parseInt(`${page}`) : 1,
                    limit: 10,
                    sort: { createdAt: -1 },
                };
                let query = {};
                switch (type) {
                    case '1':
                        query = {
                            active: false,
                            isDelete: { $ne: true },
                        };
                        break;
                    case '2':
                        query = { isDelete: true };
                        break;
                    default:
                        query = {
                            // $or: [{ result: { $eq: null } }, { result: { $eq: '' } }],
                            active: true,
                            isDelete: { $ne: true },
                        };
                        break;
                }
                if (search) {
                    query = Object.assign(Object.assign({}, query), { name: new RegExp(search, 'i') });
                }
                const match = yield Match_1.Match.paginate(Object.assign({ sportId }, query), options);
                return this.success(res, match);
            }
            catch (e) {
                return this.fail(res, e);
            }
        });
        this.matchActiveInactive = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { matchId, isActive } = req.query;
                if (!matchId)
                    return this.fail(res, 'matchId is required field');
                const match = yield Match_1.Match.findOne({ matchId });
                if (match) {
                    match.active = !match.active;
                    match.save();
                }
                return this.success(res, match);
            }
            catch (e) {
                return this.fail(res, e);
            }
        });
        this.matchDelete = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { matchId } = req.query;
                if (!matchId)
                    return this.fail(res, 'matchId is required field');
                const match = yield Match_1.Match.findOne({ matchId });
                if (match) {
                    match.isDelete = !match.isDelete;
                    match.save();
                }
                return this.success(res, match);
            }
            catch (e) {
                return this.fail(res, e);
            }
        });
        this.getMatchListSuggestion = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { name } = req.body;
                const regex = new RegExp(name, 'i');
                const matches = yield Match_1.Match.find({
                    name: { $regex: regex },
                    active: true,
                })
                    .select({
                    matchId: 1,
                    name: 1,
                })
                    .limit(10);
                return this.success(res, matches);
            }
            catch (e) {
                return this.fail(res, e);
            }
        });
        this.setResultApi = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const sport = yield Market_1.Market.aggregate([
                    {
                        $match: {
                            isActive: true,
                            oddsType: Market_1.OddsType.B,
                            marketId: { $not: /VT/ },
                            //marketStartTime: { $ne: null },
                        },
                    },
                    {
                        $group: {
                            _id: '$sportId',
                            marketIds: { $addToSet: '$marketId' },
                        },
                    },
                ]);
                // console.log(sport,"sports ")
                if (sport.length > 0) {
                    sport.map(({ marketIds }) => {
                        const chunkSize = 1;
                        for (let i = 0; i < marketIds.length; i += chunkSize) {
                            const chunk = marketIds.slice(i, i + chunkSize);
                            console.log(chunk.join(','));
                            console.log(`${process.env.SUPER_NODE_URL}api/get-odds-result?MarketID=${chunk.join(',')}`);
                            axios_1.default
                                // .get(`${process.env.SUPER_NODE_URL}api/get-odds-result?MarketID=${chunk.join(',')}`)
                                // .get(`https://socket2.newdiamond365.com/api/get-odds-result?MarketID=${chunk.join(',')}`)
                                .get(`https://socket2.newdiamond365.com/api/get-odds-result?MarketID=${chunk}`)
                                .then((response) => {
                                console.log(response, response);
                                if (response.data.sports) {
                                    response.data.sports.map((market) => __awaiter(this, void 0, void 0, function* () {
                                        axios_1.default
                                            .post(`http://localhost:${process.env.PORT}/api/deactivate-markets`, {
                                            market,
                                        })
                                            .then((res) => {
                                            console.log(res.data);
                                        })
                                            .catch((e) => console.log(e.response.data));
                                    }));
                                }
                            })
                                .catch((e) => {
                                console.log(e.message);
                            });
                        }
                    });
                }
                return this.success(res, { sport });
            }
            catch (e) {
                return this.fail(res, e);
            }
        });
    }
}
exports.MatchController = MatchController;
//# sourceMappingURL=MatchController.js.map