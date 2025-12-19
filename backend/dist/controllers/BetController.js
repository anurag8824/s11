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
exports.BetController = void 0;
const Balance_1 = require("../models/Balance");
const Bet_1 = require("../models/Bet");
const Match_1 = require("../models/Match");
const User_1 = require("../models/User");
const ApiController_1 = require("./ApiController");
const Market_1 = require("../models/Market");
const api_1 = require("../util/api");
const mongoose_1 = require("mongoose");
const Role_1 = require("../models/Role");
const user_socket_1 = __importDefault(require("../sockets/user-socket"));
const CasinoMatches_1 = require("../models/CasinoMatches");
const BetLock_1 = require("../models/BetLock");
const axios_1 = __importDefault(require("axios"));
const ObjectId = mongoose_1.Types.ObjectId;
const default_settings = { minBet: 100, maxBet: 100, delay: 0 };
const defaultRatio = {
    ownRatio: 100,
    allRatio: [
        {
            parent: ObjectId('63382d9bfbb3a573110c1ba5'),
            ratio: 100,
        },
    ],
};
class BetController extends ApiController_1.ApiController {
    constructor() {
        super(...arguments);
        this.checkMarketOddsConditions = ({ market_id, market_name, selectionId, isBack, odds, selectionName, }) => __awaiter(this, void 0, void 0, function* () {
            let current_odds = yield this.getcurrentodds(market_id, market_name);
            if (!current_odds ||
                (current_odds && !current_odds.sports) ||
                (current_odds && current_odds.sports && !current_odds.sports[0])) {
                return 'Bet is not acceptable.';
            }
            else {
                let currentsports = current_odds.sports[0];
                let current_runners = currentsports.runners;
                let filter_runners = current_runners.filter((Item) => Item.selectionId == selectionId);
                if (filter_runners && filter_runners[0]) {
                    let market_status = filter_runners[0].status;
                    if (market_status == 'ACTIVE' || market_status == 'OPEN') {
                        let oddsdata = isBack
                            ? filter_runners[0].ex.availableToBack
                            : filter_runners[0].ex.availableToLay;
                        if (oddsdata.length > 0) {
                            let max = 0;
                            oddsdata.map((Itemn) => (max = Itemn.price > max ? Itemn.price : max));
                            if (odds > max) {
                                return odds + ' is not valid.';
                            }
                        }
                    }
                    else if (market_status == 'SUSPENDED') {
                        market_status = 'Is Suspended';
                        return selectionName + ' market ' + market_status;
                    }
                    else if (market_status == 'CLOSED') {
                        market_status = 'Is Closed';
                        return selectionName + ' market ' + market_status;
                    }
                }
                else {
                    return 'Market Suspended';
                }
            }
        });
        //  fancybetListSelection = async (
        //     req: Request,
        //     res: Response
        //   ): Promise<Response> => {
        //     try {
        //       const bets = await Bet.aggregate([
        //         {
        //           $match: {
        //             bet_on: BetOn.FANCY,
        //             status: "pending"
        //           }
        //         },
        //         {
        //           $group: {
        //             _id: "$selectionName", // group unique by selectionName
        //             matchId: { $first: "$matchId" },
        //             selectionId: { $first: "$selectionId" },
        //             customId: { $first: "$id" }      // agar tere doc me id naam ka field hai
        //           }
        //         },
        //         {
        //           $project: {
        //             _id: 0,
        //             selectionName: "$_id",
        //             matchId: 1,
        //             selectionId: 1,
        //             originalId: 1,
        //             customId: 1
        //           }
        //         }
        //       ]);
        //       const Data = await axios.get('https://api.bxpro99.xyz/api/get-business-fancy-list')
        //       const betData = Data.data.list
        //       return this.success(res, { list: bets });
        //     } catch (e: any) {
        //       console.log(e,"FGHJKL")
        //       return this.fail(res, e);
        //     }
        //   };
        this.fancybetListSelection = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const bets = yield Bet_1.Bet.aggregate([
                    {
                        $match: {
                            bet_on: Bet_1.BetOn.FANCY,
                            status: "pending"
                        }
                    },
                    {
                        $group: {
                            _id: "$selectionName",
                            matchId: { $first: "$matchId" },
                            selectionId: { $first: "$selectionId" },
                            customId: { $first: "$id" }
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                            selectionName: "$_id",
                            matchId: 1,
                            selectionId: 1,
                            customId: 1
                        }
                    }
                ]);
                const rdata = yield axios_1.default.get('https://api.bxpro99.xyz/api/get-business-fancy-list');
                const betData = rdata.data.data.list || [];
                console.log(betData, "FGHJKL");
                // --- Merge bets + betData without duplicates (based on selectionName)
                const mergedMap = new Map();
                // Add bets first
                for (const b of bets) {
                    mergedMap.set(b.selectionName, b);
                }
                // Add betData (only if selectionName not already in map)
                for (const d of betData) {
                    if (!mergedMap.has(d.selectionName)) {
                        mergedMap.set(d.selectionName, d);
                    }
                }
                // Convert Map values to array
                const mergedList = Array.from(mergedMap.values());
                return this.success(res, { list: mergedList });
            }
            catch (e) {
                console.log(e, "FGHJKL");
                return this.fail(res, e);
            }
        });
        this.checkFancyOddsConditions = ({ match_id, selectionId, isBack, odds, selectionName, }) => __awaiter(this, void 0, void 0, function* () {
            let current_odds = yield this.getcurrentfancyodds(match_id, selectionId);
            if (!current_odds ||
                (current_odds && !current_odds.sports) ||
                (current_odds && current_odds.sports && !current_odds.sports[0])) {
                return 'Bet is not acceptable.';
            }
            else {
                let currentsports = current_odds.sports[0];
                let market_status = currentsports.GameStatus;
                if (market_status == '') {
                    let oddsdata = isBack ? currentsports.BackPrice1 : currentsports.LayPrice1;
                    if (isBack && odds > oddsdata) {
                        return odds + ' is not valid.';
                    }
                    if (!isBack && odds < oddsdata) {
                        return odds + ' is not valid.';
                    }
                }
                else if (market_status == 'SUSPENDED') {
                    market_status = 'Is Suspended';
                }
                else if (market_status == 'Ball Running') {
                    market_status = 'Is Ball Running';
                }
                if (market_status != '') {
                    return selectionName + ' market ' + market_status;
                }
            }
        });
        this.placebet = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const betData = req.body;
                if (betData.stack != undefined) {
                    const user = req.user;
                    const userId = user._id;
                    betData['user_id'] = userId;
                    const start = performance.now();
                    const response = yield axios_1.default.post('http://127.0.0.1:5000/api/placebet', betData);
                    const end = performance.now();
                    console.log(response);
                    return this.success(res, Object.assign({ bet: betData, time: end - start }, response.data), 'PLace Bet Successfully');
                }
                else {
                    return this.fail(res, '');
                }
            }
            catch (e) {
                return this.fail(res, e.stack);
            }
        });
        this.placebetold = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const betData = req.body;
                if (betData.stack != undefined) {
                    const user = req.user;
                    const userId = user._id;
                    const userInfo = yield User_1.User.findOne({
                        _id: ObjectId(user._id),
                    });
                    const parentinfo = yield User_1.User.findOne({
                        _id: ObjectId(userInfo.parentId),
                    });
                    let event_id = betData.eventId;
                    let bet_On = betData.betOn;
                    const settings = userInfo != null && userInfo.userSetting != undefined && bet_On !== Bet_1.BetOn.CASINO
                        ? userInfo.userSetting[event_id]
                        : parentinfo != null && parentinfo.userSetting != undefined && bet_On == Bet_1.BetOn.CASINO
                            ? parentinfo.userSetting[event_id]
                            : default_settings;
                    const partnership = parentinfo != null && parentinfo.partnership != undefined && bet_On !== Bet_1.BetOn.CASINO
                        ? parentinfo.partnership[event_id]
                        : parentinfo != null && parentinfo.partnership != undefined && bet_On == Bet_1.BetOn.CASINO
                            ? parentinfo.partnership[4]
                            : defaultRatio;
                    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
                    const betClickTime = new Date();
                    const userBlance = yield Balance_1.Balance.findOne({
                        userId: ObjectId(user._id),
                    });
                    let stake = betData.stack;
                    let profit = parseFloat(betData.pnl);
                    let odds = parseFloat(betData.odds);
                    let match_id = betData.matchId;
                    let market_id = betData.marketId;
                    let market_name = betData.marketName;
                    let loss = parseFloat(betData.exposure);
                    let selectionName = betData.selectionName;
                    let selectionId = betData.selectionId;
                    let isBack = betData.isBack;
                    let ipAddress = betData.ipAddress;
                    const betLock = yield BetLock_1.BetLock.findOne({
                        matchId: parseInt(match_id),
                        userId: { $eq: undefined },
                    });
                    const betLockUser = yield BetLock_1.BetLock.findOne({
                        matchId: parseInt(match_id),
                        userId: ObjectId(user._id),
                    });
                    /// console.log(betLock)
                    if (parseInt(stake) >= 99999999) {
                        return this.fail(res, stake + ' is not valid.');
                    }
                    if (userBlance && userBlance.balance <= parseInt(stake)) {
                        return this.fail(res, ' Low Balance.');
                    }
                    if (!stake || !profit || !Math.abs(loss) || !odds) {
                        ///return this.fail(res, 'Bet is not acceptable.')
                    }
                    if (!userInfo || (userInfo && !userInfo.betLock)) {
                        return this.fail(res, 'Bet is not acceptable.Please contact upline');
                    }
                    if ((betLock && betLock.betFair && market_name == 'Match Odds') ||
                        (betLockUser && betLockUser.betFair && market_name == 'Match Odds')) {
                        return this.fail(res, 'Bet is not acceptable.Please contact upline');
                    }
                    if ((betLock && betLock.book && market_name == 'Bookmaker') ||
                        (betLockUser && betLockUser.book && market_name == 'Bookmaker')) {
                        return this.fail(res, 'Bet is not acceptable.Please contact upline');
                    }
                    if ((betLock && betLock.fancy && market_name == 'Fancy') ||
                        (betLockUser && betLockUser.fancy && market_name == 'Fancy')) {
                        return this.fail(res, 'Bet is not acceptable.Please contact upline');
                    }
                    if ((settings && settings.minBet > stake) || (settings && settings.maxBet < stake)) {
                        return this.fail(res, 'Check Maximum or Minimum Bet Limit');
                    }
                    if (market_name == 'Match Odds') {
                        yield delay((parseInt(settings.delay) - 5) * 1000);
                    }
                    if (market_name != 'Fancy' && bet_On != Bet_1.BetOn.CASINO) {
                        const errors = yield this.checkMarketOddsConditions({
                            market_id,
                            market_name,
                            selectionId,
                            isBack,
                            odds,
                            selectionName,
                        });
                        if (errors)
                            return this.fail(res, errors);
                    }
                    else if (bet_On == Bet_1.BetOn.CASINO) {
                        /// perform casino validation
                        // const errors = await this.checkFancyOddsConditions({
                        //   match_id,
                        //   selectionId,
                        //   isBack,
                        //   odds,
                        //   selectionName,
                        // })
                        // if (errors) return this.fail(res, errors)
                    }
                    else {
                        const errors = yield this.checkFancyOddsConditions({
                            match_id,
                            selectionId,
                            isBack,
                            odds,
                            selectionName,
                        });
                        if (errors)
                            return this.fail(res, errors);
                    }
                    let matchName = '';
                    let runners = [];
                    if (bet_On == Bet_1.BetOn.CASINO) {
                        const matchdata = yield CasinoMatches_1.Casino.findOne({ match_id: match_id });
                        matchName = matchdata != null ? matchdata.title : '';
                        if (matchdata.status == 0) {
                            return this.fail(res, 'Match Is Not In Play');
                        }
                        const marketRunnerFinder = matchdata.event_data.market.filter((ItemMarket) => ItemMarket.MarketName == market_name)[0];
                        runners = (marketRunnerFinder === null || marketRunnerFinder === void 0 ? void 0 : marketRunnerFinder.Runners) || [];
                    }
                    else {
                        const matchdata = yield Match_1.Match.findOne({ matchId: match_id });
                        matchName = matchdata != null ? matchdata.name : '';
                        if (!matchdata.active) {
                            return this.fail(res, 'Match Is Not In Play');
                        }
                        const market_current_bet = yield Market_1.Market.findOne({ marketId: market_id, matchId: match_id }, { _id: 1, runners: 1 });
                        runners = market_current_bet != null ? market_current_bet.runners : [];
                    }
                    let json = {
                        sportId: event_id,
                        userId: ObjectId(user._id),
                        userName: userInfo.username,
                        betClickTime,
                        matchId: match_id,
                        marketId: market_id,
                        selectionId: selectionId,
                        selectionName: selectionName,
                        matchName: matchName,
                        odds: odds,
                        volume: betData.volume,
                        stack: stake,
                        pnl: profit,
                        marketName: market_name,
                        isBack: isBack,
                        matchedDate: new Date(),
                        matchedOdds: odds,
                        matchedInfo: '',
                        userIp: ipAddress,
                        loss: loss,
                        parentStr: userInfo.parentStr,
                        ratioStr: partnership,
                        bet_on: market_name == 'Fancy'
                            ? Bet_1.BetOn.FANCY
                            : bet_On == Bet_1.BetOn.CASINO
                                ? bet_On
                                : Bet_1.BetOn.MATCH_ODDS,
                        runners: runners,
                        //Todo: This is for fancy1 if fancy1 volume is grater then 100000
                        gtype: (betData.gtype && betData.volume >= 100000) || Bet_1.BetOn.CASINO ? betData.gtype : '',
                        C1: betData === null || betData === void 0 ? void 0 : betData.C1,
                        C2: betData === null || betData === void 0 ? void 0 : betData.C2,
                        C3: betData === null || betData === void 0 ? void 0 : betData.C3,
                        fancystatus: betData === null || betData === void 0 ? void 0 : betData.fancystatus,
                    };
                    const bet = new Bet_1.Bet(json);
                    if (bet_On != Bet_1.BetOn.CASINO) {
                        let exposer = yield this.getexposerfunction(user, false, json);
                        if (exposer != 'failed') {
                            let available_balance = userBlance && userBlance.balance ? userBlance.balance : -exposer;
                            if (available_balance && available_balance < parseInt(exposer)) {
                                return this.fail(res, ' Max limit Exceed.');
                            }
                            yield bet.save(function (err) {
                                if (err)
                                    throw err;
                            });
                            const expoMain = yield Balance_1.Balance.findOneAndUpdate({ userId: user._id }, { $set: { exposer } });
                            // balance event here
                            const bets = yield Bet_1.Bet.find({
                                userId: userId,
                                matchId: match_id,
                                status: 'pending',
                            }).sort({
                                createdAt: -1,
                            });
                            const markets = yield Market_1.Market.find({
                                matchId: match_id,
                            });
                            const profitlist = this.getoddsprofit(bets, markets);
                            const ex = exposer + +(expoMain === null || expoMain === void 0 ? void 0 : expoMain.casinoexposer) || 0;
                            return this.success(res, { bet, bets, exposer: ex, profitlist }, 'PLace Bet Successfully');
                        }
                        else {
                            return this.fail(res, 'Invalid Data');
                        }
                    }
                    else {
                        let casinoexposer = yield this.getcasinoexposerfunction(user, false, json);
                        if (casinoexposer != 'failed') {
                            let available_balance = userBlance && userBlance.balance ? userBlance.balance : -casinoexposer;
                            if (available_balance && available_balance < parseInt(casinoexposer)) {
                                return this.fail(res, ' Max limit Exceed.');
                            }
                            yield bet.save(function (err) {
                                if (err)
                                    throw err;
                            });
                            const expofull = yield Balance_1.Balance.findOneAndUpdate({ userId: user._id }, { $set: { casinoexposer } });
                            // balance event here
                            const bets = yield Bet_1.Bet.find({
                                userId: userId,
                                matchId: match_id,
                                status: 'pending',
                                bet_on: Bet_1.BetOn.CASINO,
                            }).sort({
                                createdAt: -1,
                            });
                            const markets = yield CasinoMatches_1.Casino.findOne({
                                match_id: match_id,
                            });
                            console.log(markets, 'marketsmarketsmarkets');
                            const profitlist = this.getcasinooddsprofit(bets, (_a = markets === null || markets === void 0 ? void 0 : markets.event_data) === null || _a === void 0 ? void 0 : _a.market, markets);
                            return this.success(res, { bet, bets, exposer: casinoexposer + +(expofull === null || expofull === void 0 ? void 0 : expofull.exposer), profitlist }, 'PLace Bet Successfully');
                        }
                        else {
                            return this.fail(res, 'Invalid Data');
                        }
                    }
                }
                else {
                    return this.fail(res, 'Invalid Data');
                }
            }
            catch (e) {
                return this.fail(res, e.stack);
            }
        });
        this.getexposer = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const user = req.user;
                const userbet = yield Bet_1.Bet.find({ status: 'pending', userId: ObjectId(user._id) }, { _id: 1, matchId: 1 });
                const event_id = [];
                userbet.map((Item) => {
                    if (event_id.indexOf(Item.matchId) <= -1) {
                        event_id.push(Item.matchId);
                    }
                });
                if (event_id.length > 0) {
                    const match_list = yield Match_1.Match.find({ matchId: { $in: event_id } });
                    let new_match_list = [];
                    const market_grab = yield match_list.map((Item) => __awaiter(this, void 0, void 0, function* () {
                        let markets = yield Market_1.Market.find({ matchId: Item.matchId });
                        Item['markets'] = markets;
                        new_match_list.push(Item);
                    }));
                    yield Promise.all(market_grab);
                    let fancy_expo = 0;
                    var main_expo = 0;
                    const exposer_list = yield new_match_list.map((Item) => __awaiter(this, void 0, void 0, function* () {
                        let profit = {};
                        let fancypl = {};
                        const event_data = Item.markets;
                        if (event_data.length > 0) {
                            event_data.map((ItemEvent) => __awaiter(this, void 0, void 0, function* () {
                                let betlist = yield Bet_1.Bet.find({
                                    status: 'pending',
                                    userId: ObjectId(user._id),
                                    matchId: Item.matchId,
                                    bet_on: Bet_1.BetOn.MATCH_ODDS,
                                    marketId: ItemEvent.marketId,
                                });
                                let profit = yield this.getmatchoddsexposer(betlist, Item);
                                let expo_li = [];
                                Object.values(profit).forEach((key, index) => {
                                    let o_key = key;
                                    if (parseFloat(o_key) < 0) {
                                        expo_li.push(key);
                                    }
                                });
                                main_expo = main_expo + Math.abs(Math.min(expo_li));
                            }));
                        }
                        let fancybetlist = yield Bet_1.Bet.find({
                            status: 'pending',
                            userId: ObjectId(user._id),
                            matchId: Item.matchId,
                            bet_on: Bet_1.BetOn.FANCY,
                        });
                        fancypl = yield this.getfancysexposer(fancybetlist);
                        Object.values(fancypl).forEach((key, index) => {
                            let o_key = key;
                            fancy_expo += Math.abs(o_key);
                        });
                    }));
                    yield Promise.all(exposer_list);
                    let totalexposer = fancy_expo + main_expo;
                    let update_ob = { exposer: totalexposer };
                    const exposer = yield Balance_1.Balance.findOneAndUpdate({ userId: ObjectId(user._id) }, update_ob, {
                        new: true,
                        upsert: true,
                    });
                    return this.success(res, {
                        exposer: totalexposer,
                        fancy_expo: fancy_expo,
                        main_expo: main_expo,
                    }, 'Found');
                }
                else {
                    return this.success(res, {}, 'Not Found');
                }
            }
            catch (e) {
                return this.fail(res, e.message);
            }
        });
        this.getexposerfunction = (user, updatestaus, currenbet) => __awaiter(this, void 0, void 0, function* () {
            try {
                const userbet = yield Bet_1.Bet.find({ status: 'pending', userId: ObjectId(user._id) }, { _id: 1, matchId: 1 });
                const event_id = [];
                [...userbet, currenbet].map((Item) => {
                    if (event_id.indexOf(Item.matchId) <= -1) {
                        event_id.push(Item.matchId);
                    }
                });
                let completeBetlist = yield Bet_1.Bet.find({
                    status: 'pending',
                    userId: ObjectId(user._id),
                });
                completeBetlist.push(currenbet);
                if (event_id.length > 0) {
                    const match_list = yield Match_1.Match.find({ matchId: { $in: event_id } });
                    let new_match_list = [];
                    const market_grab = yield match_list.map((Item) => __awaiter(this, void 0, void 0, function* () {
                        let markets = yield Market_1.Market.find({ matchId: Item.matchId });
                        Item['markets'] = markets;
                        new_match_list.push(Item);
                    }));
                    yield Promise.all(market_grab);
                    let fancy_expo = 0;
                    var main_expo = 0;
                    const exposer_list = yield new_match_list.map((Item) => __awaiter(this, void 0, void 0, function* () {
                        let fancypl = {};
                        const event_data = Item.markets;
                        if (event_data.length > 0) {
                            const promismatchodds = event_data.map((ItemEvent) => __awaiter(this, void 0, void 0, function* () {
                                let betlist = completeBetlist.filter((ItemBetList) => ItemBetList.matchId == Item.matchId &&
                                    ItemBetList.bet_on == Bet_1.BetOn.MATCH_ODDS &&
                                    ItemBetList.marketId == ItemEvent.marketId);
                                let profit = yield this.getmatchoddsexposer(betlist, Item);
                                let expo_li = [];
                                Object.values(profit).forEach((key, index) => {
                                    let o_key = key;
                                    if (parseFloat(o_key) < 0) {
                                        if (expo_li.indexOf(key) <= -1) {
                                            expo_li.push(key);
                                        }
                                    }
                                });
                                main_expo += expo_li.length > 0 ? Math.abs(Math.min(...expo_li)) : 0;
                            }));
                            yield Promise.all(promismatchodds);
                        }
                        let fancybetlist = completeBetlist.filter((ItemBetList) => ItemBetList.matchId == Item.matchId && ItemBetList.bet_on == Bet_1.BetOn.FANCY);
                        fancypl = yield this.getfancysexposer(fancybetlist);
                        Object.values(fancypl).forEach((key, index) => {
                            let o_key = key;
                            fancy_expo += Math.abs(o_key);
                        });
                    }));
                    yield Promise.all(exposer_list);
                    let totalexposer = fancy_expo + +main_expo;
                    if (updatestaus) {
                        let update_ob = { exposer: totalexposer };
                        const exposer = yield Balance_1.Balance.findOneAndUpdate({ userId: ObjectId(user._id) }, update_ob, { new: true, upsert: true });
                        user_socket_1.default.setExposer({
                            exposer: totalexposer,
                            balance: exposer.balance,
                            userId: user._id,
                        });
                    }
                    return totalexposer;
                    /// return this.success(res, { exposer: totalexposer, fancy_expo: fancy_expo, main_expo: main_expo }, "Found");
                }
                else {
                    return 'failed';
                    ///   return this.success(res, {}, "Not Found");
                }
            }
            catch (e) {
                console.log(e);
                return 'failed';
                /// return this.fail(res, e.message);
            }
        });
        this.getcasinoexposerfunction = (user, updatestaus, currenbet) => __awaiter(this, void 0, void 0, function* () {
            try {
                const userbet = yield Bet_1.Bet.find({ status: 'pending', userId: ObjectId(user._id), bet_on: Bet_1.BetOn.CASINO }, { _id: 1, matchId: 1, marketId: 1 });
                const event_id = [];
                [...userbet, currenbet].map((Item) => {
                    if (event_id.indexOf(Item.matchId) <= -1) {
                        event_id.push(Item.matchId);
                    }
                });
                const roundid = [];
                [...userbet, currenbet].map((Item) => {
                    const checkalready = roundid.filter((ItemN) => ItemN.roundid == Item.marketId);
                    if (checkalready.length <= 0) {
                        roundid.push({ match_id: Item.matchId, roundid: Item.marketId });
                    }
                });
                let completeBetlist = yield Bet_1.Bet.find({
                    status: 'pending',
                    userId: ObjectId(user._id),
                    bet_on: Bet_1.BetOn.CASINO,
                });
                completeBetlist.push(currenbet);
                if (event_id.length > 0) {
                    const match_list = yield CasinoMatches_1.Casino.find({ match_id: { $in: event_id } });
                    const matchData = match_list && match_list != null ? match_list : [];
                    var main_expo = 0;
                    const exposer_list = yield matchData.map((Item) => __awaiter(this, void 0, void 0, function* () {
                        const event_data = Item.event_data.market;
                        const filterround = roundid.filter((ItemRound) => ItemRound.match_id == Item.match_id);
                        if (event_data.length > 0 && filterround.length > 0) {
                            const promismatchodds = event_data.map((ItemEvent) => __awaiter(this, void 0, void 0, function* () {
                                const promise2 = filterround.map((ItemRoundWise) => __awaiter(this, void 0, void 0, function* () {
                                    let betlist = completeBetlist.filter((ItemBetList) => ItemBetList.matchId == Item.match_id &&
                                        ItemBetList.bet_on == Bet_1.BetOn.CASINO &&
                                        ItemBetList.marketName == ItemEvent.MarketName &&
                                        ItemBetList.marketId == ItemRoundWise.roundid);
                                    if (betlist.length > 0) {
                                        let profit;
                                        if (Item.match_id == 33) {
                                            profit = yield this.getCmetercasinoexposer(betlist, Item);
                                        }
                                        else {
                                            profit = yield this.getmatchcasinoexposer(betlist, Item);
                                        }
                                        console.log(profit, 'profitprofitprofit');
                                        let expo_li = [];
                                        Object.values(profit).forEach((key, index) => {
                                            let o_key = key;
                                            if (parseFloat(o_key) < 0) {
                                                if (expo_li.indexOf(key) <= -1) {
                                                    expo_li.push(key);
                                                }
                                            }
                                        });
                                        /// console.log(expo_li, "expo_li"+ItemRoundWise.roundid)
                                        ///  console.log(betlist, "expo_li"+ItemRoundWise.roundid)
                                        main_expo += expo_li.length > 0 ? Math.abs(Math.min(...expo_li)) : 0;
                                    }
                                }));
                                yield Promise.all(promise2);
                            }));
                            yield Promise.all(promismatchodds);
                        }
                    }));
                    yield Promise.all(exposer_list);
                    console.log(main_expo);
                    let totalexposer = main_expo;
                    if (updatestaus) {
                        let update_ob = { casinoexposer: totalexposer };
                        const exposer = yield Balance_1.Balance.findOneAndUpdate({ userId: ObjectId(user._id) }, update_ob, { new: true, upsert: true });
                        console.log(totalexposer + +(exposer === null || exposer === void 0 ? void 0 : exposer.exposer), 'totalexposer + + exposer?.exposertotalexposer + + exposer?.exposerx');
                        user_socket_1.default.setExposer({
                            exposer: totalexposer + +(exposer === null || exposer === void 0 ? void 0 : exposer.exposer),
                            balance: exposer.balance,
                            userId: user._id,
                        });
                    }
                    return totalexposer;
                    /// return this.success(res, { exposer: totalexposer, fancy_expo: fancy_expo, main_expo: main_expo }, "Found");
                }
                else {
                    return 'failed';
                    ///   return this.success(res, {}, "Not Found");
                }
            }
            catch (e) {
                console.log(e);
                return 'failed';
                /// return this.fail(res, e.message);
            }
        });
        /********this is for match odd / bookmaker exposer calculation*/
        this.getmatchoddsexposer = (betlist, match_data) => __awaiter(this, void 0, void 0, function* () {
            let profit = {};
            betlist.map((ItemBets) => {
                let runner_data_check = match_data.markets.filter((ItemRunn) => ItemRunn.marketId == ItemBets.marketId);
                if (runner_data_check[0] == undefined)
                    return;
                const runner_data = runner_data_check[0].runners;
                runner_data.map((ItemRunners) => {
                    if (profit[ItemBets['marketId'] + '_' + ItemRunners['selectionId']] == undefined) {
                        profit[ItemBets['marketId'] + '_' + ItemRunners['selectionId']] = 0;
                    }
                    if (ItemBets['bet_on'] == Bet_1.BetOn.MATCH_ODDS) {
                        if (ItemBets['isBack'] == true) {
                            if (ItemBets['selectionId'] == ItemRunners['selectionId']) {
                                profit[ItemBets['marketId'] + '_' + ItemRunners['selectionId']] += ItemBets['pnl'];
                            }
                            else {
                                profit[ItemBets['marketId'] + '_' + ItemRunners['selectionId']] += ItemBets['loss'];
                            }
                        }
                        else {
                            if (ItemBets['selectionId'] == ItemRunners['selectionId']) {
                                profit[ItemBets['marketId'] + '_' + ItemRunners['selectionId']] += ItemBets['loss'];
                            }
                            else {
                                profit[ItemBets['marketId'] + '_' + ItemRunners['selectionId']] += ItemBets['pnl'];
                            }
                        }
                    }
                });
            });
            return profit;
        });
        this.getmatchcasinoexposer = (betlist, match_data) => __awaiter(this, void 0, void 0, function* () {
            let profit = {};
            betlist.map((ItemBets) => {
                let runner_data_check = match_data.event_data.market.filter((ItemRunn) => ItemRunn.MarketName == ItemBets.marketName);
                if (runner_data_check[0] == undefined)
                    return;
                const runner_data = runner_data_check[0].Runners;
                runner_data.map((ItemRunners) => {
                    if (profit[ItemBets['marketId'] + '_' + ItemRunners['SelectionId']] == undefined) {
                        profit[ItemBets['marketId'] + '_' + ItemRunners['SelectionId']] = 0;
                    }
                    if (ItemBets['bet_on'] == Bet_1.BetOn.CASINO) {
                        if (ItemBets['isBack'] == true) {
                            if (ItemBets['fancystatus'] == 'yes') {
                                const filterbets = betlist && betlist.length > 0
                                    ? betlist.filter((ItemN) => {
                                        console.log(ItemN.marketId, ' ItemN.marketId');
                                        return (ItemN.bet_on == Bet_1.BetOn.CASINO &&
                                            ItemN.marketId == ItemBets.marketId &&
                                            !ItemN.isBack);
                                    })
                                    : [];
                                if (ItemBets['selectionId'] == ItemRunners['SelectionId']) {
                                    if (ItemBets['isBack']) {
                                        profit[ItemBets['marketId'] + '_' + ItemRunners['SelectionId']] =
                                            profit[ItemBets['marketId'] + '_' + ItemRunners['SelectionId']] +
                                                (filterbets.length > 0 ? ItemBets.pnl : -ItemBets.stack);
                                    }
                                    else {
                                        profit[ItemBets['marketId'] + '_' + ItemRunners['SelectionId']] =
                                            profit[ItemBets['marketId'] + '_' + ItemRunners['SelectionId']] + ItemBets.loss;
                                    }
                                }
                                else {
                                    if (ItemBets['isBack']) {
                                        profit[ItemBets['marketId'] + '_' + ItemRunners['SelectionId']] =
                                            profit[ItemBets['marketId'] + '_' + ItemRunners['SelectionId']] +
                                                (filterbets.length > 0 ? ItemBets.pnl : -ItemBets.stack);
                                    }
                                    else {
                                        profit[ItemBets['marketId'] + '_' + ItemRunners['SelectionId']] =
                                            profit[ItemBets['marketId'] + '_' + ItemRunners['SelectionId']] + ItemBets.loss;
                                    }
                                }
                            }
                            else {
                                if (ItemBets['selectionId'] == ItemRunners['SelectionId']) {
                                    profit[ItemBets['marketId'] + '_' + ItemRunners['SelectionId']] +=
                                        runner_data.length == 1 ? ItemBets['loss'] : ItemBets['pnl'];
                                }
                                else {
                                    profit[ItemBets['marketId'] + '_' + ItemRunners['SelectionId']] += ItemBets['loss'];
                                }
                            }
                        }
                        else {
                            if (ItemBets['fancystatus'] == 'yes') {
                                if (ItemBets.marketName === 'Fancy1 Market') {
                                    profit[ItemBets['marketId'] + '_' + ItemRunners['SelectionId']] +=
                                        -1 * (ItemBets.odds * ItemBets.stack - ItemBets.stack);
                                }
                                else {
                                    let amt = (parseInt(ItemBets['stack']) * parseInt(ItemBets['volume'])) / 100;
                                    profit[ItemBets['marketId'] + '_' + ItemRunners['SelectionId']] += -amt;
                                }
                            }
                            else {
                                if (ItemBets['selectionId'] == ItemRunners['SelectionId']) {
                                    profit[ItemBets['marketId'] + '_' + ItemRunners['SelectionId']] += ItemBets['loss'];
                                }
                                else {
                                    profit[ItemBets['marketId'] + '_' + ItemRunners['SelectionId']] += ItemBets['pnl'];
                                }
                            }
                        }
                    }
                });
            });
            return profit;
        });
        this.getCmetercasinoexposer = (betlist, match_data) => __awaiter(this, void 0, void 0, function* () {
            let profit = {};
            betlist.map((ItemBets) => {
                let runner_data_check = match_data.event_data.market.filter((ItemRunn) => ItemRunn.MarketName == ItemBets.marketName);
                if (runner_data_check[0] == undefined)
                    return;
                const runner_data = runner_data_check[0].Runners;
                runner_data.map((ItemRunners) => {
                    if (profit[ItemBets['marketId'] + '_' + ItemRunners['SelectionId']] == undefined) {
                        profit[ItemBets['marketId'] + '_' + ItemRunners['SelectionId']] = 0;
                    }
                    if (ItemBets['bet_on'] == Bet_1.BetOn.CASINO) {
                        if (ItemBets['isBack'] == true) {
                            if (ItemBets['selectionId'] == ItemRunners['SelectionId']) {
                                profit[ItemBets['marketId'] + '_' + ItemRunners['SelectionId']] += ItemBets['loss'];
                            }
                        }
                        else {
                            if (ItemBets['selectionId'] == ItemRunners['SelectionId']) {
                                profit[ItemBets['marketId'] + '_' + ItemRunners['SelectionId']] += ItemBets['loss'];
                            }
                        }
                    }
                });
            });
            return profit;
        });
        /********this is for Current odds from odds api*/
        this.getcurrentodds = (marketid, type) => __awaiter(this, void 0, void 0, function* () {
            let url = !type.includes('Bookmaker')
                ? `/get-odds?MarketID=${marketid}`
                : `/get-bookmaker-odds?marketId=${marketid}`;
            const response = yield api_1.sportsApi.get(`${url}`).then((response) => __awaiter(this, void 0, void 0, function* () {
                return response.data;
            }));
            return response;
        });
        this.getcurrentfancyodds = (marketid, selectionId) => __awaiter(this, void 0, void 0, function* () {
            const response = yield api_1.sportsApi
                .get(`/get-single-session?MatchID=${marketid}&SelectionId=${selectionId}`)
                .then((response) => __awaiter(this, void 0, void 0, function* () {
                return response.data;
            }));
            return response;
        });
        /********this is for fancy exposer calculation*/
        this.getfancysexposer = (fancybetlist) => __awaiter(this, void 0, void 0, function* () {
            let fancypl = {};
            fancybetlist.map((ItemBets) => {
                if (fancypl[ItemBets['selectionId']] == undefined) {
                    fancypl[ItemBets['selectionId']] = 0;
                }
                if (ItemBets['isBack'] == true) {
                    if (ItemBets['volume'] > 100) {
                        if (ItemBets.gtype === 'fancy1') {
                            fancypl[ItemBets['selectionId']] += -ItemBets.stack;
                            //fancypl[ItemBets['selectionId']] += ItemBets.odds * ItemBets.stack - ItemBets.stack
                        }
                        else {
                            fancypl[ItemBets['selectionId']] += (ItemBets['stack'] * ItemBets['volume']) / 100;
                        }
                    }
                    else {
                        fancypl[ItemBets['selectionId']] += ItemBets['stack'];
                    }
                }
                else {
                    if (ItemBets['volume'] > 100) {
                        if (ItemBets.gtype === 'fancy1') {
                            fancypl[ItemBets['selectionId']] +=
                                -1 * (ItemBets.odds * ItemBets.stack - ItemBets.stack);
                        }
                        else {
                            let amt = (parseInt(ItemBets['stack']) * parseInt(ItemBets['volume'])) / 100;
                            fancypl[ItemBets['selectionId']] += amt;
                        }
                    }
                    else {
                        fancypl[ItemBets['selectionId']] += ItemBets['stack'];
                    }
                }
            });
            return fancypl;
        });
        this.betList = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const user = req.user;
                const { matchId } = req.query;
                let userId = { userId: ObjectId(user._id) };
                if (user.role !== Role_1.RoleType.user)
                    userId = { parentStr: { $in: ObjectId(user._id) } };
                const bets = yield Bet_1.Bet.find(Object.assign(Object.assign({}, userId), { matchId, status: 'pending' })).sort({
                    createdAt: -1,
                });
                if (bets.length > 0) {
                    const betFirst = bets[0];
                    if ((betFirst === null || betFirst === void 0 ? void 0 : betFirst.bet_on) != 'CASINO') {
                        const markets = yield Market_1.Market.find({
                            matchId,
                        });
                        const profitlist = this.getoddsprofit(bets, markets);
                        return this.success(res, { bets: bets, odds_profit: profitlist });
                    }
                    else {
                        const markets = yield CasinoMatches_1.Casino.findOne({
                            match_id: matchId,
                        });
                        console.log(JSON.stringify(markets), 'marketsmarketsmarketsmarkets');
                        const profitlist = this.getcasinooddsprofit(bets, markets.event_data.market, markets);
                        return this.success(res, { bets: bets, odds_profit: profitlist });
                    }
                }
                else {
                    return this.success(res, { bets: [], odds_profit: [] });
                }
            }
            catch (e) {
                return this.fail(res, e);
            }
        });
        this.getoddsprofit = (bets, markets) => {
            var odds_profit = {};
            const filterbets = bets && bets.length > 0 ? bets.filter((Item) => Item.bet_on == Bet_1.BetOn.MATCH_ODDS) : [];
            const promiseprofit = filterbets.map((Item) => {
                const selectionIdBet = Item.selectionId;
                const getBetType = Item.isBack;
                const lossAmt = Item.stack;
                const getOdds = Item.odds;
                let profitAmt = (parseFloat(getOdds) - 1) * parseFloat(lossAmt);
                let filtermarket = markets && markets.length > 0
                    ? markets.filter((ItemMarket) => ItemMarket.marketId == Item.marketId)
                    : [];
                const filtermarketdata = filtermarket && filtermarket.length > 0 ? filtermarket[0] : {};
                if (filtermarketdata) {
                    filtermarketdata.runners.map((mData, mIndex) => {
                        var SelectionId = mData.selectionId;
                        if (odds_profit[filtermarketdata.marketId + '_' + SelectionId] == undefined) {
                            odds_profit[filtermarketdata.marketId + '_' + SelectionId] = 0;
                        }
                        if (SelectionId == selectionIdBet) {
                            if (getBetType) {
                                odds_profit[filtermarketdata.marketId + '_' + SelectionId] =
                                    odds_profit[filtermarketdata.marketId + '_' + SelectionId] + profitAmt;
                            }
                            else {
                                odds_profit[filtermarketdata.marketId + '_' + SelectionId] =
                                    odds_profit[filtermarketdata.marketId + '_' + SelectionId] - profitAmt;
                            }
                        }
                        else {
                            if (getBetType) {
                                odds_profit[filtermarketdata.marketId + '_' + SelectionId] =
                                    odds_profit[filtermarketdata.marketId + '_' + SelectionId] - lossAmt;
                            }
                            else {
                                odds_profit[filtermarketdata.marketId + '_' + SelectionId] =
                                    odds_profit[filtermarketdata.marketId + '_' + SelectionId] + lossAmt;
                            }
                        }
                    });
                }
            });
            Promise.all(promiseprofit);
            const filterbetsFancy = bets && bets.length > 0 ? bets.filter((Item) => Item.bet_on == Bet_1.BetOn.FANCY) : [];
            var fancy_profit = {};
            const promiseprofitFancy = filterbetsFancy.map((Item) => {
                if (fancy_profit[Item.selectionId] == undefined) {
                    fancy_profit[Item.selectionId] = 0;
                }
                if (Item.isBack) {
                    if (Item['volume'] > 100) {
                        if (Item.gtype === 'fancy1') {
                            //fancy_profit[Item['selectionId']] += Item.odds * Item.stack - Item.stack
                            fancy_profit[Item['selectionId']] += -Item.stack;
                        }
                        else {
                            fancy_profit[Item['selectionId']] += -Item['stack'];
                        }
                    }
                    else {
                        fancy_profit[Item['selectionId']] += -Item['stack'];
                    }
                    ///fancy_profit[Item['selectionId']] += -(Item['stack'] * Item['volume']) / 100
                }
                else {
                    if (Item['volume'] > 100) {
                        if (Item.gtype === 'fancy1') {
                            fancy_profit[Item['selectionId']] += -1 * (Item.odds * Item.stack - Item.stack);
                        }
                        else {
                            let amt = (parseInt(Item['stack']) * parseInt(Item['volume'])) / 100;
                            fancy_profit[Item['selectionId']] += -amt;
                        }
                    }
                    else {
                        fancy_profit[Item['selectionId']] += -Item['stack'];
                    }
                    /// fancy_profit[Item['selectionId']] +=
                    ///  -(parseInt(Item['stack']) * parseInt(Item['volume'])) / 100
                }
            });
            Promise.all(promiseprofitFancy);
            odds_profit = Object.assign(Object.assign({}, odds_profit), fancy_profit);
            return odds_profit;
        };
        this.getcasinooddsprofit = (bets, markets, matchInfo) => {
            var odds_profit = {};
            const filterbets = bets && bets.length > 0 ? bets.filter((Item) => Item.bet_on == Bet_1.BetOn.CASINO) : [];
            const promiseprofit = filterbets.map((Item) => {
                const selectionIdBet = Item.selectionId;
                const getBetType = Item.isBack;
                const lossAmt = Item.matchId == 33 ? Item.stack : Item.loss;
                const getOdds = Item.odds;
                let profitAmt = 0;
                if (Item.fancystatus == 'yes') {
                    profitAmt = Item.pnl;
                }
                else {
                    profitAmt = (parseFloat(getOdds) - 1) * parseFloat(lossAmt);
                }
                let filtermarket = markets && markets.length > 0
                    ? markets.filter((ItemMarket) => ItemMarket.MarketName == Item.marketName)
                    : [];
                const filtermarketdata = filtermarket && filtermarket.length > 0 ? filtermarket[0] : { Runners: [] };
                if (filtermarketdata) {
                    filtermarketdata.Runners.map((mData, mIndex) => {
                        var SelectionId = mData.SelectionId;
                        if (odds_profit[Item.marketId + '_' + SelectionId] == undefined) {
                            odds_profit[Item.marketId + '_' + SelectionId] = 0;
                        }
                        console.log(matchInfo.match_id);
                        if (matchInfo.match_id == 33) {
                            //// specific condition for cmeter game
                            if (SelectionId == selectionIdBet) {
                                if (getBetType) {
                                    odds_profit[Item.marketId + '_' + SelectionId] =
                                        odds_profit[Item.marketId + '_' + SelectionId] + lossAmt;
                                }
                                else {
                                    odds_profit[Item.marketId + '_' + SelectionId] =
                                        odds_profit[Item.marketId + '_' + SelectionId] - profitAmt;
                                }
                            }
                        }
                        else if (matchInfo.match_id == 46) {
                            // race2020
                            if (SelectionId == selectionIdBet) {
                                if (getBetType) {
                                    odds_profit[Item.marketId + '_' + SelectionId] =
                                        odds_profit[Item.marketId + '_' + SelectionId] + lossAmt;
                                }
                                else {
                                    odds_profit[Item.marketId + '_' + SelectionId] =
                                        odds_profit[Item.marketId + '_' + SelectionId] + lossAmt;
                                }
                            }
                        }
                        else if (Item.fancystatus == 'yes') {
                            // all fancy cases
                            const filterbets = bets && bets.length > 0
                                ? bets.filter((ItemN) => {
                                    console.log(ItemN.marketId, ' ItemN.marketId');
                                    return (ItemN.bet_on == Bet_1.BetOn.CASINO &&
                                        ItemN.marketId == Item.marketId &&
                                        !ItemN.isBack);
                                })
                                : [];
                            if (SelectionId == selectionIdBet) {
                                if (getBetType) {
                                    odds_profit[Item.marketId + '_' + SelectionId] =
                                        odds_profit[Item.marketId + '_' + SelectionId] +
                                            (filterbets.length > 0 ? Item.pnl : -Item.stack);
                                }
                                else {
                                    odds_profit[Item.marketId + '_' + SelectionId] =
                                        odds_profit[Item.marketId + '_' + SelectionId] + lossAmt;
                                }
                            }
                        }
                        else {
                            if (SelectionId == selectionIdBet) {
                                if (getBetType) {
                                    odds_profit[Item.marketId + '_' + SelectionId] =
                                        odds_profit[Item.marketId + '_' + SelectionId] + profitAmt;
                                }
                                else {
                                    odds_profit[Item.marketId + '_' + SelectionId] =
                                        odds_profit[Item.marketId + '_' + SelectionId] - profitAmt;
                                }
                            }
                            else {
                                if (getBetType) {
                                    odds_profit[Item.marketId + '_' + SelectionId] =
                                        odds_profit[Item.marketId + '_' + SelectionId] - lossAmt;
                                }
                                else {
                                    odds_profit[Item.marketId + '_' + SelectionId] =
                                        odds_profit[Item.marketId + '_' + SelectionId] + lossAmt;
                                }
                            }
                        }
                    });
                }
            });
            Promise.all(promiseprofit);
            console.log(odds_profit, 'odds_profit');
            /// odds_profit = { ...odds_profit }
            return odds_profit;
        };
        this.alluserbetList = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { page } = req.query;
                let { reportType, startDate, endDate, userId, name, type, status, matchId } = req.body;
                const user = req.user;
                if (user.role === Role_1.RoleType.user && status == 'deleted') {
                    // Fake data for user
                    return this.success(res, {
                        docs: [],
                        hasNextPage: false,
                        hasPrevPage: false,
                        limit: 20,
                        nextPage: null,
                        page: 1,
                        pagingCounter: 1,
                        prevPage: null,
                        totalDocs: 0,
                        totalPages: 0,
                    });
                }
                const options = {
                    page: page ? page : 1,
                    limit: 20,
                    sort: { createdAt: -1 },
                };
                const useridmap = [];
                if (userId) {
                    useridmap.push(userId);
                }
                else {
                    const userChilds = yield User_1.User.find({ parentStr: { $elemMatch: { $eq: ObjectId(user._id) } }, role: Role_1.RoleType.user }, { _id: 1 });
                    useridmap.push(ObjectId(user._id));
                    userChilds.map((Item) => useridmap.push(ObjectId(Item._id)));
                }
                var filter = {
                    userId: { $in: useridmap },
                    status: type ? 'deleted' : status,
                };
                if (matchId) {
                    filter = Object.assign(Object.assign({}, filter), { matchId: parseInt(matchId) });
                }
                if (startDate && startDate != '') {
                    startDate = startDate.includes('T')
                        ? `${startDate.replace('T', ' ')}:00`
                        : `${startDate} 00:00:00`;
                    endDate = endDate.includes('T') ? `${endDate.replace('T', ' ')}:00` : `${endDate} 23:59:59`;
                    filter = Object.assign(Object.assign({}, filter), {
                        createdAt: {
                            $gte: new Date(startDate),
                            $lte: new Date(endDate),
                        },
                    });
                }
                if (reportType && reportType != '') {
                    filter = Object.assign(Object.assign({}, filter), { sportId: { $in: [parseInt(reportType), reportType] } });
                }
                if (name) {
                    filter = Object.assign(Object.assign({}, filter), { $or: [{ selectionName: new RegExp(name, 'i') }, { matchName: new RegExp(name, 'i') }] });
                }
                console.log(filter);
                const bets = yield Bet_1.Bet.paginate(filter, options);
                return this.success(res, bets);
            }
            catch (e) {
                return this.fail(res, e);
            }
        });
        this.alluserbetList22 = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                // Only get deleted bets from all users
                const filter = { status: 'deleted' };
                console.log("Filter:", filter);
                const deletedBets = yield Bet_1.Bet.find(filter).sort({ createdAt: -1 });
                return this.success(res, deletedBets);
            }
            catch (e) {
                return this.fail(res, e);
            }
        });
        this.undodeleteCurrentBet = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                let status = 'pending';
                const userbet = yield Bet_1.Bet.findOneAndUpdate({ _id: ObjectId(req.params.id) }, { $set: { status } });
                console.log(userbet, "userbet");
                const betAmount = parseFloat(userbet === null || userbet === void 0 ? void 0 : userbet.loss.toString());
                console.log(betAmount, "Bet ammount HHHHH");
                const userId = userbet.userId;
                const json = {};
                let exposer = yield this.getexposerfunction({ _id: userbet.userId }, true, json);
                let exposer2 = yield this.getcasinoexposerfunction({ _id: userbet.userId }, true, json);
                // balance event here
                return this.success(res, { success: true }, 'Bet Reverse successfully');
            }
            catch (e) {
                console.log(e);
                return this.fail(res, e);
            }
        });
        this.getExposerEvent = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const user = req.user;
                var filter = [
                    {
                        $match: {
                            userId: mongoose_1.Types.ObjectId(user._id),
                            status: 'pending',
                        },
                    },
                    {
                        $group: {
                            _id: '$matchId',
                            matchName: { $first: '$matchName' },
                            myCount: { $sum: 1 },
                            matchslug: { $first: '$matchDetails.slug' },
                            matchId: { $first: '$matchDetails.matchId' },
                        },
                    },
                ];
                const bets = yield Bet_1.Bet.aggregate([
                    {
                        $match: {
                            userId: mongoose_1.Types.ObjectId(user._id),
                            status: 'pending',
                        },
                    },
                    {
                        $group: {
                            _id: '$matchId',
                            matchName: { $first: '$matchName' },
                            myCount: { $sum: 1 },
                            sportId: { $first: '$sportId' },
                            matchId: { $first: '$matchId' },
                        },
                    },
                ]);
                // const bets = await Bet.aggregate([
                //   {
                //     $match: {
                //       userId: Types.ObjectId(user._id),
                //       status: 'pending',
                //     },
                //   },
                //   {
                //     $group: {
                //       _id: '$matchId',
                //       matchName: { $first: '$matchName' },
                //       myCount: { $sum: 1 },
                //       betOn: { $first: '$bet_on' }, // Preserve the bet_on field for conditional lookup
                //     },
                //   },
                //   {
                //     $lookup: {
                //       from: 'casinomatches', // Collection to lookup if bet_on is 'CASINO'
                //       localField: '_id',
                //       foreignField: '_id',
                //       as: 'matchDetails',
                //     },
                //   },
                //   {
                //     $lookup: {
                //       from: 'matches', // Collection to lookup if bet_on is not 'CASINO'
                //       localField: '_id',
                //       foreignField: '_id',
                //       as: 'matchDetails',
                //     },
                //   },
                //   {
                //     $unwind: '$matchDetails',
                //   },
                //   {
                //     $project: {
                //       _id: 1,
                //       matchName: 1,
                //       myCount: 1,
                //       matchslug: '$matchDetails.slug',
                //       matchId: '$matchDetails.matchId',
                //       betOn: 1, // Include the preserved bet_on field in the result
                //     },
                //   },
                // ]);
                return this.success(res, bets);
            }
            catch (e) {
                return this.fail(res, e);
            }
        });
        this.getBetListByIds = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { betIds, page } = req.body;
                const ids = betIds instanceof Array ? betIds : [betIds];
                const options = {
                    page: page ? page : 1,
                    limit: 10,
                    sort: { createdAt: -1 },
                };
                const bets = yield Bet_1.Bet.paginate({ _id: { $in: ids }, status: { $nin: ['pending', 'deleted'] } }, options);
                return this.success(res, bets);
            }
            catch (e) {
                return this.fail(res, e);
            }
        });
        this.deleteCurrentBet = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                let status = 'deleted';
                const userbet = yield Bet_1.Bet.findOneAndUpdate({ _id: ObjectId(req.params.id) }, { $set: { status } });
                const json = {};
                let exposer = yield this.getexposerfunction({ _id: userbet.userId }, true, json);
                // balance event here
                return this.success(res, { success: true }, 'Bet deleted successfully');
            }
            catch (e) {
                return this.fail(res, e);
            }
        });
        this.deleteBets = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { ids } = req.body;
                const userIds = yield Bet_1.Bet.find({ _id: { $in: ids } })
                    .select({ userId: 1 })
                    .distinct('userId')
                    .lean();
                let status = 'deleted';
                yield Bet_1.Bet.updateMany({ _id: { $in: ids } }, { $set: { status } });
                if (userIds.length > 0) {
                    userIds.map((userId) => __awaiter(this, void 0, void 0, function* () {
                        const json = {};
                        yield this.getexposerfunction({ _id: userId }, true, json);
                    }));
                }
                // balance event here
                return this.success(res, { success: true }, 'Bet deleted successfully');
            }
            catch (e) {
                return this.fail(res, e);
            }
        });
    }
}
exports.BetController = BetController;
//# sourceMappingURL=BetController.js.map