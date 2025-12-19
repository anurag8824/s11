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
const Fancy_1 = require("../models/Fancy");
const Market_1 = require("../models/Market");
const Match_1 = require("../models/Match");
const Series_1 = require("../models/Series");
const Sport_1 = require("../models/Sport");
const sports_service_1 = __importDefault(require("../services/sports.service"));
const api_1 = require("../util/api");
const ApiController_1 = require("./ApiController");
const axios_1 = __importDefault(require("axios"));
const UserBetStake_1 = require("../models/UserBetStake");
const SportSetting_1 = require("../models/SportSetting");
const BetLock_1 = require("../models/BetLock");
const setMatchData = () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield axios_1.default.get("http://185.211.4.99:3000/");
});
class SportsController extends ApiController_1.ApiController {
    constructor() {
        super();
        this.getMatchById = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { matchId } = req.query;
                const user = req.user;
                // @ts-ignore
                //.cache(0, 'Matchd-' + matchId)
                const match = yield Match_1.Match.findOne({ matchId });
                const stake = yield UserBetStake_1.UserBetStake.findOne({ userId: user === null || user === void 0 ? void 0 : user._id })
                    .select(['-createdAt', '-updatedAt', '-userId', '-_id'])
                    // @ts-ignore
                    .cache(0, 'user-stack-' + (user === null || user === void 0 ? void 0 : user._id));
                return this.success(res, { match, stake });
            }
            catch (e) {
                return this.fail(res, e);
            }
        });
        this.deactivateMarkets = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { market } = req.body;
                console.log("ghjklhjk", req.body);
                let matchDelete = false;
                let matchId = null;
                if (market && market.marketId) {
                    const marketData = yield Market_1.Market.findOne({ marketId: market.marketId });
                    matchId = marketData === null || marketData === void 0 ? void 0 : marketData.matchId;
                    if (matchId) {
                        if (market === null || market === void 0 ? void 0 : market.runners) {
                            const winnerSid = market.runners.reduce((sid, runner) => {
                                if (runner.status == 'WINNER') {
                                    sid = runner.selectionId;
                                }
                                return sid;
                            }, -1);
                            const winnerName = marketData.runners.reduce((win, name) => {
                                if (name.selectionId == winnerSid)
                                    win = name.runnerName;
                                return win;
                            }, '');
                            console.log(winnerSid, "winnerSidwinnerSidwinnerSidwinnerSid");
                            if (winnerSid) {
                                axios_1.default
                                    .get(`http://localhost:${process.env.PORT}/api/result-market-auto?selectionId=${winnerSid}&matchId=${marketData.matchId}&marketId=${market.marketId}`)
                                    .catch((err) => console.log(err.stack));
                                // await Market.updateOne(
                                //   { matchId, marketId: marketData.marketId },
                                //   { result: winnerSid, resultDelcare: 'processing' },
                                // )
                                if (marketData.marketName == 'Match Odds') {
                                    yield Match_1.Match.updateOne({ matchId }, { active: false });
                                    //Bookmaker result
                                    const BookMarketData = yield Market_1.Market.find({
                                        matchId,
                                        // marketName: { $in: ['Bookmaker', 'Tied Match'] },
                                        oddsType: Market_1.OddsType.BM,
                                    });
                                    if ((BookMarketData === null || BookMarketData === void 0 ? void 0 : BookMarketData.length) > 0) {
                                        BookMarketData.map((bmMarket) => __awaiter(this, void 0, void 0, function* () {
                                            let bmSid = null;
                                            if (bmMarket.marketName === 'Tied Match') {
                                                bmSid = bmMarket.runners.reduce((win, name) => {
                                                    if (name.runnerName.includes('NO'))
                                                        win = name.selectionId;
                                                    return win;
                                                }, null);
                                            }
                                            else {
                                                bmSid = bmMarket.runners.reduce((win, name) => {
                                                    if (name.runnerName.includes(winnerName))
                                                        win = name.selectionId;
                                                    return win;
                                                }, null);
                                            }
                                            axios_1.default
                                                .get(`http://localhost:${process.env.PORT}/api/result-market-auto?selectionId=${bmSid}&matchId=${marketData.matchId}&marketId=${bmMarket.marketId}`)
                                                .catch((err) => console.log(err.stack));
                                            // await Market.updateOne(
                                            //   { matchId, marketId: bmMarket.marketId },
                                            //   { result: bmSid, resultDelcare: 'processing' },
                                            // )
                                        }));
                                    }
                                }
                            }
                        }
                        const ress = yield Market_1.Market.updateMany({ marketId: { $regex: `.*${market.marketId}.*` } }, { $set: { isActive: false } });
                        const activeMarkets = yield Market_1.Market.countDocuments({
                            matchId: matchId,
                            isActive: true,
                        });
                        if (activeMarkets === 0) {
                            matchDelete = true;
                            yield Match_1.Match.updateMany({ matchId }, { $set: { active: false, inPlay: false } });
                            yield Fancy_1.Fancy.updateMany({ matchId }, { $set: { active: false } });
                            yield BetLock_1.BetLock.deleteMany({ matchId });
                        }
                        return this.success(res, { matchDelete, matchId }, 'markets deactivated');
                    }
                    return this.fail(res, 'market not deactivated');
                }
                else if (market && market.matchId) {
                    yield Match_1.Match.updateMany({ matchId: market.matchId }, { $set: { active: false, inPlay: false } });
                    yield Fancy_1.Fancy.updateMany({ matchId: market.matchId }, { $set: { active: false } });
                    yield BetLock_1.BetLock.deleteMany({ matchId: market.matchId });
                    return this.success(res, { matchDelete, matchId: market.matchId }, 'markets deactivated');
                }
                else {
                    return this.fail(res, 'market is required');
                }
            }
            catch (e) {
                return this.fail(res, e.stack);
            }
        });
        this.activateMarkets = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { marketIds } = req.body;
                if (marketIds) {
                    const marketId = Array.isArray(marketIds) ? marketIds : [marketIds];
                    yield Market_1.Market.updateMany({ marketId: { $in: marketId } }, { isActive: true });
                    return this.success(res, {}, 'markets activated');
                }
                else {
                    return this.fail(res, 'MarketIds is required');
                }
            }
            catch (e) {
                return this.fail(res, e);
            }
        });
        this.deactivateFancy = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { fancies } = req.body;
                if (fancies) {
                    Object.keys(fancies).map((matchId) => __awaiter(this, void 0, void 0, function* () {
                        yield Fancy_1.Fancy.updateMany({ matchId, marketId: { $in: fancies[matchId] } }, { active: false });
                    }));
                }
                return this.success(res, {}, 'fancy deactivated');
            }
            catch (e) {
                return this.fail(res, e);
            }
        });
        this.getSeriesWithMarketNew = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { EventTypeID } = req.query;
                if (!EventTypeID)
                    return this.fail(res, 'EventTypeID is required field');
                const responseData = yield api_1.sportsApi.get(`/get-series-redis/${EventTypeID}`);
                const alreadyAdded = yield Match_1.Match.find({ active: true }, { matchId: 1 });
                const matchIds = alreadyAdded.map((match) => match.matchId);
                return this.success(res, { data: (_a = responseData === null || responseData === void 0 ? void 0 : responseData.data) === null || _a === void 0 ? void 0 : _a.data, matchAdded: matchIds }, '');
            }
            catch (e) {
                return this.fail(res, e);
            }
        });
        this.getSeriesWithMarket = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { EventTypeID } = req.query;
                if (!EventTypeID)
                    return this.fail(res, 'EventTypeID is required field');
                const alreadyAdded = yield Match_1.Match.find({ active: true }, { matchId: 1 });
                const matchIds = alreadyAdded.map((match) => match.matchId);
                const response = yield api_1.sportsApi
                    .get(`/get-series-redis/${EventTypeID}`)
                    .then((series) => __awaiter(this, void 0, void 0, function* () {
                    const getMatches = series.data.data.map((s) => __awaiter(this, void 0, void 0, function* () {
                        return s.match.map((fm) => {
                            var _a;
                            fm.series = s.competition;
                            fm.matchId = fm.event.id;
                            fm.matchDateTime = fm.event.openDate;
                            fm.name = fm.event.name;
                            fm.seriesId = (_a = s.competition) === null || _a === void 0 ? void 0 : _a.id;
                            fm.sportId = EventTypeID;
                            fm.active = matchIds.indexOf(parseInt(fm.event.id)) > -1 ? true : false;
                            return fm;
                        });
                    }));
                    return Promise.all([...getMatches]);
                }))
                    .then((m) => {
                    return m
                        .filter((element) => {
                        return !Array.isArray(element) || element.length !== 0;
                    })
                        .flat();
                })
                    .catch((e) => console.log('error', e));
                return this.success(res, response, '');
            }
            catch (e) {
                return this.fail(res, e);
            }
        });
        // getSeriesWithMarket = async (req: Request, res: Response): Promise<any> => {
        //   try {
        //     const { EventTypeID } = req.query
        //     if (!EventTypeID) return this.fail(res, 'EventTypeID is required field')
        //     const alreadyAdded = await Match.find({ active: true }, { matchId: 1 })
        //     console.log(alreadyAdded, "Hello  World")
        //     const matchIds = alreadyAdded.map((match: any) => match.matchId)
        //     // const response = await sportsApi
        //     //   .get(`/get-series-redis/${EventTypeID}`)
        //     // const response  = await axios.get(`http://69.62.123.205:7000/api/v/events?id=${EventTypeID}`)
        //     // .then(async (series: any) => {
        //     //   console.log(series,"series from api")
        //     //   const getMatches = series?.data?.competition?.map(async (s: any) => {
        //     //     // return s.match.map((fm: any) => {
        //     //     //   fm.series = s.competition
        //     //     //   fm.matchId = fm.event.id
        //     //     //   fm.matchDateTime = fm.event.openDate
        //     //     //   fm.name = fm.event.name
        //     //     //   fm.seriesId = s.competition?.id
        //     //     //   fm.sportId = EventTypeID
        //     //     //   fm.active = matchIds.indexOf(parseInt(fm.event.id)) > -1 ? true : false
        //     //     //   return fm
        //     //     // })
        //     //     const xyz =   s?.markets?.map(async (t:any)=>{
        //     //       event:{
        //     //         "id":t.gmid,
        //     //         "name":t.ename,
        //     //         "timezone":"GMT",
        //     //         "openDate":t.stime,
        //     //       },
        //     //      series:{
        //     //       "id":t.cid.toString(),
        //     //       "name":t.cname,
        //     //      },
        //     //      "matchId":t.gmid,
        //     //      "matchDateTime":t.time,
        //     //      "name"t.ename,
        //     //      "seriesId":t.cid.toString(),
        //     //      "sportId":EventTypeID,
        //     //      "active ":matchIds.indexOf(parseInt(s.gmid)) > -1 ? true : false
        //     //       })
        //     //     // return{  event:{
        //     //     //     "id":s.gmid,
        //     //     //     "name":s.ename,
        //     //     //     "timezone":"GMT",
        //     //     //     "openDate":s.stime,
        //     //     //   },
        //     //     //  series:{
        //     //     //   "id":s.cid.toString(),
        //     //     //   "name":s.cname,
        //     //     //  },
        //     //     //  "matchId":s.gmid,
        //     //     //  "matchDateTime":s.time,
        //     //     //  "name":s.ename,
        //     //     //  "seriesId":s.cid.toString(),
        //     //     //  "sportId":EventTypeID,
        //     //     //  "active ":matchIds.indexOf(parseInt(s.gmid)) > -1 ? true : false
        //     //     // }
        //     // })
        //     //   return Promise.all([...getMatches])
        //     // })
        //     // .then((m) => {
        //     //   return m
        //     //     .filter((element: any) => {
        //     //       return !Array.isArray(element) || element.length !== 0
        //     //     })
        //     //     .flat()
        //     // })
        //     // .catch((e) => console.log('error', e))
        //     const response = await axios.get(`http://195.110.59.236:3000/allMatchUsingSports/${EventTypeID}`)
        //       .then(async (series: any) => {
        //         console.log(series, "series from api");
        //         const getMatches = series?.data?.data?.t1?.flatMap((s: any) => {
        //           return{
        //             event: {
        //               id: s.gmid,
        //               name: s.ename,
        //               timezone: "GMT",
        //               openDate: s.stime,
        //             },
        //             series: {
        //               id: s.cid.toString(),
        //               name: s.cname,
        //             },
        //             matchId: s.gmid,
        //             matchDateTime: s.stime,
        //             name: s.ename,
        //             seriesId: s.cid.toString(),
        //             sportId: EventTypeID,
        //             active: matchIds.includes(parseInt(s.gmid)),
        //           }
        //         }) || [];
        //         return Promise.all([...getMatches]);
        //       })
        //       .then((matches) => {
        //         return matches.filter(Boolean); // remove undefined/null if any
        //       })
        //       .catch((e) => {
        //         console.log('error', e);
        //         return [];
        //       });
        //     console.log(response, "response is here")
        //     return this.success(res, response, '')
        //   } catch (e: any) {
        //     return this.fail(res, e)
        //   }
        // }
        //  getSeriesWithMarket = async (req: Request, res: Response): Promise<any> => {
        //     try {
        //       const { EventTypeID } = req.query
        //       if (!EventTypeID) return this.fail(res, 'EventTypeID is required field')
        //       const alreadyAdded = await Match.find({ active: true }, { matchId: 1 })
        //       const matchIds = alreadyAdded.map((match: any) => match.matchId)
        //       const response = await sportsApi
        //         .get(`/get-series-redis/${EventTypeID}`)
        //         .then(async (series: any) => {
        //           console.log(series,"series is here hahhahahahahahaha")
        //           const getMatches = series.data.data.map(async (s: any) => {
        //             return s.match.map((fm: any) => {
        //               fm.series = s.competition
        //               fm.matchId = fm.event.id
        //               fm.matchDateTime = fm.event.openDate
        //               fm.name = fm.event.name
        //               fm.seriesId = s.competition?.id
        //               fm.sportId = EventTypeID
        //               fm.active = matchIds.indexOf(parseInt(fm.event.id)) > -1 ? true : false
        //               return fm
        //             })
        //           })
        //           return Promise.all([...getMatches])
        //         })
        //         .then((m) => {
        //           return m
        //             .filter((element: any) => {
        //               return !Array.isArray(element) || element.length !== 0
        //             })
        //             .flat()
        //         })
        //         .catch((e) => console.log('error', e))
        //       return this.success(res, response, '')
        //     } catch (e: any) {
        //       return this.fail(res, e)
        //     }
        //   }
        this.getSeriesWithMarketWithDate = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { EventTypeID } = req.query;
                if (!EventTypeID)
                    return this.fail(res, 'EventTypeID is required field');
                const response = yield api_1.sportsApi
                    .get(`/get-series?EventTypeID=${EventTypeID}`)
                    .then((series) => __awaiter(this, void 0, void 0, function* () {
                    const getMatches = series.data.sports.map((s) => __awaiter(this, void 0, void 0, function* () {
                        const matches = yield api_1.sportsApi
                            .get(`/get-matches?EventTypeID=${EventTypeID}&CompetitionID=${s.competition.id}`)
                            .then((m) => {
                            return m.data.sports.map((fm) => {
                                return fm;
                            });
                        });
                        s.matches = matches;
                        return s;
                    }));
                    return Promise.all(getMatches);
                }))
                    .then((m) => {
                    return m
                        .filter((element) => {
                        return !Array.isArray(element.matches) || element.matches.length !== 0;
                    })
                        .flat();
                });
                return this.success(res, response, '');
            }
            catch (e) {
                return this.fail(res, e);
            }
        });
        this.inplayMarket = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { marketIds } = req.body;
                if (marketIds) {
                    const matchIds = yield Market_1.Market.find({
                        marketId: { $in: marketIds },
                    })
                        .select({
                        matchId: 1,
                    })
                        .distinct('matchId');
                    yield Match_1.Match.updateMany({ matchId: { $in: matchIds } }, { inPlay: true });
                    return this.success(res, matchIds, 'inplay true');
                }
                return this.success(res, {}, 'fancy deactivated');
            }
            catch (e) {
                return this.fail(res, e);
            }
        });
        this.getMatchSuggestion = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
            }
            catch (e) {
                return this.fail(res, e);
            }
        });
        this.getSportList = this.getSportList.bind(this);
        this.saveSeries = this.saveSeries.bind(this);
        this.saveMatch = this.saveMatch.bind(this);
        this.getMatchList = this.getMatchList.bind(this);
        this.getMarketList = this.getMarketList.bind(this);
        this.getFancyList = this.getFancyList.bind(this);
        this.addFancyToDb = this.addFancyToDb.bind(this);
        this.saveMatchResyncCron = this.saveMatchResyncCron.bind(this);
    }
    getSportList(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // @ts-ignore
                const sports = yield Sport_1.Sport.find({});
                return this.success(res, sports);
            }
            catch (e) {
                return this.fail(res, e);
            }
        });
    }
    saveSeries(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { sportId, seriesId, seriesName, region, marketCount } = req.body;
                const series = {
                    sportId,
                    seriesId,
                    seriesName,
                    region,
                    marketCount,
                };
                const nesSeries = new Series_1.Series(series);
                yield nesSeries.save();
                return this.success(res, nesSeries);
            }
            catch (e) {
                return this.fail(res, e);
            }
        });
    }
    saveMatch(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const matches = req.body.data;
                const syncData = req.body.syncData;
                const matchArray = matches.map((match) => match.matchId);
                let matchData = [];
                if (matches && Object.keys(matches[0]).length === 1) {
                    matchData = yield Match_1.Match.find({ matchId: { $in: matchArray } })
                        .select({
                        matchId: 1,
                        sportId: 1,
                        seriesId: 1,
                        name: 1,
                        _id: 0,
                    })
                        .lean();
                }
                if (matchData.length <= 0)
                    matchData = matches;
                const matchDataRedis = matchData.map((match) => (Object.assign(Object.assign({}, match), { matchId: match.matchId.toString(), sportId: match.sportId.toString() })));
                // axios
                //   .post(`${process.env.OD_NODE_URL}save-match`, { matches: matchDataRedis })
                //   .catch((e: any) => {
                //     console.log(e.response)
                //   })
                axios_1.default
                    .post(`${process.env.SUPER_NODE_URL}api/save-match`, { matches: matchDataRedis })
                    .catch((e) => {
                    console.log(e.response);
                });
                yield matchData.map((match) => __awaiter(this, void 0, void 0, function* () {
                    yield this.marketesData(match, syncData);
                    const isFancy = yield this.fancyData(match);
                    const isBookMaker = yield this.bookmakermarketesData(match);
                    let isT10 = false;
                    let isT10Fancy = false;
                    if (match.name.includes('T10')) {
                        isT10 = yield this.t10MarketesData(match);
                        isT10Fancy = yield this.t10FancyData(match);
                    }
                    const sportSettings = yield SportSetting_1.SportSetting.findOne({ sportId: match.sportId })
                        .select({
                        inPlayMinLimit: 1,
                        inPlayMaxLimit: 1,
                        inPlayFancyMinLimit: 1,
                        inPlayFancyMaxLimit: 1,
                        offPlayMinLimit: 1,
                        offPlayMaxLimit: 1,
                        offPlayFancyMinLimit: 1,
                        offPlayFancyMaxLimit: 1,
                        inPlayBookMinLimit: 1,
                        inPlayBookMaxLimit: 1,
                        offPlayBookMinLimit: 1,
                        offPlayBookMaxLimit: 1,
                    })
                        .lean();
                    // @ts-ignore
                    if (sportSettings === null || sportSettings === void 0 ? void 0 : sportSettings._id)
                        sportSettings === null || sportSettings === void 0 ? true : delete sportSettings._id;
                    let saveMatchData = Object.assign(Object.assign({}, match), { isFancy: isT10Fancy || isFancy, isBookMaker, isT10: isT10 || isT10Fancy });
                    if (!syncData) {
                        saveMatchData = Object.assign(Object.assign({}, saveMatchData), sportSettings);
                    }
                    yield Match_1.Match.findOneAndUpdate({ matchId: match.matchId }, saveMatchData, {
                        new: true,
                        upsert: true,
                    });
                }));
                return this.success(res, {});
            }
            catch (e) {
                return this.fail(res, e);
            }
        });
    }
    saveMatchResyncCron(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const market = yield Market_1.Market.find({ isActive: true, sportId: 4, marketName: "Bookmaker" }).distinct("matchId");
                const matches = yield Match_1.Match.find({ active: true, sportId: 4, matchId: { $nin: market } }, {
                    matchId: 1,
                    sportId: 1,
                    seriesId: 1,
                    name: 1,
                    _id: 0,
                });
                const matchArray = matches.map((match) => match.matchId);
                let matchData = [];
                if (matches && Object.keys(matches[0]).length === 1) {
                    matchData = yield Match_1.Match.find({ matchId: { $in: matchArray } })
                        .select({
                        matchId: 1,
                        sportId: 1,
                        seriesId: 1,
                        name: 1,
                        _id: 0,
                    })
                        .lean();
                }
                if (matchData.length <= 0)
                    matchData = matches;
                const matchDataRedis = matchData.map((match) => (Object.assign(Object.assign({}, match), { matchId: match.matchId.toString(), sportId: match.sportId.toString() })));
                axios_1.default
                    .post(`${process.env.SUPER_NODE_URL}api/save-match`, { matches: matchDataRedis })
                    .catch((e) => {
                    console.log(e.response);
                });
                let syncData = true;
                yield matchData.map((match) => __awaiter(this, void 0, void 0, function* () {
                    yield this.marketesData(match, syncData);
                    const isFancy = yield this.fancyData(match);
                    // const isBookMaker = await this.bookmakermarketesData(match)
                    let isT10 = false;
                    let isT10Fancy = false;
                    if (match.name.includes('T10')) {
                        isT10 = yield this.t10MarketesData(match);
                        isT10Fancy = yield this.t10FancyData(match);
                    }
                    const sportSettings = yield SportSetting_1.SportSetting.findOne({ sportId: match.sportId })
                        .select({
                        inPlayMinLimit: 1,
                        inPlayMaxLimit: 1,
                        inPlayFancyMinLimit: 1,
                        inPlayFancyMaxLimit: 1,
                        offPlayMinLimit: 1,
                        offPlayMaxLimit: 1,
                        offPlayFancyMinLimit: 1,
                        offPlayFancyMaxLimit: 1,
                        inPlayBookMinLimit: 1,
                        inPlayBookMaxLimit: 1,
                        offPlayBookMinLimit: 1,
                        offPlayBookMaxLimit: 1,
                    })
                        .lean();
                    // @ts-ignore
                    if (sportSettings === null || sportSettings === void 0 ? void 0 : sportSettings._id)
                        sportSettings === null || sportSettings === void 0 ? true : delete sportSettings._id;
                    let saveMatchData = Object.assign(Object.assign({}, match), { isFancy: isT10Fancy || isFancy, 
                        // isBookMaker,
                        isT10: isT10 || isT10Fancy });
                    if (!syncData) {
                        saveMatchData = Object.assign(Object.assign({}, saveMatchData), sportSettings);
                    }
                    yield Match_1.Match.findOneAndUpdate({ matchId: match.matchId }, saveMatchData, {
                        new: true,
                        upsert: true,
                    });
                }));
                return this.success(res, {});
            }
            catch (e) {
                return this.fail(res, e);
            }
        });
    }
    marketesData(match, syncData) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const markets = yield sports_service_1.default.getMarkets(match);
            if (((_b = (_a = markets === null || markets === void 0 ? void 0 : markets.data) === null || _a === void 0 ? void 0 : _a.sports) === null || _b === void 0 ? void 0 : _b.length) > 0)
                yield markets.data.sports.map((market) => __awaiter(this, void 0, void 0, function* () {
                    if (market.marketId) {
                        const marketsData = {
                            seriesId: match.seriesId,
                            sportId: match.sportId,
                            matchId: match.matchId,
                            marketId: market.marketId,
                            marketName: market.marketName,
                            marketStartTime: market.marketStartTime,
                            runners: market.runners,
                            //isActive: true,
                            oddsType: Market_1.OddsType.B,
                        };
                        if (!syncData)
                            marketsData.isActive = true;
                        if (!syncData &&
                            market.marketName.toLowerCase().trim().replace(/\s+/g, '') === 'tiedmatch') {
                            marketsData.isActive = false;
                            console.log(market.marketName, 'market');
                        }
                        else {
                            console.log(market.marketName, 'marketnotmatch');
                        }
                        if (!syncData &&
                            market.marketName.toLowerCase().trim().replace(/\s+/g, '') === 'completedmatch') {
                            marketsData.isActive = false;
                        }
                        if (!syncData &&
                            market.marketName.toLowerCase().trim().replace(/\s+/g, '') === 'towinthetoss') {
                            marketsData.isActive = false;
                        }
                        if (!syncData &&
                            market.marketName.toLowerCase().trim().replace(/\s+/g, '') === 'matchoddsincludingtie') {
                            marketsData.isActive = false;
                        }
                        yield Market_1.Market.findOneAndUpdate({ marketId: market.marketId, matchId: match.matchId }, marketsData, {
                            new: true,
                            upsert: true,
                        });
                    }
                }));
        });
    }
    bookmakermarketesData(match) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const markets = yield sports_service_1.default.getBookmakerMarkets(match);
            console.log(markets, "markets data from backend ibn ths codew sw");
            if (((_b = (_a = markets === null || markets === void 0 ? void 0 : markets.data) === null || _a === void 0 ? void 0 : _a.sports) === null || _b === void 0 ? void 0 : _b.length) > 0) {
                let i = 0;
                yield markets.data.sports.map((market) => __awaiter(this, void 0, void 0, function* () {
                    let marketName = market.marketName;
                    if (market.marketName === 'Bookmaker') {
                        i++;
                        marketName = i > 1 ? `${market.marketName}${i}` : market.marketName;
                    }
                    const marketsData = {
                        seriesId: match.seriesId,
                        sportId: match.sportId,
                        matchId: match.matchId,
                        marketId: market.marketId,
                        marketName: marketName,
                        marketStartTime: market.marketStartTime,
                        runners: market.runners.sort((a, b) => a.sortPriority - b.sortPriority),
                        isActive: true,
                        oddsType: Market_1.OddsType.BM,
                    };
                    yield Market_1.Market.findOneAndUpdate({ marketId: market.marketId, matchId: match.matchId }, marketsData, {
                        new: true,
                        upsert: true,
                    });
                }));
                return markets.data.sports.length > 0;
            }
            return false;
        });
    }
    t10MarketesData(match) {
        return __awaiter(this, void 0, void 0, function* () {
            const markets = yield sports_service_1.default.getT10Markets(match.matchId);
            if (markets.data.sports) {
                yield markets.data.sports.map((market) => __awaiter(this, void 0, void 0, function* () {
                    const marketsData = {
                        seriesId: match.seriesId,
                        sportId: match.sportId,
                        matchId: match.matchId,
                        marketId: market.marketId,
                        marketName: market.marketName.trim(),
                        marketStartTime: match.matchDateTime,
                        runners: market.runners.sort((a, b) => a.sortPriority - b.sortPriority),
                        isActive: true,
                        oddsType: Market_1.OddsType.T10,
                    };
                    yield Market_1.Market.findOneAndUpdate({ marketId: market.marketId, matchId: match.matchId }, marketsData, {
                        new: true,
                        upsert: true,
                    });
                }));
                return markets.data.sports.length > 0;
            }
            return false;
        });
    }
    fancyData(match) {
        return __awaiter(this, void 0, void 0, function* () {
            const fancy = yield sports_service_1.default.getSession(match.matchId, match.sportId);
            if (fancy.data.sports) {
                yield fancy.data.sports.map((market) => __awaiter(this, void 0, void 0, function* () {
                    let type = '';
                    if (market.RunnerName.includes(' ball run ')) {
                        type = 'ballRun';
                    }
                    if (/^Only/.test(market.RunnerName) ||
                        market.RunnerName.includes(' ball No ') ||
                        market.RunnerName.includes(' over run ')) {
                        type = 'overBallNo';
                    }
                    const fancyData = {
                        sportId: match.sportId,
                        matchId: match.matchId,
                        marketId: market.SelectionId,
                        fancyName: market.RunnerName,
                        gtype: market.gtype,
                        sr_no: market.sr_no ? market.sr_no : market.srno ? parseInt(market.srno) : 1,
                        ballByBall: type,
                    };
                    yield Fancy_1.Fancy.findOneAndUpdate({
                        // sportId: match.sportId,
                        matchId: match.matchId,
                        marketId: market.SelectionId,
                    }, Object.assign(Object.assign({}, fancyData), { active: true }), {
                        new: true,
                        upsert: true,
                    });
                }));
                return fancy.data.sports.length > 0;
            }
            return false;
        });
    }
    t10FancyData(match) {
        return __awaiter(this, void 0, void 0, function* () {
            const fancy = yield sports_service_1.default.getSessionT10(match.matchId);
            if (fancy.data.sports) {
                yield fancy.data.sports.map((market) => __awaiter(this, void 0, void 0, function* () {
                    let type = '';
                    if (market.RunnerName.includes(' ball run ')) {
                        type = 'ballRun';
                    }
                    if (/^Only/.test(market.RunnerName) ||
                        market.RunnerName.includes(' ball No ') ||
                        market.RunnerName.includes(' over run ')) {
                        type = 'overBallNo';
                    }
                    const fancyData = {
                        sportId: match.sportId,
                        matchId: match.matchId,
                        marketId: market.SelectionId,
                        fancyName: market.RunnerName,
                        gtype: 'session',
                        sr_no: market.sr_no ? market.sr_no : market.srno ? parseInt(market.srno) : 1,
                        ballByBall: type,
                    };
                    yield Fancy_1.Fancy.findOneAndUpdate({
                        // sportId: match.sportId,
                        matchId: match.matchId,
                        marketId: market.SelectionId,
                    }, Object.assign(Object.assign({}, fancyData), { active: true }), {
                        new: true,
                        upsert: true,
                    });
                }));
                return fancy.data.sports.length > 0;
            }
            return false;
        });
    }
    // Get Match List
    getMatchList(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { sportId, status, limit } = req.query;
                let matchQuery = { $match: { active: true } };
                console.log(matchQuery, "match Query");
                if (sportId && sportId !== 'all' && status !== 'in-play') {
                    matchQuery = { $match: { sportId: parseInt(sportId), active: true } };
                }
                if (sportId && status === 'all' && status !== 'in-play') {
                    matchQuery = { $match: { sportId: parseInt(sportId), active: true } };
                }
                else if (sportId && status === 'in-play') {
                    matchQuery = {
                        $match: { sportId: parseInt(sportId), matchDateTime: { $lte: new Date() }, active: true },
                    };
                }
                let query = [
                    matchQuery,
                    {
                        $lookup: {
                            from: 'markets',
                            localField: 'matchId',
                            foreignField: 'matchId',
                            pipeline: [{ $match: { marketName: { $in: ['Match Odds', 'Winner'] } } }],
                            as: 'markets',
                        },
                    },
                    { $sort: { matchDateTime: 1 } },
                ];
                if (limit) {
                    query.push({ $limit: parseInt(limit) });
                }
                const match = yield Match_1.Match.aggregate(query);
                // console.log(match,"match from this database site")
                return this.success(res, match);
            }
            catch (e) {
                return this.fail(res, e);
            }
        });
    }
    // Get Market List
    getMarketList(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { matchId } = req.query;
                const user = req.user;
                // @ts-ignore
                const stake = yield UserBetStake_1.UserBetStake.findOne({ userId: user._id }).cache(0, 'user-stack-' + (user === null || user === void 0 ? void 0 : user._id));
                // const marketMatchOddsFirst = await Market.findOne({
                //   matchId,
                //   marketName: { $eq: 'Match Odds' },
                //   isActive: true,
                //   $or: [{ isDelete: null }, { isDelete: false }],
                // })
                // // @ts-ignore
                // //.cache(0, 'Markets-Match-Odds-' + matchId)
                // const market = await Market.find({
                //   matchId,
                //   marketName: { $ne: 'Match Odds' },
                //   isActive: true,
                //   $or: [{ isDelete: null }, { isDelete: false }],
                // })
                // @ts-ignore
                //.cache(0, 'Markets-ne-Match-Odds-' + matchId)
                const markets = yield Market_1.Market.aggregate([
                    {
                        $match: {
                            matchId: +matchId,
                            isActive: true,
                            $or: [{ isDelete: null }, { isDelete: false }],
                        },
                    },
                    {
                        $addFields: {
                            sortKey: {
                                $switch: {
                                    branches: [
                                        {
                                            case: {
                                                $regexMatch: {
                                                    input: '$marketName',
                                                    regex: new RegExp('^Match Odds'),
                                                },
                                            },
                                            then: 0,
                                        },
                                        {
                                            case: {
                                                $regexMatch: {
                                                    input: '$marketName',
                                                    regex: new RegExp('^Bookmaker'),
                                                },
                                            },
                                            then: 1,
                                        },
                                        {
                                            case: {
                                                $regexMatch: {
                                                    input: '$marketName',
                                                    regex: new RegExp('^Tied Match'),
                                                },
                                            },
                                            then: 2,
                                        },
                                    ],
                                    default: 3,
                                },
                            },
                        },
                    },
                    {
                        $sort: {
                            sortKey: 1,
                        },
                    },
                ]);
                return this.success(res, {
                    markets,
                    stake,
                });
            }
            catch (e) {
                return this.fail(res, e);
            }
        });
    }
    // Get Fancy List
    getFancyList(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { matchId, gtype } = req.query;
                const strings = ['wkt', 'Wkts', 'Fours', 'Sixes'];
                const filters = {
                    $nor: strings.map((string) => ({ fancyName: { $regex: string } })),
                    gtype,
                };
                let filter = { gtype };
                if (gtype == 'session') {
                    filter = filters;
                }
                else if (gtype == 'fancy1') {
                    filter = { gtype };
                }
                else if (gtype === 'wkt') {
                    filter = {
                        $or: [{ fancyName: { $regex: gtype } }, { fancyName: { $regex: strings[1] } }],
                        gtype: { $ne: 'fancy1' },
                    };
                }
                else if (!(gtype === null || gtype === void 0 ? void 0 : gtype.includes(strings))) {
                    filter = { fancyName: { $regex: gtype }, gtype: { $ne: 'fancy1' } };
                }
                const fancy = yield Fancy_1.Fancy.find({
                    matchId,
                    active: true,
                    // ...filter,
                })
                    .sort({ sr_no: 1, marketId: 1 });
                // const  fancy = await Fancy.find()
                // console.log(fancy,"hello worldz")
                return this.success(res, fancy);
            }
            catch (e) {
                return this.fail(res, e);
            }
        });
    }
    // async addFancyToDb(req: Request, res: Response): Promise<Response> {
    //   try {
    //     console.log(req.params)
    //     const id = req.params.id
    //     // const { fancy } = req.body
    //     const fancyDataOne:any =  await axios.get(`http://185.211.4.99:3000/allMatchData/4/${id}`)
    //     const fancy:any = fancyDataOne.data.data;
    //     console.log(fancy,"fancys");
    //     fancy.map(Promise.all()=>{
    //     let type = ''
    //     if (fancy.RunnerName.includes(' ball run ')) {
    //       type = 'ballRun'
    //     }
    //     if (
    //       /^Only/.test(fancy.RunnerName) ||
    //       fancy.RunnerName.includes(' ball No ') ||
    //       fancy.RunnerName.includes(' over run ')
    //     ) {
    //       type = 'overBallNo'
    //     }
    //     const fancyData: IFancy = {
    //       sportId: 4,
    //       matchId: fancy.matchId,
    //       marketId: fancy.SelectionId,
    //       active: true,
    //       fancyName: fancy.RunnerName,
    //       gtype: fancy.gtype ? fancy.gtype : 'session',
    //       sr_no: fancy.sr_no,
    //       ballByBall: type,
    //     }
    //     const fancyNew = await Fancy.findOneAndUpdate(
    //       { marketId: fancy.SelectionId, matchId: fancy.matchId },
    //       fancyData,
    //       {
    //         new: true,
    //         upsert: true,
    //       },
    //     )
    //   })
    //     return this.success(res, fancyNew, 'fancy added')
    //   } catch (e: any) {
    //     return this.fail(res, e)
    //   }
    // }
    // async addFancyToDb(req: Request, res: Response): Promise<Response> {
    //   try {
    //     console.log(req.params)
    //     const id = req.params.id
    //     // const { fancy } = req.body
    //     const fancyDataOne: any = await axios.get(`http://185.211.4.99:3000/allMatchData/4/${id}`)
    //     const fancy: any = fancyDataOne.data.data;
    //     console.log(fancy, "fancys");
    //     // Wrap the map logic inside Promise.all to handle async operations correctly
    //     const updatePromises = fancy.map(async (item: any) => {
    //       item.map(async(p:any)=>{
    //         let type = ''
    //       if (item.section.nat.includes(' ball run ')) {
    //         type = 'ballRun'
    //       }
    //       if (
    //         /^Only/.test(item.section.nat) ||
    //         item.section.nat.includes(' ball No ') ||
    //         item.section.nat.includes(' over run ')
    //       ) {
    //         type = 'overBallNo'
    //       }
    //       const fancyData: IFancy = {
    //         sportId: 4,
    //         matchId: item.gmid,
    //         marketId: item.mid,
    //         active: true,
    //         fancyName: item.section.nat,
    //         gtype: item.gtype ? item.gtype : 'session',
    //         sr_no: item.sno,
    //         // ballByBall: type,
    //       }
    //       // Ensure that the update or insert happens and store the result
    //       return await Fancy.findOneAndUpdate(
    //         { marketId: item.SelectionId, matchId: item.matchId },
    //         fancyData,
    //         {
    //           new: true,
    //           upsert: true,
    //         },
    //       )
    //     })
    //       })
    //     // Wait for all promises to resolve
    //     const fancyNew = await Promise.all(updatePromises);
    //     // Since we have multiple updated objects, decide what to return (e.g., last one or all)
    //     return this.success(res, fancyNew, 'Fancy added');
    //   } catch (e: any) {
    //     return this.fail(res, e);
    //   }
    // }
    // async addFancyToDb(req: Request, res: Response): Promise<Response> {
    //   try {
    //     console.log(req.params);
    //     const id = req.params.id;
    //     const fancyDataOne: any = await axios.get(`http://185.211.4.99:3000/allMatchData/4/${id}`);
    //     const fancy: any = fancyDataOne.data.data;
    //     // sconsole.log(fancy, "fancy");
    //     // Wrap the map logic inside Promise.all to handle async operations correctly
    //     const updatePromises = fancy.map(async (item: any) => {
    //       // Assuming each item can have multiple sections
    //       const innerPromises = item.section.map(async (p: any) => {
    //         let type = '';
    //         if (p.nat.includes(' ball run ')) {
    //           type = 'ballRun';
    //         }
    //         if (
    //           /^Only/.test(p.nat) ||
    //           p.nat.includes(' ball No ') ||
    //           p.nat.includes(' over run ')
    //         ) {
    //           type = 'overBallNo';
    //         }
    //         console.log(p,"p  is here hello world for this side ")
    //         const fancyData: IFancy = {
    //           sportId: 4,
    //           matchId: item.gmid,
    //           marketId: p?.sid?.toString(),
    //           active: true,
    //           fancyName: p.nat,
    //           gtype: item.gtype ? item.gtype : 'session',
    //           sr_no: item.sno,
    //           ballByBall: type, 
    //         };
    //         console.log(fancyData,"fancyData hello this is  fancy Data")
    //         // Ensure that the update or insert happens and store the result
    //         return await Fancy.findOneAndUpdate(
    //           { marketId: item.mid, matchId: item.gmid },  // Fixed the query to match the correct field
    //           fancyData,
    //           {
    //             new: true,
    //             upsert: true,
    //           },
    //         );
    //       });
    //       // Wait for all inner promises to resolve for each item
    //       return await Promise.all(innerPromises);
    //     });
    //     // Wait for all outer promises to resolve
    //     const fancyNew = await Promise.all(updatePromises);
    //     // Since we have multiple updated objects, decide what to return (e.g., last one or all)
    //     return this.success(res, fancyNew, 'Fancy added');
    //   } catch (e: any) {
    //     return this.fail(res, e);
    //   }
    // }
    addFancyToDb(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { fancy } = req.body;
                let type = '';
                if (fancy.RunnerName.includes(' ball run ')) {
                    type = 'ballRun';
                }
                if (/^Only/.test(fancy.RunnerName) ||
                    fancy.RunnerName.includes(' ball No ') ||
                    fancy.RunnerName.includes(' over run ')) {
                    type = 'overBallNo';
                }
                const fancyData = {
                    sportId: 4,
                    matchId: fancy.matchId,
                    marketId: fancy.SelectionId,
                    active: true,
                    fancyName: fancy.RunnerName,
                    gtype: fancy.gtype ? fancy.gtype : 'session',
                    sr_no: fancy.sr_no,
                    ballByBall: type,
                };
                const fancyNew = yield Fancy_1.Fancy.findOneAndUpdate({ marketId: fancy.SelectionId, matchId: fancy.matchId }, fancyData, {
                    new: true,
                    upsert: true,
                });
                return this.success(res, fancyNew, 'fancy added');
            }
            catch (e) {
                return this.fail(res, e);
            }
        });
    }
}
exports.default = SportsController;
//# sourceMappingURL=SportsController.js.map