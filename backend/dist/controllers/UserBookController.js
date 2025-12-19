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
exports.UserBookController = void 0;
const ApiController_1 = require("./ApiController");
const Bet_1 = require("../models/Bet");
const User_1 = require("../models/User");
const Role_1 = require("../models/Role");
const Market_1 = require("../models/Market");
const Balance_1 = require("../models/Balance");
var ObjectId = require('mongoose').Types.ObjectId;
class UserBookController extends ApiController_1.ApiController {
    constructor() {
        super(...arguments);
        this.getfancybook = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const user = req.user;
            const body = req.body;
            const userChilds = yield User_1.User.find({ parentStr: { $elemMatch: { $eq: ObjectId(user._id) } }, role: Role_1.RoleType.user }, { _id: 1 });
            const useridmap = [];
            userChilds.map((Item) => useridmap.push(ObjectId(Item._id)));
            useridmap.push(user._id);
            const matchfilter = {
                matchId: parseInt(body.matchId),
                selectionId: parseInt(body.selectionId),
                userId: { $in: useridmap },
                status: 'pending',
            };
            const betlist = yield Bet_1.Bet.find(matchfilter, { odds: 1, pnl: 1, loss: 1, isBack: 1 }).lean();
            let minOdds = 0;
            let maxOdds = 0;
            const promiseminmax = betlist.map((item1, index) => {
                if (index === 0) {
                    minOdds = parseInt(item1.odds);
                    maxOdds = parseInt(item1.odds);
                }
                else {
                    minOdds = parseInt(item1.odds) < minOdds ? parseInt(item1.odds) : minOdds;
                    maxOdds = parseInt(item1.odds) > maxOdds ? parseInt(item1.odds) : maxOdds;
                }
            });
            yield Promise.all(promiseminmax);
            minOdds = minOdds - 1 >= 0 ? minOdds - 1 : 0;
            maxOdds = maxOdds + 1;
            let new_showdata = {};
            const promiseposition = betlist.map((item1, index) => {
                if (!item1.isBack) {
                    for (let i = minOdds; i <= maxOdds; i++) {
                        if (new_showdata[i] == undefined) {
                            new_showdata[i] = 0;
                        }
                        if (i < item1.odds) {
                            new_showdata[i] = new_showdata[i] + +item1.pnl;
                        }
                        else {
                            new_showdata[i] = new_showdata[i] + +item1.loss;
                        }
                    }
                }
                else {
                    for (let i = minOdds; i <= maxOdds; i++) {
                        if (new_showdata[i] == undefined) {
                            new_showdata[i] = 0;
                        }
                        if (i >= item1.odds) {
                            new_showdata[i] = new_showdata[i] + +item1.pnl;
                        }
                        else {
                            new_showdata[i] = new_showdata[i] + +item1.loss;
                        }
                    }
                }
            });
            yield Promise.all(promiseposition);
            return this.success(res, Object.assign({}, new_showdata));
        });
        this.getmarketanalysis = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const user = req.user;
            // {parentStr:{"$elemMatch": { "$eq":ObjectId(user._id)}}}
            const userChilds = yield User_1.User.find({ parentStr: { $elemMatch: { $eq: ObjectId(user._id) } }, role: Role_1.RoleType.user }, { _id: 1 });
            const useridmap = [];
            userChilds.map((Item) => useridmap.push(ObjectId(Item._id)));
            const matchfilter = {
                $match: {
                    bet_on: { $in: [Bet_1.BetOn.MATCH_ODDS, Bet_1.BetOn.FANCY] },
                    userId: { $in: useridmap },
                    status: 'pending',
                },
            };
            const groupfilter = {
                $group: {
                    _id: '$matchId',
                    betCount: { $sum: 1 },
                    matchName: { $first: '$matchName' },
                    allBets: {
                        $push: {
                            userId: '$userId',
                            odds: '$odds',
                            stack: '$stack',
                            bet_on: '$bet_on',
                            isBack: '$isBack',
                            selectionName: '$selectionName',
                            marketId: '$marketId',
                            selectionId: '$selectionId',
                            ratioStr: '$ratioStr',
                        },
                    },
                },
            };
            const betlist = yield Bet_1.Bet.aggregate([matchfilter, groupfilter]);
            let filterMatchId = [];
            betlist.map((ItemMatch) => {
                filterMatchId.push(parseInt(ItemMatch._id));
            });
            const marketlist = yield Market_1.Market.find({ matchId: { $in: filterMatchId } }, { marketId: 1, matchId: 1, marketName: 1, runners: 1 });
            let completeBookList = [];
            const bookpromise = betlist.map((Item) => __awaiter(this, void 0, void 0, function* () {
                let matchPl = { matchName: Item.matchName, betCount: Item.betCount, matchId: Item._id };
                let matchWiseMarket = {};
                let completemarket_list = [];
                const filterMarketByMatch = marketlist.filter((ItemMarket) => {
                    return ItemMarket.matchId == Item._id;
                });
                const filterMarketByMatchPromise = filterMarketByMatch.map((ItemMarketListNew) => __awaiter(this, void 0, void 0, function* () {
                    const filterBetlist = Item.allBets.filter((ItemBetsFilter) => {
                        return ItemBetsFilter.marketId == ItemMarketListNew.marketId;
                    });
                    if (filterBetlist.length > 0) {
                        completemarket_list.push(ItemMarketListNew.marketId);
                    }
                    const betPromise = filterBetlist.map((ItemBet) => __awaiter(this, void 0, void 0, function* () {
                        const allRatio = ItemBet.ratioStr.allRatio;
                        const filterSelfRatio = allRatio.filter((ItemN) => ItemN.parent.toString() == user._id)[0];
                        if (filterSelfRatio != undefined) {
                            let parentRatio = filterSelfRatio.ratio;
                            let getOdds = ItemBet.odds;
                            let lossAmt = ItemBet.stack * (parentRatio / 100);
                            let profitAmt = (getOdds - 1) * lossAmt * (parentRatio / 100);
                            const filterMarket = filterMarketByMatch.filter((ItemMarket) => {
                                return ItemMarket.marketId == ItemBet.marketId;
                            });
                            const promiseMarket = filterMarket.map((ItemMarketList) => __awaiter(this, void 0, void 0, function* () {
                                ItemMarketList.runners.map((ItemRunners) => {
                                    let selectionId = ItemRunners.selectionId;
                                    if (!matchWiseMarket[ItemMarketList.marketId + '_' + selectionId]) {
                                        matchWiseMarket[ItemMarketList.marketId + '_' + selectionId] = 0;
                                    }
                                    if (selectionId == ItemBet.selectionId) {
                                        if (ItemBet.isBack) {
                                            matchWiseMarket[ItemMarketList.marketId + '_' + selectionId] =
                                                matchWiseMarket[ItemMarketList.marketId + '_' + selectionId] + profitAmt;
                                        }
                                        else {
                                            matchWiseMarket[ItemMarketList.marketId + '_' + selectionId] =
                                                matchWiseMarket[ItemMarketList.marketId + '_' + selectionId] - profitAmt;
                                        }
                                    }
                                    else {
                                        if (ItemBet.isBack) {
                                            matchWiseMarket[ItemMarketList.marketId + '_' + selectionId] =
                                                matchWiseMarket[ItemMarketList.marketId + '_' + selectionId] - lossAmt;
                                        }
                                        else {
                                            matchWiseMarket[ItemMarketList.marketId + '_' + selectionId] =
                                                matchWiseMarket[ItemMarketList.marketId + '_' + selectionId] + lossAmt;
                                        }
                                    }
                                });
                            }));
                            yield Promise.all(promiseMarket);
                        }
                    }));
                    yield Promise.all(betPromise);
                }));
                yield Promise.all(filterMarketByMatchPromise);
                matchPl = Object.assign(Object.assign({}, matchPl), {
                    matchWiseMarket: matchWiseMarket,
                    filterMarketByMatch: filterMarketByMatch,
                    completemarket_list: completemarket_list,
                });
                completeBookList.push(matchPl);
            }));
            yield Promise.all(bookpromise);
            return this.success(res, completeBookList);
        });
        this.getuserbook = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const user = req.user;
            const currentUser = yield User_1.User.findOne({ _id: ObjectId(user._id) });
            const currentBalance = yield Balance_1.Balance.findOne({ userId: ObjectId(user._id) });
            const ratio = currentUser.partnership[4].allRatio.filter((Item) => Item.parent == user._id.toString())[0].ratio;
            const currentpartnership = parseInt(ratio);
            const select = {
                _id: 1,
                username: 1,
                parentId: 1,
                role: 1,
                creditRefrences: 1,
                'balance.balance': 1,
                'balance.exposer': 1,
                'balance.profitLoss': 1,
            };
            const aggregateFilter = [
                {
                    $lookup: {
                        from: 'balances',
                        localField: '_id',
                        foreignField: 'userId',
                        as: 'balance',
                    },
                },
                {
                    $unwind: '$balance',
                },
                {
                    $project: select,
                },
            ];
            const users = yield User_1.User.aggregate([
                {
                    $match: {
                        parentId: user === null || user === void 0 ? void 0 : user._id,
                        parentStr: { $elemMatch: { $eq: ObjectId(user._id) } },
                    },
                },
                ...aggregateFilter,
            ]);
            const currentcredit = parseInt(currentUser.creditRefrences);
            const currentbalance = parseFloat(currentBalance.balance);
            const currentpl = parseFloat(currentBalance.profitLoss);
            let clientData = {
                uplevelcr: currentcredit,
                totalmasterb: 0,
                availableB: 0,
                downlineob: 0,
                upperlvell: 0,
                avpl: 0,
                downcr: 0,
                downpl: 0,
                mypl: 0,
            };
            let totalmasterb = 0;
            let availableB = 0;
            let downcr = 0;
            let upperlvell = 0;
            let downbalance = 0;
            let availableBalancepl = 0;
            let downlevelpl = 0;
            let totalexposer = 0;
            const calculatepl = users.map((Item) => {
                var _a, _b, _c;
                const selflevelcredit = parseInt(Item.creditRefrences);
                const balance = ((_a = Item.balance) === null || _a === void 0 ? void 0 : _a.balance) || 0;
                const exposer = ((_b = Item.balance) === null || _b === void 0 ? void 0 : _b.exposer) || 0;
                const clientpl = ((_c = Item.balance) === null || _c === void 0 ? void 0 : _c.profitLoss) || 0;
                ///upperlvell += -(balance - selflevelcredit)
                ///totalmasterb = (balance - selflevelcredit) + currentcredit
                downcr = downcr + +selflevelcredit;
                downbalance = downbalance + +(selflevelcredit + +clientpl);
                availableBalancepl += balance - exposer;
                totalexposer += exposer;
                downlevelpl += clientpl;
            });
            Promise.all(calculatepl);
            availableB = currentbalance;
            upperlvell = -currentpl;
            totalmasterb = currentcredit + +currentpl;
            const downlineob = downbalance;
            /// const upperlvell = parentuser.creditRefrences - totalmasterb;
            /// const avpl = availableBalancepl;
            const avpl = availableB;
            const downpl = -downlevelpl;
            const mypl = (downpl * currentpartnership) / 100;
            clientData = Object.assign(Object.assign({}, clientData), { totalmasterb, availableB, downlineob, upperlvell, avpl, downcr, downpl, mypl });
            return this.success(res, clientData);
        });
        this.getFinalSuperParentId = (parentId, parentStr) => __awaiter(this, void 0, void 0, function* () {
            return "";
        });
        this.getUserWiseBook = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const user = req.user;
            const body = req.body;
            const firstUserChilds = yield User_1.User.find({ parentId: ObjectId(user._id) }, { _id: 1, username: 1, role: 1 }).lean();
            const finaluserdata = [];
            let userLink = {};
            let completeBookList = [];
            const filterMarketByMatch = yield Market_1.Market.find({ matchId: body.matchId, marketId: body.selectionId }, { marketId: 1, matchId: 1, marketName: 1, runners: 1 });
            const userPromise = firstUserChilds.map((ItemUser) => __awaiter(this, void 0, void 0, function* () {
                const useridmap = [];
                let selfUserId = [];
                if (ItemUser.role == Role_1.RoleType.user) {
                    useridmap.push(ObjectId(ItemUser._id));
                    selfUserId.push(ObjectId(ItemUser._id));
                    userLink[ItemUser._id] = ItemUser._id;
                }
                else {
                    const userChilds = yield User_1.User.find({ parentStr: { $elemMatch: { $eq: ObjectId(ItemUser._id) } }, role: Role_1.RoleType.user }, { _id: 1, parentId: 1, parentStr: 1 }).lean();
                    userChilds.map((ItemN) => {
                        useridmap.push(ObjectId(ItemN._id));
                        selfUserId.push(ObjectId(ItemN._id));
                        userLink[ItemN._id] = ItemUser._id;
                    });
                }
                ItemUser = Object.assign(Object.assign({}, ItemUser), { child: selfUserId });
                console.log(finaluserdata, "finaluserdata");
                const matchfilter = {
                    $match: {
                        bet_on: Bet_1.BetOn.MATCH_ODDS,
                        userId: { $in: useridmap },
                        status: 'pending',
                        matchId: body.matchId,
                        marketId: body.selectionId,
                    },
                };
                const groupfilter = {
                    $group: {
                        _id: '$marketId',
                        betCount: { $sum: 1 },
                        userName: { $first: '$userName' },
                        matchName: { $first: '$matchName' },
                        matchId: { $first: '$matchId' },
                        allBets: {
                            $push: {
                                userId: '$userId',
                                odds: '$odds',
                                stack: '$stack',
                                bet_on: '$bet_on',
                                isBack: '$isBack',
                                selectionName: '$selectionName',
                                marketId: '$marketId',
                                selectionId: '$selectionId',
                                ratioStr: '$ratioStr',
                            },
                        },
                    },
                };
                const betlist = yield Bet_1.Bet.aggregate([matchfilter, groupfilter]);
                const bookpromise = betlist.map((Item) => __awaiter(this, void 0, void 0, function* () {
                    let matchPl = {
                        matchName: Item.matchName,
                        betCount: Item.betCount,
                        matchId: Item.matchId,
                        marketId: body.selectionId,
                    };
                    let matchWiseMarket = {};
                    let completemarket_list = [];
                    const filterMarketByMatchPromise = filterMarketByMatch.map((ItemMarketListNew) => __awaiter(this, void 0, void 0, function* () {
                        const filterBetlist = Item.allBets.filter((ItemBetsFilter) => {
                            return ItemBetsFilter.marketId == ItemMarketListNew.marketId;
                        });
                        if (filterBetlist.length > 0) {
                            completemarket_list.push(ItemMarketListNew.marketId);
                        }
                        const betPromise = filterBetlist.map((ItemBet) => __awaiter(this, void 0, void 0, function* () {
                            const allRatio = ItemBet.ratioStr.allRatio;
                            const filterSelfRatio = allRatio.filter((ItemN) => ItemN.parent.toString() == user._id)[0];
                            if (filterSelfRatio != undefined) {
                                let parentRatio = filterSelfRatio.ratio;
                                parentRatio = 100;
                                let getOdds = ItemBet.odds;
                                let lossAmt = ItemBet.stack * (parentRatio / 100);
                                let profitAmt = (getOdds - 1) * ItemBet.stack * (parentRatio / 100);
                                const filterMarket = filterMarketByMatch.filter((ItemMarket) => {
                                    return ItemMarket.marketId == ItemBet.marketId;
                                });
                                const promiseMarket = filterMarket.map((ItemMarketList) => __awaiter(this, void 0, void 0, function* () {
                                    ItemMarketList.runners.map((ItemRunners) => {
                                        let selectionId = ItemRunners.selectionId;
                                        if (!matchWiseMarket[ItemBet.userId]) {
                                            matchWiseMarket[ItemBet.userId] = {};
                                        }
                                        if (!matchWiseMarket[ItemMarketList.marketId + '_' + selectionId]) {
                                            matchWiseMarket[ItemMarketList.marketId + '_' + selectionId] = 0;
                                        }
                                        if (selectionId == ItemBet.selectionId) {
                                            if (ItemBet.isBack) {
                                                matchWiseMarket[ItemMarketList.marketId + '_' + selectionId] =
                                                    matchWiseMarket[ItemMarketList.marketId + '_' + selectionId] +
                                                        profitAmt;
                                            }
                                            else {
                                                matchWiseMarket[ItemMarketList.marketId + '_' + selectionId] =
                                                    matchWiseMarket[ItemMarketList.marketId + '_' + selectionId] -
                                                        profitAmt;
                                            }
                                        }
                                        else {
                                            if (ItemBet.isBack) {
                                                matchWiseMarket[ItemMarketList.marketId + '_' + selectionId] =
                                                    matchWiseMarket[ItemMarketList.marketId + '_' + selectionId] -
                                                        lossAmt;
                                            }
                                            else {
                                                matchWiseMarket[ItemMarketList.marketId + '_' + selectionId] =
                                                    matchWiseMarket[ItemMarketList.marketId + '_' + selectionId] +
                                                        lossAmt;
                                            }
                                        }
                                    });
                                }));
                                yield Promise.all(promiseMarket);
                            }
                        }));
                        yield Promise.all(betPromise);
                    }));
                    yield Promise.all(filterMarketByMatchPromise);
                    // const superParentId = userLink[Item._id]
                    let userInfo = { username: '', superParentId: ItemUser._id };
                    // if (superParentId != undefined) {
                    //   const filterSuperUser = finaluserdata.filter(
                    //     (ItemUserN: any) => ItemUserN._id == superParentId,
                    //   )
                    //   console.log(filterSuperUser, "filterSuperUser")
                    //   // if (filterSuperUser.length > 0) {
                    //   // }
                    // }
                    userInfo['username'] = ItemUser.username;
                    matchPl = Object.assign(Object.assign(Object.assign({}, matchPl), matchWiseMarket), userInfo);
                    completeBookList.push(matchPl);
                }));
                yield Promise.all(bookpromise);
                finaluserdata.push(ItemUser);
            }));
            yield Promise.all(userPromise);
            let dataset = [];
            const data = completeBookList.map((Item, index) => {
                if (dataset.length > 0) {
                    ///   const findIndex = dataset.filter((ItemMatch:any) => ItemMatch.matchId);
                }
                else {
                    dataset.push(Item);
                }
            });
            return this.success(res, {
                markets: filterMarketByMatch[0].runners,
                completeBookList: completeBookList,
            });
        });
    }
}
exports.UserBookController = UserBookController;
//# sourceMappingURL=UserBookController.js.map