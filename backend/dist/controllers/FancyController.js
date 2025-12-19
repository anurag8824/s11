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
exports.FancyController = void 0;
const axios_1 = __importDefault(require("axios"));
const Fancy_1 = require("../models/Fancy");
const ApiController_1 = require("./ApiController");
const Bet_1 = require("../models/Bet");
const Match_1 = require("../models/Match");
const BetController_1 = require("./BetController");
const User_1 = require("../models/User");
const AccountStatement_1 = require("../models/AccountStatement");
const UserChip_1 = require("../models/UserChip");
const Balance_1 = require("../models/Balance");
const mongoose_1 = require("mongoose");
const user_socket_1 = __importDefault(require("../sockets/user-socket"));
const Role_1 = require("../models/Role");
const Market_1 = require("../models/Market");
const CasCasino_1 = require("../models/CasCasino");
var ObjectId = require('mongoose').Types.ObjectId;
class FancyController extends ApiController_1.ApiController {
    constructor() {
        super(...arguments);
        this.activeFancies = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { matchId, gtype } = req.query;
                if (!matchId)
                    return this.fail(res, 'matchId is required field');
                const strings = ['wkt', 'Wkts', 'Fours', 'Sixes'];
                const filters = {
                    $nor: [
                        ...strings.map((string) => ({ fancyName: { $regex: string } })),
                        { ballByBall: 'ballRun' },
                    ],
                    gtype,
                };
                let filter = { gtype };
                switch (gtype) {
                    case 'session':
                        filter = filters;
                        break;
                    case 'fancy1':
                        filter = { gtype };
                        break;
                    case 'wkt':
                        filter = {
                            $or: [{ fancyName: { $regex: gtype } }, { fancyName: { $regex: strings[1] } }],
                            gtype: { $ne: 'fancy1' },
                        };
                        break;
                    case 'ballRun':
                        filter = { ballByBall: 'ballRun' };
                        break;
                }
                if (strings.find((str) => str.includes(gtype))) {
                    filter = { fancyName: { $regex: gtype }, gtype: { $ne: 'fancy1' } };
                }
                const bets = yield Bet_1.Bet.find({ matchId, bet_on: Bet_1.BetOn.FANCY }).select({ selectionId: 1 });
                let allBets = {};
                if (bets.length) {
                    bets.forEach((bet) => {
                        allBets[`${bet.selectionId}`] = true;
                    });
                }
                let fancy = yield Fancy_1.Fancy.find(Object.assign({ matchId }, filter))
                    .sort({ active: -1 })
                    .lean();
                fancy = fancy
                    .map((f) => {
                    f.bet = allBets[f.marketId] ? true : false;
                    return f;
                })
                    .sort((a, b) => b.bet - a.bet);
                return this.success(res, fancy);
            }
            catch (e) {
                return this.fail(res, e);
            }
        });
        this.suspendFancy = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { marketId, matchId, type } = req.query;
                const newFancy = yield Fancy_1.Fancy.findOne({
                    marketId: `${marketId}`,
                    matchId,
                });
                if (newFancy && type) {
                    newFancy[type] = !newFancy[type];
                    if (type !== 'active')
                        newFancy.GameStatus = newFancy[type] ? 'SUSPENDED' : '';
                    newFancy.save();
                }
                axios_1.default
                    .post(`${process.env.OD_NODE_URL}fancy-suspend`, {
                    fancy: newFancy,
                    type,
                })
                    .then((res) => console.log(res.data))
                    .catch((e) => {
                    console.log(e.response.data);
                });
                return this.success(res, newFancy);
            }
            catch (e) {
                return this.fail(res, e);
            }
        });
        this.rollbackfancyresult = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { marketId, matchId } = req.query;
                const userbet = yield Bet_1.Bet.aggregate([
                    {
                        $match: {
                            status: 'completed',
                            bet_on: Bet_1.BetOn.FANCY,
                            marketId: marketId,
                            matchId: parseInt(matchId),
                        },
                    },
                    {
                        $group: {
                            _id: '$userId',
                            allBets: { $push: '$$ROOT' },
                        },
                    },
                    {
                        $addFields: {
                            allBets: {
                                $map: {
                                    input: '$allBets',
                                    as: 'bet',
                                    in: {
                                        $mergeObjects: [
                                            '$$bet',
                                            {
                                                odds: { $toString: '$$bet.odds' },
                                                volume: { $toString: '$$bet.volume' },
                                                stack: { $toString: '$$bet.stack' },
                                                pnl: { $toString: '$$bet.pnl' },
                                                commission: { $toString: '$$bet.commission' },
                                                matchedOdds: { $toString: '$$bet.matchedOdds' },
                                                loss: { $toString: '$$bet.loss' },
                                                profitLoss: { $toString: '$$bet.profitLoss' },
                                            },
                                        ],
                                    },
                                },
                            },
                        },
                    },
                ]);
                let userIdList = [];
                const parentIdList = [];
                const declare_result = userbet.map((Item) => __awaiter(this, void 0, void 0, function* () {
                    let allbets = Item.allBets;
                    const settle_single = allbets.map((ItemBetList, indexBetList) => __awaiter(this, void 0, void 0, function* () {
                        user_socket_1.default.onRollbackPlaceBet(ItemBetList);
                        yield AccountStatement_1.AccoutStatement.deleteMany({ betId: ObjectId(ItemBetList._id) });
                        if (indexBetList == 0) {
                            ItemBetList.ratioStr.allRatio.map((ItemParentStr) => {
                                parentIdList.push(ItemParentStr.parent);
                                userIdList.push(ObjectId(ItemParentStr.parent));
                            });
                        }
                    }));
                    Promise.all(settle_single);
                    userIdList.push(ObjectId(Item._id));
                }));
                yield Promise.all(declare_result);
                yield Bet_1.Bet.updateMany({
                    userId: { $in: userIdList },
                    matchId: matchId,
                    selectionId: marketId,
                    bet_on: Bet_1.BetOn.FANCY,
                }, { $set: { status: 'pending' } });
                const unique = [...new Set(userIdList)];
                if (unique.length > 0) {
                    yield this.updateUserAccountStatement(unique, parentIdList);
                }
                yield Fancy_1.Fancy.updateOne({ matchId: matchId, marketId: marketId }, { $set: { result: '' } });
                return this.success(res, userbet, '');
            }
            catch (e) {
                return this.fail(res, e);
            }
        });
        this.rollbackfancyresultbyapi = ({ marketId, matchId }) => __awaiter(this, void 0, void 0, function* () {
            try {
                const userbet = yield Bet_1.Bet.aggregate([
                    {
                        $match: {
                            status: 'completed',
                            bet_on: Bet_1.BetOn.FANCY,
                            marketId: marketId,
                            matchId: parseInt(matchId),
                        },
                    },
                    {
                        $group: {
                            _id: '$userId',
                            allBets: { $push: '$$ROOT' },
                        },
                    },
                    {
                        $addFields: {
                            allBets: {
                                $map: {
                                    input: '$allBets',
                                    as: 'bet',
                                    in: {
                                        $mergeObjects: [
                                            '$$bet',
                                            {
                                                odds: { $toString: '$$bet.odds' },
                                                volume: { $toString: '$$bet.volume' },
                                                stack: { $toString: '$$bet.stack' },
                                                pnl: { $toString: '$$bet.pnl' },
                                                commission: { $toString: '$$bet.commission' },
                                                matchedOdds: { $toString: '$$bet.matchedOdds' },
                                                loss: { $toString: '$$bet.loss' },
                                                profitLoss: { $toString: '$$bet.profitLoss' },
                                            },
                                        ],
                                    },
                                },
                            },
                        },
                    },
                ]);
                let userIdList = [];
                const parentIdList = [];
                const declare_result = userbet.map((Item) => __awaiter(this, void 0, void 0, function* () {
                    let allbets = Item.allBets;
                    const settle_single = allbets.map((ItemBetList, indexBetList) => __awaiter(this, void 0, void 0, function* () {
                        user_socket_1.default.onRollbackPlaceBet(ItemBetList);
                        yield AccountStatement_1.AccoutStatement.deleteMany({ betId: ObjectId(ItemBetList._id) });
                        if (indexBetList == 0) {
                            ItemBetList.ratioStr.allRatio.map((ItemParentStr) => {
                                parentIdList.push(ItemParentStr.parent);
                                userIdList.push(ObjectId(ItemParentStr.parent));
                            });
                        }
                    }));
                    Promise.all(settle_single);
                    userIdList.push(ObjectId(Item._id));
                }));
                yield Promise.all(declare_result);
                yield Bet_1.Bet.updateMany({
                    userId: { $in: userIdList },
                    matchId: matchId,
                    selectionId: marketId,
                    bet_on: Bet_1.BetOn.FANCY,
                }, { $set: { status: 'pending' } });
                const unique = [...new Set(userIdList)];
                if (unique.length > 0) {
                    yield this.updateUserAccountStatement(unique, parentIdList);
                }
                yield Fancy_1.Fancy.updateOne({ matchId: matchId, marketId: marketId }, { $set: { result: '' } });
                return true;
            }
            catch (e) {
                return false;
            }
        });
        this.updatefancyresultapi = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const data = req.body;
                axios_1.default.post("https://api.bxpro99.xyz/api/update-fancy-result", data);
                if (data.result != '' && data.message == 'ok') {
                    const findFancy = yield Fancy_1.Fancy.findOne({ fancyName: data.runnerName, matchId: data.matchId });
                    if ((findFancy === null || findFancy === void 0 ? void 0 : findFancy._id) && !data.isRollback) {
                        this.declarefancyresultAuto({ matchId: findFancy.matchId, marketId: findFancy.marketId, result: data.result });
                    }
                    else if (findFancy === null || findFancy === void 0 ? void 0 : findFancy._id) {
                        this.rollbackfancyresultbyapi({ matchId: findFancy.matchId, marketId: findFancy.marketId });
                    }
                    return this.success(res, {});
                }
                else {
                    return this.success(res, { message: "result not found" });
                }
            }
            catch (e) {
                return this.fail(res, e);
            }
        });
        this.declarefancyresultAuto = ({ marketId, matchId, result }) => __awaiter(this, void 0, void 0, function* () {
            try {
                const userbet = yield Bet_1.Bet.aggregate([
                    {
                        $match: {
                            status: 'pending',
                            bet_on: Bet_1.BetOn.FANCY,
                            marketId: marketId,
                            matchId: parseInt(matchId),
                        },
                    },
                    {
                        $group: {
                            _id: '$userId',
                            allBets: { $push: '$$ROOT' },
                        },
                    },
                ]);
                let userIdList = [];
                const parentIdList = [];
                const declare_result = userbet.map((Item) => __awaiter(this, void 0, void 0, function* () {
                    let allbets = Item.allBets;
                    const settle_single = allbets.map((ItemBetList, indexBetList) => __awaiter(this, void 0, void 0, function* () {
                        let profit_type = 'loss';
                        profit_type =
                            ItemBetList.isBack == false && parseInt(result) < parseInt(ItemBetList.odds)
                                ? 'profit'
                                : profit_type;
                        profit_type =
                            ItemBetList.isBack == true && parseInt(result) >= parseInt(ItemBetList.odds)
                                ? 'profit'
                                : profit_type;
                        let profitLossAmt = 0;
                        if (ItemBetList.gtype === 'fancy1') {
                            profit_type =
                                ItemBetList.isBack == true && parseInt(result) == 1 ? 'profit' : profit_type;
                            profit_type =
                                ItemBetList.isBack == false && parseInt(result) == 0 ? 'profit' : profit_type;
                        }
                        if (profit_type == 'profit') {
                            if (ItemBetList.gtype === 'fancy1') {
                                profitLossAmt = ItemBetList.isBack
                                    ? ItemBetList.odds * ItemBetList.stack - ItemBetList.stack
                                    : ItemBetList.stack;
                            }
                            else {
                                profitLossAmt = ItemBetList.isBack
                                    ? (parseFloat(ItemBetList.volume) * parseFloat(ItemBetList.stack)) / 100
                                    : ItemBetList.stack;
                            }
                        }
                        else if (profit_type == 'loss') {
                            if (ItemBetList.gtype === 'fancy1') {
                                profitLossAmt = ItemBetList.isBack
                                    ? -ItemBetList.stack
                                    : -1 * (ItemBetList.odds * ItemBetList.stack - ItemBetList.stack);
                            }
                            else {
                                profitLossAmt = ItemBetList.isBack
                                    ? -ItemBetList.stack
                                    : -(parseFloat(ItemBetList.volume) * parseFloat(ItemBetList.stack)) / 100;
                            }
                        }
                        let type_string = ItemBetList.isBack ? 'Yes' : 'No';
                        if (result == -1) {
                            profitLossAmt = 0;
                        }
                        let narration = ItemBetList.matchName +
                            ' / ' +
                            ItemBetList.selectionName +
                            ' / ' +
                            type_string +
                            ' / ' +
                            (result == -1 ? 'Abandoned' : result);
                        yield this.addprofitlosstouser({
                            userId: ObjectId(Item._id),
                            bet_id: ObjectId(ItemBetList._id),
                            profit_loss: profitLossAmt,
                            matchId,
                            narration,
                            sportsType: ItemBetList.sportId,
                            selectionId: ItemBetList.selectionId,
                            sportId: ItemBetList.sportId,
                        });
                        if (indexBetList == 0) {
                            ItemBetList.ratioStr.allRatio.map((ItemParentStr) => {
                                parentIdList.push(ItemParentStr.parent);
                                userIdList.push(ObjectId(ItemParentStr.parent));
                            });
                        }
                        user_socket_1.default.betDelete({ betId: ItemBetList._id, userId: ItemBetList.userId });
                    }));
                    yield Promise.all(settle_single);
                    userIdList.push(ObjectId(Item._id));
                }));
                yield Promise.all(declare_result);
                yield Bet_1.Bet.updateMany({
                    userId: { $in: userIdList },
                    matchId: matchId,
                    selectionId: marketId,
                    bet_on: Bet_1.BetOn.FANCY,
                }, { $set: { status: 'completed' } });
                const unique = [...new Set(userIdList)];
                if (unique.length > 0) {
                    yield this.updateUserAccountStatement(unique, parentIdList);
                }
                yield Fancy_1.Fancy.updateOne({ matchId: matchId, marketId: marketId }, { $set: { result: result } });
                return true;
            }
            catch (e) {
                return false;
            }
        });
        this.updateUserAccountStatement = (userIds, parentIdList) => __awaiter(this, void 0, void 0, function* () {
            if (userIds.length > 0) {
                const betController = new BetController_1.BetController();
                const json = {};
                const promiseStatment = userIds.map((ItemUserId) => __awaiter(this, void 0, void 0, function* () {
                    let exposer = 0;
                    let balancePnl = 0;
                    const blanceData = yield this.updateUserBal(ItemUserId, parentIdList);
                    if (parentIdList.indexOf(ItemUserId) == -1) {
                        exposer = yield betController.getexposerfunction({ _id: ItemUserId.toString() }, false, json);
                        balancePnl = blanceData.pnl_;
                    }
                    else {
                        balancePnl = blanceData.pnl_;
                    }
                    yield Balance_1.Balance.findOneAndUpdate({ userId: ItemUserId }, { balance: blanceData.Balance_, exposer: exposer, profitLoss: balancePnl }, { new: true, upsert: true });
                    user_socket_1.default.setExposer({
                        balance: blanceData.Balance_,
                        exposer: exposer,
                        userId: ItemUserId,
                    });
                }));
                yield Promise.all(promiseStatment);
            }
        });
        this.updateUserAccountStatementCasino = (userIds, parentIdList) => __awaiter(this, void 0, void 0, function* () {
            if (userIds.length > 0) {
                const betController = new BetController_1.BetController();
                const json = {};
                const promiseStatment = userIds.map((ItemUserId) => __awaiter(this, void 0, void 0, function* () {
                    let exposer = 0;
                    let balancePnl = 0;
                    const blanceData = yield this.updateUserBal(ItemUserId, parentIdList);
                    if (parentIdList.indexOf(ItemUserId) == -1) {
                        exposer = yield betController.getcasinoexposerfunction({ _id: ItemUserId.toString() }, false, json);
                        balancePnl = blanceData.pnl_;
                    }
                    else {
                        balancePnl = blanceData.pnl_;
                    }
                    const updateUserBal = yield Balance_1.Balance.findOneAndUpdate({ userId: ItemUserId }, { balance: blanceData.Balance_, casinoexposer: exposer, profitLoss: balancePnl }, { new: true, upsert: true });
                    const updateUserBalBad = yield Balance_1.Balance.findOne({ userId: ItemUserId });
                    console.log(updateUserBalBad, "hello World");
                    user_socket_1.default.setExposer({
                        balance: blanceData.Balance_,
                        exposer: exposer + +(updateUserBal === null || updateUserBal === void 0 ? void 0 : updateUserBal.exposer),
                        userId: ItemUserId,
                    });
                }));
                yield Promise.all(promiseStatment);
            }
        });
        this.declarefancyresult = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { marketId, matchId, result } = req.query;
                const userbet = yield Bet_1.Bet.aggregate([
                    {
                        $match: {
                            status: 'pending',
                            bet_on: Bet_1.BetOn.FANCY,
                            marketId: marketId,
                            matchId: parseInt(matchId),
                        },
                    },
                    {
                        $group: {
                            _id: '$userId',
                            allBets: { $push: '$$ROOT' },
                        },
                    },
                ]);
                let userIdList = [];
                const parentIdList = [];
                const declare_result = userbet.map((Item) => __awaiter(this, void 0, void 0, function* () {
                    let allbets = Item.allBets;
                    const settle_single = allbets.map((ItemBetList, indexBetList) => __awaiter(this, void 0, void 0, function* () {
                        let profit_type = 'loss';
                        profit_type =
                            ItemBetList.isBack == false && parseInt(result) < parseInt(ItemBetList.odds)
                                ? 'profit'
                                : profit_type;
                        profit_type =
                            ItemBetList.isBack == true && parseInt(result) >= parseInt(ItemBetList.odds)
                                ? 'profit'
                                : profit_type;
                        let profitLossAmt = 0;
                        if (ItemBetList.gtype === 'fancy1') {
                            profit_type =
                                ItemBetList.isBack == true && parseInt(result) == 1 ? 'profit' : profit_type;
                            profit_type =
                                ItemBetList.isBack == false && parseInt(result) == 0 ? 'profit' : profit_type;
                        }
                        if (profit_type == 'profit') {
                            if (ItemBetList.gtype === 'fancy1') {
                                profitLossAmt = ItemBetList.isBack
                                    ? ItemBetList.odds * ItemBetList.stack - ItemBetList.stack
                                    : ItemBetList.stack;
                            }
                            else {
                                profitLossAmt = ItemBetList.isBack
                                    ? (parseFloat(ItemBetList.volume) * parseFloat(ItemBetList.stack)) / 100
                                    : ItemBetList.stack;
                            }
                        }
                        else if (profit_type == 'loss') {
                            if (ItemBetList.gtype === 'fancy1') {
                                profitLossAmt = ItemBetList.isBack
                                    ? -ItemBetList.stack
                                    : -1 * (ItemBetList.odds * ItemBetList.stack - ItemBetList.stack);
                            }
                            else {
                                profitLossAmt = ItemBetList.isBack
                                    ? -ItemBetList.stack
                                    : -(parseFloat(ItemBetList.volume) * parseFloat(ItemBetList.stack)) / 100;
                            }
                        }
                        let type_string = ItemBetList.isBack ? 'Yes' : 'No';
                        if (result == -1) {
                            profitLossAmt = 0;
                        }
                        let narration = ItemBetList.matchName +
                            ' / ' +
                            ItemBetList.selectionName +
                            ' / ' +
                            type_string +
                            ' / ' +
                            (result == -1 ? 'Abandoned' : result);
                        yield this.addprofitlosstouser({
                            userId: ObjectId(Item._id),
                            bet_id: ObjectId(ItemBetList._id),
                            profit_loss: profitLossAmt,
                            matchId,
                            narration,
                            sportsType: ItemBetList.sportId,
                            selectionId: ItemBetList.selectionId,
                            sportId: ItemBetList.sportId,
                        });
                        if (indexBetList == 0) {
                            ItemBetList.ratioStr.allRatio.map((ItemParentStr) => {
                                parentIdList.push(ItemParentStr.parent);
                                userIdList.push(ObjectId(ItemParentStr.parent));
                            });
                        }
                        user_socket_1.default.betDelete({ betId: ItemBetList._id, userId: ItemBetList.userId });
                    }));
                    yield Promise.all(settle_single);
                    userIdList.push(ObjectId(Item._id));
                }));
                yield Promise.all(declare_result);
                yield Bet_1.Bet.updateMany({
                    userId: { $in: userIdList },
                    matchId: matchId,
                    selectionId: marketId,
                    bet_on: Bet_1.BetOn.FANCY,
                }, { $set: { status: 'completed' } });
                const unique = [...new Set(userIdList)];
                if (unique.length > 0) {
                    yield this.updateUserAccountStatement(unique, parentIdList);
                }
                yield Fancy_1.Fancy.updateOne({ matchId: matchId, marketId: marketId }, { $set: { result: result } });
                return this.success(res, userbet, '');
            }
            catch (e) {
                return this.fail(res, e);
            }
        });
        this.setT10FancyResult = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const pendingFanciesMatchs = yield Fancy_1.Fancy.aggregate([
                { $match: { status: { $eq: undefined } } },
                { $group: { _id: '$matchId' } },
                { $project: { matchId: 1 } },
            ]);
            pendingFanciesMatchs.map((item) => {
                axios_1.default
                    .get(`${process.env.SUPER_NODE_URL}api/get-t10-fancy-result?matchId=${item._id}`)
                    .then((response) => __awaiter(this, void 0, void 0, function* () {
                    yield new FancyController().declarefancyresultauto(response.data);
                }))
                    .catch((e) => console.log(e.message));
            });
            return this.success(res, {});
        });
        this.declarefancyresultauto = ({ marketIdList, matchId }) => __awaiter(this, void 0, void 0, function* () {
            try {
                const pendingFancies = yield Fancy_1.Fancy.find({ status: { $eq: undefined }, matchId: matchId }, { marketId: 1 });
                const finalArray = pendingFancies.map((ItemPending) => ItemPending.marketId);
                const declareResultList = marketIdList.filter((ItemSet) => finalArray.indexOf(ItemSet.marketId) > -1);
                const dataPromise = declareResultList.map((ItemResult) => __awaiter(this, void 0, void 0, function* () {
                    const { marketId, result } = ItemResult;
                    const userbet = yield Bet_1.Bet.aggregate([
                        {
                            $match: {
                                status: 'pending',
                                bet_on: Bet_1.BetOn.FANCY,
                                marketId: marketId,
                                matchId: parseInt(matchId),
                            },
                        },
                        {
                            $group: {
                                _id: '$userId',
                                allBets: { $push: '$$ROOT' },
                            },
                        },
                    ]);
                    let userIdList = [];
                    const parentIdList = [];
                    const declare_result = userbet.map((Item) => __awaiter(this, void 0, void 0, function* () {
                        let allbets = Item.allBets;
                        const settle_single = allbets.map((ItemBetList, indexBetList) => __awaiter(this, void 0, void 0, function* () {
                            let profit_type = 'loss';
                            profit_type =
                                ItemBetList.isBack == false && parseInt(result) < parseInt(ItemBetList.odds)
                                    ? 'profit'
                                    : profit_type;
                            profit_type =
                                ItemBetList.isBack == true && parseInt(result) >= parseInt(ItemBetList.odds)
                                    ? 'profit'
                                    : profit_type;
                            let profitLossAmt = 0;
                            if (ItemBetList.gtype === 'fancy1') {
                                profit_type =
                                    ItemBetList.isBack == true && parseInt(result) == 1 ? 'profit' : profit_type;
                                profit_type =
                                    ItemBetList.isBack == false && parseInt(result) == 0 ? 'profit' : profit_type;
                            }
                            if (profit_type == 'profit') {
                                if (ItemBetList.gtype === 'fancy1') {
                                    profitLossAmt = ItemBetList.isBack
                                        ? ItemBetList.odds * ItemBetList.stack - ItemBetList.stack
                                        : ItemBetList.stack;
                                }
                                else {
                                    profitLossAmt = ItemBetList.isBack
                                        ? (parseFloat(ItemBetList.volume) * parseFloat(ItemBetList.stack)) / 100
                                        : ItemBetList.stack;
                                }
                            }
                            else if (profit_type == 'loss') {
                                if (ItemBetList.gtype === 'fancy1') {
                                    profitLossAmt = ItemBetList.isBack
                                        ? -ItemBetList.stack
                                        : -1 * (ItemBetList.odds * ItemBetList.stack - ItemBetList.stack);
                                }
                                else {
                                    profitLossAmt = ItemBetList.isBack
                                        ? -ItemBetList.stack
                                        : -(parseFloat(ItemBetList.volume) * parseFloat(ItemBetList.stack)) / 100;
                                }
                            }
                            let type_string = ItemBetList.isBack ? 'Yes' : 'No';
                            let narration = ItemBetList.matchName +
                                ' / ' +
                                ItemBetList.selectionName +
                                ' / ' +
                                type_string +
                                ' / ' +
                                result;
                            yield this.addprofitlosstouser({
                                userId: ObjectId(Item._id),
                                bet_id: ObjectId(ItemBetList._id),
                                profit_loss: profitLossAmt,
                                matchId,
                                narration,
                                sportsType: ItemBetList.sportId,
                                selectionId: ItemBetList.selectionId,
                                sportId: ItemBetList.sportId,
                            });
                            if (indexBetList == 0) {
                                ItemBetList.ratioStr.allRatio.map((ItemParentStr) => {
                                    parentIdList.push(ItemParentStr.parent);
                                    userIdList.push(ObjectId(ItemParentStr.parent));
                                });
                            }
                            user_socket_1.default.betDelete({ betId: ItemBetList._id, userId: ItemBetList.userId });
                        }));
                        yield Promise.all(settle_single);
                        userIdList.push(ObjectId(Item._id));
                    }));
                    yield Promise.all(declare_result);
                    yield Bet_1.Bet.updateMany({
                        userId: { $in: userIdList },
                        matchId: matchId,
                        selectionId: marketId,
                        bet_on: Bet_1.BetOn.FANCY,
                    }, { $set: { status: 'completed' } });
                    const unique = [...new Set(userIdList)];
                    if (unique.length > 0) {
                        yield this.updateUserAccountStatement(unique, parentIdList);
                    }
                    yield Fancy_1.Fancy.updateOne({ matchId: parseInt(matchId), marketId: marketId }, { $set: { result: result, status: 'completed' } });
                }));
                yield Promise.all(dataPromise);
                return true;
            }
            catch (e) {
                return false;
            }
        });
        this.updateUserBal = (userId, parentIdList) => __awaiter(this, void 0, void 0, function* () {
            const ac = yield AccountStatement_1.AccoutStatement.aggregate([
                { $match: { userId: mongoose_1.Types.ObjectId(userId) } },
                {
                    $group: {
                        _id: null,
                        totalAmount: { $sum: '$amount' },
                    },
                },
            ]);
            const parent = yield User_1.User.findOne({
                parentStr: { $elemMatch: { $eq: mongoose_1.Types.ObjectId(userId) } },
                role: Role_1.RoleType.user,
            }, { _id: 1 })
                .distinct('_id')
                .lean();
            if (parentIdList.indexOf(userId) == -1) {
                parent.push(userId);
            }
            const pnl = yield AccountStatement_1.AccoutStatement.aggregate([
                { $match: { userId: { $in: parent }, betId: { $ne: null } } },
                {
                    $group: {
                        _id: null,
                        totalAmount: { $sum: '$amount' },
                    },
                },
            ]);
            const withdrawlsum = yield AccountStatement_1.AccoutStatement.aggregate([
                {
                    $match: {
                        userId: mongoose_1.Types.ObjectId(userId),
                        betId: { $eq: null },
                        txnId: { $eq: null },
                        txnType: UserChip_1.TxnType.dr,
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalAmount: { $sum: '$amount' },
                    },
                },
            ]);
            const depositesum = yield AccountStatement_1.AccoutStatement.aggregate([
                {
                    $match: {
                        userId: mongoose_1.Types.ObjectId(userId),
                        betId: { $eq: null },
                        txnId: { $ne: null },
                        txnType: UserChip_1.TxnType.cr,
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalAmount: { $sum: '$amount' },
                    },
                },
            ]);
            const userCr = yield User_1.User.findOne({ _id: ObjectId(userId) }).select({ creditRefrences: 1 });
            const withdAmt = withdrawlsum && withdrawlsum.length > 0 ? withdrawlsum[0].totalAmount : 0;
            const depositeAmt = depositesum && depositesum.length > 0 ? depositesum[0].totalAmount : 0;
            const Balance_ = ac && ac.length > 0 ? ac[0].totalAmount : 0;
            const pnl_ = pnl && pnl.length > 0
                ? pnl[0].totalAmount +
                    withdAmt +
                    depositeAmt -
                    (userCr && userCr.creditRefrences ? parseInt(userCr.creditRefrences) : 0)
                : withdAmt +
                    depositeAmt -
                    (userCr && userCr.creditRefrences ? parseInt(userCr.creditRefrences) : 0);
            ////const bal = await Balance.findOne({ userId: userId }).select({ profitLoss: 1 })
            //// const pnl_ = bal?.profitLoss ? bal?.profitLoss : 0
            console.log(Balance_, pnl_, userCr, withdAmt, depositeAmt, Balance_1.Balance, "hello world my self rahul gandhi");
            return { Balance_, pnl_ };
        });
        this.declarematchresult = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { selectionId, matchId } = req.query;
                const userbet = yield Bet_1.Bet.aggregate([
                    {
                        $match: {
                            status: 'pending',
                            bet_on: Bet_1.BetOn.MATCH_ODDS,
                            matchId: parseInt(matchId),
                        },
                    },
                    {
                        $group: {
                            _id: '$userId',
                            allBets: { $push: '$$ROOT' },
                        },
                    },
                ]);
                let userIdList = [];
                const parentIdList = [];
                const declare_result = userbet.map((Item) => __awaiter(this, void 0, void 0, function* () {
                    let allbets = Item.allBets;
                    const settle_single = allbets.map((ItemBetList, indexBetList) => __awaiter(this, void 0, void 0, function* () {
                        let profit_type = 'loss';
                        if (parseInt(selectionId) == ItemBetList.selectionId) {
                            profit_type = ItemBetList.isBack == true ? 'profit' : profit_type;
                        }
                        else {
                            profit_type = ItemBetList.isBack == true ? profit_type : 'profit';
                        }
                        let profitLossAmt = 0;
                        if (ItemBetList.isBack) {
                            if (profit_type == 'profit') {
                                profitLossAmt =
                                    (parseFloat(ItemBetList.odds.toString()) - 1) *
                                        parseFloat(ItemBetList.stack.toString());
                            }
                            else if (profit_type == 'loss') {
                                profitLossAmt = parseFloat(ItemBetList.loss.toString());
                            }
                        }
                        else {
                            if (profit_type == 'profit') {
                                profitLossAmt = ItemBetList.stack;
                            }
                            else if (profit_type == 'loss') {
                                profitLossAmt = parseFloat(ItemBetList.loss.toString());
                            }
                        }
                        let type_string = ItemBetList.isBack ? 'Back' : 'Lay';
                        let narration = ItemBetList.matchName +
                            ' / ' +
                            ItemBetList.selectionName +
                            ' / ' +
                            type_string +
                            ' / ' +
                            selectionId;
                        yield this.addprofitlosstouser({
                            userId: ObjectId(Item._id),
                            bet_id: ObjectId(ItemBetList._id),
                            profit_loss: profitLossAmt,
                            matchId,
                            narration,
                            sportsType: ItemBetList.sportId,
                            selectionId: ItemBetList.selectionId,
                            sportId: ItemBetList.sportId,
                        });
                        if (indexBetList == 0) {
                            ItemBetList.ratioStr.allRatio.map((ItemParentStr) => {
                                parentIdList.push(ItemParentStr.parent);
                                userIdList.push(ObjectId(ItemParentStr.parent));
                            });
                        }
                    }));
                    yield Promise.all(settle_single);
                    userIdList.push(ObjectId(Item._id));
                }));
                yield Promise.all(declare_result);
                yield Bet_1.Bet.updateMany({
                    userId: { $in: userIdList },
                    matchId: matchId,
                    bet_on: Bet_1.BetOn.MATCH_ODDS,
                }, { $set: { status: 'completed' } });
                const unique = [...new Set(userIdList)];
                if (unique.length > 0) {
                    yield this.updateUserAccountStatement(unique, parentIdList);
                }
                yield Match_1.Match.updateOne({ matchId: parseInt(matchId) }, { $set: { result_delare: true, result: selectionId } });
                return this.success(res, userbet, '');
            }
            catch (e) {
                return this.fail(res, e);
            }
        });
        this.declaremarketresult = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { selectionId, matchId, marketId } = req.query;
                const userbet = yield Bet_1.Bet.aggregate([
                    {
                        $match: {
                            status: 'pending',
                            bet_on: Bet_1.BetOn.MATCH_ODDS,
                            matchId: parseInt(matchId),
                            marketId: marketId,
                        },
                    },
                    {
                        $group: {
                            _id: '$userId',
                            allBets: { $push: '$$ROOT' },
                        },
                    },
                ]);
                let userIdList = [];
                const parentIdList = [];
                const declare_result = userbet.map((Item) => __awaiter(this, void 0, void 0, function* () {
                    let allbets = Item.allBets;
                    const settle_single = allbets.map((ItemBetList, indexBetList) => __awaiter(this, void 0, void 0, function* () {
                        let profit_type = 'loss';
                        if (parseInt(selectionId) == ItemBetList.selectionId) {
                            profit_type = ItemBetList.isBack == true ? 'profit' : profit_type;
                        }
                        else {
                            profit_type = ItemBetList.isBack == true ? profit_type : 'profit';
                        }
                        let profitLossAmt = 0;
                        if (ItemBetList.isBack) {
                            if (profit_type == 'profit') {
                                profitLossAmt =
                                    (parseFloat(ItemBetList.odds.toString()) - 1) *
                                        parseFloat(ItemBetList.stack.toString());
                            }
                            else if (profit_type == 'loss') {
                                profitLossAmt = parseFloat(ItemBetList.loss.toString());
                            }
                        }
                        else {
                            if (profit_type == 'profit') {
                                profitLossAmt = ItemBetList.stack;
                            }
                            else if (profit_type == 'loss') {
                                profitLossAmt = parseFloat(ItemBetList.loss.toString());
                            }
                        }
                        if (selectionId == -1) {
                            profitLossAmt = 0;
                        }
                        let type_string = ItemBetList.isBack ? 'Back' : 'Lay';
                        let narration = ItemBetList.matchName +
                            ' / ' +
                            ItemBetList.selectionName +
                            ' / ' +
                            type_string +
                            ' / ' +
                            (selectionId == -1 ? 'Abandoned' : selectionId);
                        yield this.addprofitlosstouser({
                            userId: ObjectId(Item._id),
                            bet_id: ObjectId(ItemBetList._id),
                            profit_loss: profitLossAmt,
                            matchId,
                            narration,
                            sportsType: ItemBetList.sportId,
                            selectionId: ItemBetList.selectionId,
                            sportId: ItemBetList.sportId,
                        });
                        if (indexBetList == 0) {
                            ItemBetList.ratioStr.allRatio.map((ItemParentStr) => {
                                parentIdList.push(ItemParentStr.parent);
                                userIdList.push(ObjectId(ItemParentStr.parent));
                            });
                        }
                    }));
                    yield Promise.all(settle_single);
                    userIdList.push(ObjectId(Item._id));
                }));
                yield Promise.all(declare_result);
                yield Bet_1.Bet.updateMany({
                    userId: { $in: userIdList },
                    matchId: matchId,
                    bet_on: Bet_1.BetOn.MATCH_ODDS,
                    marketId: marketId,
                }, { $set: { status: 'completed' } });
                const unique = [...new Set(userIdList)];
                if (unique.length > 0) {
                    yield this.updateUserAccountStatement(unique, parentIdList);
                }
                yield Match_1.Match.updateOne({ matchId: parseInt(matchId) }, { $set: { result_delare: true, result: selectionId } });
                yield Market_1.Market.updateOne({ marketId: marketId }, { $set: { resultDelcare: 'yes', result: selectionId } });
                return this.success(res, userbet, '');
            }
            catch (e) {
                return this.fail(res, e);
            }
        });
        this.declaremarketresultAuto = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { selectionId, matchId, marketId } = req.query;
                const userbet = yield Bet_1.Bet.aggregate([
                    {
                        $match: {
                            status: 'pending',
                            bet_on: Bet_1.BetOn.MATCH_ODDS,
                            matchId: parseInt(matchId),
                            marketId: marketId,
                        },
                    },
                    {
                        $group: {
                            _id: '$userId',
                            allBets: { $push: '$$ROOT' },
                        },
                    },
                ]);
                let userIdList = [];
                const parentIdList = [];
                const declare_result = userbet.map((Item) => __awaiter(this, void 0, void 0, function* () {
                    let allbets = Item.allBets;
                    const settle_single = allbets.map((ItemBetList, indexBetList) => __awaiter(this, void 0, void 0, function* () {
                        let profit_type = 'loss';
                        if (parseInt(selectionId) == ItemBetList.selectionId) {
                            profit_type = ItemBetList.isBack == true ? 'profit' : profit_type;
                        }
                        else {
                            profit_type = ItemBetList.isBack == true ? profit_type : 'profit';
                        }
                        let profitLossAmt = 0;
                        if (ItemBetList.isBack) {
                            if (profit_type == 'profit') {
                                profitLossAmt =
                                    (parseFloat(ItemBetList.odds.toString()) - 1) *
                                        parseFloat(ItemBetList.stack.toString());
                            }
                            else if (profit_type == 'loss') {
                                profitLossAmt = parseFloat(ItemBetList.loss.toString());
                            }
                        }
                        else {
                            if (profit_type == 'profit') {
                                profitLossAmt = ItemBetList.stack;
                            }
                            else if (profit_type == 'loss') {
                                profitLossAmt = parseFloat(ItemBetList.loss.toString());
                            }
                        }
                        if (selectionId == -1) {
                            profitLossAmt = 0;
                        }
                        let type_string = ItemBetList.isBack ? 'Back' : 'Lay';
                        let narration = ItemBetList.matchName +
                            ' / ' +
                            ItemBetList.selectionName +
                            ' / ' +
                            type_string +
                            ' / ' +
                            (selectionId == -1 ? 'Abandoned' : selectionId);
                        yield this.addprofitlosstouser({
                            userId: ObjectId(Item._id),
                            bet_id: ObjectId(ItemBetList._id),
                            profit_loss: profitLossAmt,
                            matchId,
                            narration,
                            sportsType: ItemBetList.sportId,
                            selectionId: ItemBetList.selectionId,
                            sportId: ItemBetList.sportId,
                        });
                        if (indexBetList == 0) {
                            ItemBetList.ratioStr.allRatio.map((ItemParentStr) => {
                                parentIdList.push(ItemParentStr.parent);
                                userIdList.push(ObjectId(ItemParentStr.parent));
                            });
                        }
                        user_socket_1.default.betDelete({ betId: ItemBetList._id, userId: ItemBetList.userId });
                    }));
                    yield Promise.all(settle_single);
                    userIdList.push(ObjectId(Item._id));
                }));
                yield Promise.all(declare_result);
                yield Bet_1.Bet.updateMany({
                    userId: { $in: userIdList },
                    matchId: matchId,
                    bet_on: Bet_1.BetOn.MATCH_ODDS,
                    marketId: marketId,
                }, { $set: { status: 'completed' } });
                const unique = [...new Set(userIdList)];
                if (unique.length > 0) {
                    yield this.updateUserAccountStatement(unique, parentIdList);
                }
                yield Market_1.Market.updateOne({ marketId: marketId }, { $set: { resultDelcare: 'yes', result: selectionId, isActive: false } });
                return this.success(res, userbet, '');
            }
            catch (e) {
                return this.fail(res, e);
            }
        });
        this.rollbackmarketresult = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { matchId } = req.query;
                const userbet = yield Bet_1.Bet.aggregate([
                    {
                        $match: {
                            status: 'completed',
                            bet_on: Bet_1.BetOn.MATCH_ODDS,
                            matchId: parseInt(matchId),
                        },
                    },
                    {
                        $group: {
                            _id: '$userId',
                            allBets: { $push: '$$ROOT' },
                        },
                    },
                ]);
                let userIdList = [];
                const parentIdList = [];
                const declare_result = userbet.map((Item) => __awaiter(this, void 0, void 0, function* () {
                    let allbets = Item.allBets;
                    const settle_single = allbets.map((ItemBetList, indexBetList) => __awaiter(this, void 0, void 0, function* () {
                        yield AccountStatement_1.AccoutStatement.deleteMany({ betId: ObjectId(ItemBetList._id) });
                        if (indexBetList == 0) {
                            ItemBetList.ratioStr.allRatio.map((ItemParentStr) => {
                                parentIdList.push(ItemParentStr.parent);
                                userIdList.push(ObjectId(ItemParentStr.parent));
                            });
                        }
                    }));
                    yield Promise.all(settle_single);
                    userIdList.push(ObjectId(Item._id));
                }));
                yield Promise.all(declare_result);
                yield Bet_1.Bet.updateMany({
                    userId: { $in: userIdList },
                    matchId: matchId,
                    bet_on: Bet_1.BetOn.MATCH_ODDS,
                }, { $set: { status: 'pending' } });
                const unique = [...new Set(userIdList)];
                if (unique.length > 0) {
                    yield this.updateUserAccountStatement(unique, parentIdList);
                }
                yield Match_1.Match.updateOne({ matchId: parseInt(matchId) }, { $set: { result_delare: false, result: '' } });
                yield Market_1.Market.updateOne({ matchId: parseInt(matchId) }, { $set: { resultDelcare: 'no' } });
                return this.success(res, userbet, '');
            }
            catch (e) {
                return this.fail(res, e);
            }
        });
        /// market wise karna h
        this.rollbackmarketwiseresult = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { matchId, marketId } = req.query;
                const userbet = yield Bet_1.Bet.aggregate([
                    {
                        $match: {
                            status: 'completed',
                            bet_on: Bet_1.BetOn.MATCH_ODDS,
                            matchId: parseInt(matchId),
                            marketId: marketId,
                        },
                    },
                    {
                        $group: {
                            _id: '$userId',
                            allBets: { $push: '$$ROOT' },
                        },
                    },
                ]);
                let userIdList = [];
                const parentIdList = [];
                const declare_result = userbet.map((Item) => __awaiter(this, void 0, void 0, function* () {
                    let allbets = Item.allBets;
                    const settle_single = allbets.map((ItemBetList, indexBetList) => __awaiter(this, void 0, void 0, function* () {
                        yield AccountStatement_1.AccoutStatement.deleteMany({ betId: ObjectId(ItemBetList._id) });
                        if (indexBetList == 0) {
                            ItemBetList.ratioStr.allRatio.map((ItemParentStr) => {
                                parentIdList.push(ItemParentStr.parent);
                                userIdList.push(ObjectId(ItemParentStr.parent));
                            });
                        }
                    }));
                    yield Promise.all(settle_single);
                    userIdList.push(ObjectId(Item._id));
                }));
                yield Promise.all(declare_result);
                yield Bet_1.Bet.updateMany({
                    userId: { $in: userIdList },
                    matchId: matchId,
                    bet_on: Bet_1.BetOn.MATCH_ODDS,
                    marketId: marketId,
                }, { $set: { status: 'pending' } });
                const unique = [...new Set(userIdList)];
                if (unique.length > 0) {
                    yield this.updateUserAccountStatement(unique, parentIdList);
                }
                yield Market_1.Market.updateOne({ marketId: marketId }, { $set: { resultDelcare: 'no' } });
                return this.success(res, userbet, '');
            }
            catch (e) {
                return this.fail(res, e);
            }
        });
        this.addprofitlosstouser = ({ userId, bet_id, profit_loss, matchId, narration, sportsType, selectionId, sportId, }) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            const user = yield User_1.User.findOne({ _id: userId });
            const user_parent = yield User_1.User.findOne({ _id: user === null || user === void 0 ? void 0 : user.parentId });
            const parent_ratio = sportId == 5000
                ? (_b = (_a = user_parent === null || user_parent === void 0 ? void 0 : user_parent.partnership) === null || _a === void 0 ? void 0 : _a[4]) === null || _b === void 0 ? void 0 : _b.allRatio
                : (_d = (_c = user_parent === null || user_parent === void 0 ? void 0 : user_parent.partnership) === null || _c === void 0 ? void 0 : _c[sportsType]) === null || _d === void 0 ? void 0 : _d.allRatio;
            const reference_id = yield this.sendcreditdebit(userId, narration, profit_loss, matchId, bet_id, selectionId, sportId);
            const updateplToBet = yield Bet_1.Bet.updateOne({ _id: bet_id }, { $set: { profitLoss: profit_loss } });
            if (parent_ratio && parent_ratio.length > 0) {
                const accountforparent = parent_ratio.map((Item) => __awaiter(this, void 0, void 0, function* () {
                    let pl = (Math.abs(profit_loss) * Item.ratio) / 100;
                    const final_amount = profit_loss > 0 ? -pl : pl;
                    yield this.sendcreditdebit(Item.parent, narration, final_amount, matchId, bet_id, selectionId, sportId);
                }));
                yield Promise.all(accountforparent);
            }
        });
        this.sendcreditdebit = (userId, narration, profit_loss, matchId, betId, selectionId, sportId) => __awaiter(this, void 0, void 0, function* () {
            const getAccStmt = yield AccountStatement_1.AccoutStatement.findOne({ userId: userId })
                .sort({ createdAt: -1 })
                .lean();
            const getOpenBal = (getAccStmt === null || getAccStmt === void 0 ? void 0 : getAccStmt.closeBal) ? getAccStmt.closeBal : 0;
            const userAccountData = {
                userId,
                narration: narration,
                amount: profit_loss,
                type: AccountStatement_1.ChipsType.pnl,
                txnType: profit_loss > 0 ? UserChip_1.TxnType.cr : UserChip_1.TxnType.dr,
                openBal: getOpenBal,
                closeBal: getOpenBal + +profit_loss,
                matchId: matchId,
                betId: betId,
                selectionId,
                sportId,
            };
            const entryCheck = yield AccountStatement_1.AccoutStatement.findOne({
                txnType: profit_loss > 0 ? UserChip_1.TxnType.cr : UserChip_1.TxnType.dr,
                betId: betId,
                userId: userId,
            });
            console.log(userAccountData, "User ammout  statllement");
            if (!entryCheck) {
                const newUserAccStmt = new AccountStatement_1.AccoutStatement(userAccountData);
                yield newUserAccStmt.save();
                if (newUserAccStmt._id !== undefined && newUserAccStmt._id !== null) {
                    return newUserAccStmt._id;
                }
                else {
                    return null;
                }
            }
            else {
                return entryCheck._id;
            }
        });
        this.updateaccountstatement = (userId, betid) => __awaiter(this, void 0, void 0, function* () { });
        this.apiupdateUserBal = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { userId } = req.body;
            const userInfo = yield User_1.User.findOne({ _id: ObjectId(userId) });
            const ac = yield AccountStatement_1.AccoutStatement.aggregate([
                { $match: { userId: mongoose_1.Types.ObjectId(userId) } },
                {
                    $group: {
                        _id: null,
                        totalAmount: { $sum: '$amount' },
                    },
                },
            ]);
            const parent = yield User_1.User.findOne({
                parentStr: { $elemMatch: { $eq: mongoose_1.Types.ObjectId(userId) } },
                role: Role_1.RoleType.user,
            }, { _id: 1 })
                .distinct('_id')
                .lean();
            if ((userInfo === null || userInfo === void 0 ? void 0 : userInfo.role) == Role_1.RoleType.user) {
                parent.push(ObjectId(userId));
            }
            const pnl = yield AccountStatement_1.AccoutStatement.aggregate([
                { $match: { userId: { $in: parent }, betId: { $ne: null } } },
                {
                    $group: {
                        _id: null,
                        totalAmount: { $sum: '$amount' },
                    },
                },
            ]);
            const withdrawlsum = yield AccountStatement_1.AccoutStatement.aggregate([
                {
                    $match: {
                        userId: mongoose_1.Types.ObjectId(userId),
                        betId: { $eq: null },
                        txnId: { $eq: null },
                        txnType: UserChip_1.TxnType.dr,
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalAmount: { $sum: '$amount' },
                    },
                },
            ]);
            const depositesum = yield AccountStatement_1.AccoutStatement.aggregate([
                {
                    $match: {
                        userId: mongoose_1.Types.ObjectId(userId),
                        betId: { $eq: null },
                        txnId: { $ne: null },
                        txnType: UserChip_1.TxnType.cr,
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalAmount: { $sum: '$amount' },
                    },
                },
            ]);
            const userCr = yield User_1.User.findOne({ _id: ObjectId(userId) }).select({ creditRefrences: 1 });
            const withdAmt = withdrawlsum && withdrawlsum.length > 0 ? withdrawlsum[0].totalAmount : 0;
            const depositeAmt = depositesum && depositesum.length > 0 ? depositesum[0].totalAmount : 0;
            const Balance_ = ac && ac.length > 0 ? ac[0].totalAmount : 0;
            const pnl_ = pnl && pnl.length > 0
                ? pnl[0].totalAmount +
                    withdAmt +
                    depositeAmt -
                    (userCr && userCr.creditRefrences ? parseInt(userCr.creditRefrences) : 0)
                : 0;
            ////const bal = await Balance.findOne({ userId: userId }).select({ profitLoss: 1 })
            //// const pnl_ = bal?.profitLoss ? bal?.profitLoss : 0
            return this.success(res, { Balance_, pnl_, depositesum, withdrawlsum, pnl }, '');
        });
        this.getCasPlayUrl = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { lobby_url, isMobile, ipAddress } = req.body;
            const userInfo = req.user;
            const gameInfo = yield CasCasino_1.CasCasino.findOne({
                game_identifier: lobby_url,
            });
            if (gameInfo) {
                const payload = {
                    user: userInfo.username,
                    token: 'NOt_AVIALBEL',
                    partner_id: 'NOt_AVIALBEL',
                    platform: isMobile ? 'GPL_MOBILE' : "GPL_DESKTOP",
                    lobby_url: lobby_url,
                    lang: 'en',
                    ip: ipAddress,
                    game_id: lobby_url,
                    game_code: lobby_url,
                    currency: 'INR',
                    id: userInfo._id,
                    balance: '0.00',
                };
                console.log(JSON.stringify(payload));
                return axios_1.default
                    .post('PROVIDER_URL', payload)
                    .then((resData) => {
                    var _a;
                    const data = resData === null || resData === void 0 ? void 0 : resData.data;
                    if ((data === null || data === void 0 ? void 0 : data.message) != "failed") {
                        this.success(res, { gameInfo: gameInfo, payload: payload, url: (_a = resData === null || resData === void 0 ? void 0 : resData.data) === null || _a === void 0 ? void 0 : _a.url }, 'Data Found');
                    }
                    else {
                        this.fail(res, "Game Not Found");
                    }
                });
            }
            else {
                this.fail(res, "Game Not Found");
            }
        });
    }
}
exports.FancyController = FancyController;
//# sourceMappingURL=FancyController.js.map