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
exports.CasCallbackController = void 0;
const mongoose_1 = require("mongoose");
const Balance_1 = require("../models/Balance");
const User_1 = require("../models/User");
const ApiController_1 = require("./ApiController");
const FancyController_1 = require("./FancyController");
const CasCasino_1 = require("../models/CasCasino");
const user_socket_1 = __importDefault(require("../sockets/user-socket"));
const CasinoBet_1 = require("../models/CasinoBet");
const defaultRatio = {
    ownRatio: 100,
    allRatio: [
        {
            parent: mongoose_1.Types.ObjectId('63382d9bfbb3a573110c1ba5'),
            ratio: 100,
        },
    ],
};
class CasCallbackController extends ApiController_1.ApiController {
    constructor() {
        super(...arguments);
        this.getbalance = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId, partner_id } = req.body;
                if (partner_id != 'D48CJ9BTHT2NCT4XMZPY') {
                    return res.status(500).json({ bet_status: 'N', balance: '0.00', status: 'OP_FAILURE' });
                }
                const balance = yield Balance_1.Balance.findOne({ userId: mongoose_1.Types.ObjectId(userId) });
                if (balance) {
                    return res.status(200).json({
                        bet_status: "Y",
                        balance: (balance === null || balance === void 0 ? void 0 : balance.balance) - (balance === null || balance === void 0 ? void 0 : balance.exposer),
                        status: 'OP_SUCCESS',
                    });
                }
                else {
                    return res.status(500).json({
                        bet_status: 'N',
                        balance: 0,
                        status: 'OP_FAILURE',
                    });
                }
            }
            catch (e) {
                return res.status(500).json({
                    bet_status: 'N',
                    balance: 0,
                    status: 'OP_FAILURE',
                });
            }
        });
        this.getBetrequest = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { user, partnerKey, transactionData, gameData } = req.body;
                console.log(req.body, "req.body");
                if (partnerKey != 'D48CJ9BTHT2NCT4XMZPY') {
                    return res.status(500).json({
                        bet_status: "N",
                        balance: 0,
                        status: 'OP_FAILURE',
                    });
                }
                if (transactionData.amount < 0) {
                    return res.status(500).json({
                        bet_status: "N",
                        balance: 0,
                        status: 'OP_ERROR_NEGATIVE_DEBIT_AMOUNT',
                    });
                }
                const fancyController = new FancyController_1.FancyController();
                let balance = yield Balance_1.Balance.findOne({ userId: mongoose_1.Types.ObjectId(user.id) });
                const userInfo = yield User_1.User.findOne({ _id: mongoose_1.Types.ObjectId(user.id) });
                if (balance && userInfo._id) {
                    const currentBalance = (balance === null || balance === void 0 ? void 0 : balance.balance) - (balance === null || balance === void 0 ? void 0 : balance.exposer);
                    if (currentBalance < transactionData.amount) {
                        return res.status(500).json({
                            bet_status: "N",
                            balance: 0,
                            status: 'OP_INSUFFICIENT_FUNDS',
                        });
                    }
                    const findGame = yield CasCasino_1.CasCasino.findOne({ game_identifier: gameData.gameCode });
                    const checkBetExist = yield CasinoBet_1.CasinoBet.findOne({ providerTransactionId: gameData.providerTransactionId });
                    const now = new Date();
                    const hours = String(now.getHours()).padStart(2, '0'); // Get hours (00-23)
                    const minutes = String(now.getMinutes()).padStart(2, '0'); // Get minutes (00-59)
                    const seconds = String(now.getSeconds()).padStart(2, '0'); // Get seconds (00-59)
                    const timeString = `${hours}${minutes}${seconds}`;
                    if (!checkBetExist && findGame) {
                        const parentinfo = yield User_1.User.findOne({ _id: userInfo === null || userInfo === void 0 ? void 0 : userInfo.parentId });
                        const partnership = parentinfo != null && parentinfo.partnership != undefined
                            ? parentinfo.partnership[4]
                            : defaultRatio;
                        const obj = {
                            userId: mongoose_1.Types.ObjectId(userInfo._id),
                            amount: transactionData.amount,
                            gameCode: findGame.game_code,
                            currency: 'INR',
                            round: gameData.providerRoundId,
                            providerCode: findGame.game_code,
                            providerTransactionId: transactionData.providerTransactionId,
                            status: 'completed',
                            rolledBack: 'N',
                            gameId: findGame.game_identifier,
                            matchId: findGame.game_identifier,
                            marketId: parseInt(`${timeString}`),
                            description: 'bet',
                            requestUuid: transactionData.referenceId,
                            transactionUuid: transactionData._id,
                            userName: userInfo.username,
                            parentStr: userInfo.parentStr,
                            ratioStr: partnership,
                            gameName: findGame.game_name,
                        };
                        const bet = new CasinoBet_1.CasinoBet(obj);
                        const sbet = yield bet.save();
                        if (sbet) {
                            let userIdList = [];
                            const parentIdList = [];
                            const narrationN = `CCASINO-${findGame.game_name} [${gameData.providerRoundId}]`;
                            yield fancyController.addprofitlosstouser({
                                userId: mongoose_1.Types.ObjectId(userInfo._id),
                                bet_id: sbet._id,
                                profit_loss: -transactionData.amount,
                                matchId: parseInt(`${timeString}`),
                                narration: narrationN,
                                sportsType: 5000,
                                selectionId: parseInt(`${timeString}`),
                                sportId: 5000,
                            });
                            userIdList.push(mongoose_1.Types.ObjectId(userInfo._id));
                            partnership.allRatio.map((ItemParentStr) => {
                                userIdList.push(mongoose_1.Types.ObjectId(ItemParentStr.parent));
                                parentIdList.push(ItemParentStr.parent);
                            });
                            const unique = [...new Set(userIdList)];
                            if (unique.length > 0) {
                                yield fancyController.updateUserAccountStatementCasino(unique, parentIdList);
                            }
                        }
                        balance = yield Balance_1.Balance.findOne({ userId: mongoose_1.Types.ObjectId(userInfo._id) });
                        user_socket_1.default.setExposer({
                            balance: balance === null || balance === void 0 ? void 0 : balance.balance,
                            exposer: balance === null || balance === void 0 ? void 0 : balance.exposer,
                            userId: userInfo._id,
                        });
                        return res.status(200).json({
                            balance: (balance === null || balance === void 0 ? void 0 : balance.balance) - (balance === null || balance === void 0 ? void 0 : balance.exposer),
                            bet_status: "Y",
                            status: 'OP_SUCCESS',
                        });
                    }
                    else {
                        if (checkBetExist) {
                            return res.status(500).json({
                                balance: 0,
                                bet_status: "N",
                                status: 'OP_DUPLICATE_TRANSACTION',
                            });
                        }
                        else {
                            return res.status(500).json({
                                balance: 0,
                                bet_status: "N",
                                status: 'OP_FAILURE_BET_EXIST',
                            });
                        }
                    }
                }
                else {
                    return res.status(500).json({
                        bet_status: "N",
                        balance: 0,
                        status: 'OP_FAILURE',
                    });
                }
            }
            catch (e) {
                return res.status(500).json({
                    balance: 0,
                    bet_status: "N",
                    status: 'OP_FAILURE',
                });
            }
        });
        this.getCreditRequest = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { user, partnerKey, transactionData, gameData } = req.body;
                console.log(req.body, "req.body credit");
                if (partnerKey != 'D48CJ9BTHT2NCT4XMZPY') {
                    return res.status(500).json({
                        bet_status: "N",
                        balance: 0,
                        status: 'OP_FAILURE',
                    });
                }
                if (transactionData.amount < 0) {
                    return res.status(500).json({
                        bet_status: "N",
                        balance: 0,
                        status: 'OP_ERROR_NEGATIVE_DEBIT_AMOUNT',
                    });
                }
                const fancyController = new FancyController_1.FancyController();
                let balance = yield Balance_1.Balance.findOne({ userId: mongoose_1.Types.ObjectId(user.id) });
                const userInfo = yield User_1.User.findOne({ _id: mongoose_1.Types.ObjectId(user.id) });
                if (balance && userInfo._id) {
                    const currentBalance = (balance === null || balance === void 0 ? void 0 : balance.balance) - (balance === null || balance === void 0 ? void 0 : balance.exposer);
                    // if (currentBalance < transactionData.amount) {
                    //   return res.status(500).json({
                    //     bet_status: "N",
                    //     balance: 0,
                    //     status: 'OP_INSUFFICIENT_FUNDS',
                    //   })
                    // }
                    const findGame = yield CasCasino_1.CasCasino.findOne({ game_identifier: gameData.gameCode });
                    const checkWinExist = yield CasinoBet_1.CasinoBet.findOne({ providerTransactionId: gameData.providerTransactionId, description: 'win' });
                    const checkRollback = yield CasinoBet_1.CasinoBet.findOne({
                        providerTransactionId: gameData.providerTransactionId,
                        description: 'win',
                        rolledBack: 'Y',
                    });
                    const checkBetExist = yield CasinoBet_1.CasinoBet.findOne({ providerTransactionId: gameData.providerTransactionId });
                    const now = new Date();
                    const hours = String(now.getHours()).padStart(2, '0'); // Get hours (00-23)
                    const minutes = String(now.getMinutes()).padStart(2, '0'); // Get minutes (00-59)
                    const seconds = String(now.getSeconds()).padStart(2, '0'); // Get seconds (00-59)
                    const timeString = `${hours}${minutes}${seconds}`;
                    if (findGame && !checkWinExist && !checkRollback) {
                        const parentinfo = yield User_1.User.findOne({ _id: userInfo === null || userInfo === void 0 ? void 0 : userInfo.parentId });
                        const partnership = parentinfo != null && parentinfo.partnership != undefined
                            ? parentinfo.partnership[4]
                            : defaultRatio;
                        const obj = {
                            userId: mongoose_1.Types.ObjectId(userInfo._id),
                            amount: transactionData.amount,
                            gameCode: findGame.game_code,
                            currency: 'INR',
                            round: gameData.providerRoundId,
                            providerCode: findGame.game_code,
                            providerTransactionId: transactionData.providerTransactionId,
                            status: 'completed',
                            rolledBack: 'N',
                            gameId: findGame.game_identifier,
                            matchId: findGame.game_identifier,
                            marketId: parseInt(`${findGame.game_identifier}${timeString}`),
                            description: 'win',
                            requestUuid: transactionData.referenceId,
                            transactionUuid: transactionData.referenceId,
                            userName: userInfo.username,
                            parentStr: userInfo.parentStr,
                            ratioStr: partnership,
                            gameName: findGame.game_name,
                        };
                        const bet = new CasinoBet_1.CasinoBet(obj);
                        const sbet = yield bet.save();
                        if (sbet) {
                            let userIdList = [];
                            const parentIdList = [];
                            const narrationN = `CCASINO-${findGame.game_name} [${gameData.providerRoundId}]`;
                            yield fancyController.addprofitlosstouser({
                                userId: mongoose_1.Types.ObjectId(userInfo._id),
                                bet_id: sbet._id,
                                profit_loss: transactionData.amount,
                                matchId: parseInt(`${timeString}`),
                                narration: narrationN,
                                sportsType: 5000,
                                selectionId: parseInt(`${timeString}`),
                                sportId: 5000,
                            });
                            userIdList.push(mongoose_1.Types.ObjectId(userInfo._id));
                            partnership.allRatio.map((ItemParentStr) => {
                                userIdList.push(mongoose_1.Types.ObjectId(ItemParentStr.parent));
                                parentIdList.push(ItemParentStr.parent);
                            });
                            const unique = [...new Set(userIdList)];
                            if (unique.length > 0) {
                                yield fancyController.updateUserAccountStatementCasino(unique, parentIdList);
                            }
                        }
                        balance = yield Balance_1.Balance.findOne({ userId: mongoose_1.Types.ObjectId(userInfo._id) });
                        user_socket_1.default.setExposer({
                            balance: balance === null || balance === void 0 ? void 0 : balance.balance,
                            exposer: balance === null || balance === void 0 ? void 0 : balance.exposer,
                            userId: userInfo._id,
                        });
                        return res.status(200).json({
                            balance: (balance === null || balance === void 0 ? void 0 : balance.balance) - (balance === null || balance === void 0 ? void 0 : balance.exposer),
                            bet_status: "Y",
                            status: 'OP_SUCCESS',
                        });
                    }
                    else {
                        if (checkBetExist) {
                            return res.status(500).json({
                                balance: 0,
                                bet_status: "N",
                                status: 'OP_DUPLICATE_TRANSACTION',
                            });
                        }
                        else {
                            return res.status(500).json({
                                balance: 0,
                                bet_status: "N",
                                status: 'OP_FAILURE_BET_EXIST',
                            });
                        }
                    }
                }
                else {
                    return res.status(500).json({
                        bet_status: "N",
                        balance: 0,
                        status: 'OP_FAILURE',
                    });
                }
            }
            catch (e) {
                return res.status(500).json({
                    balance: 0,
                    bet_status: "N",
                    status: 'OP_FAILURE',
                });
            }
        });
    }
}
exports.CasCallbackController = CasCallbackController;
//# sourceMappingURL=CasCallbackController.js.map