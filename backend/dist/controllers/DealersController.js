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
exports.DealersController = void 0;
const AccountStatement_1 = require("../models/AccountStatement");
const Balance_1 = require("../models/Balance");
const Role_1 = require("../models/Role");
const User_1 = require("../models/User");
const UserBetStake_1 = require("../models/UserBetStake");
const UserChip_1 = require("../models/UserChip");
const Database_1 = require("../providers/Database");
const aggregation_pipeline_pagination_1 = require("../util/aggregation-pipeline-pagination");
const ApiController_1 = require("./ApiController");
const bcrypt_nodejs_1 = __importDefault(require("bcrypt-nodejs"));
const mongoose_1 = require("mongoose");
const FancyController_1 = require("./FancyController");
const user_socket_1 = __importDefault(require("../sockets/user-socket"));
class DealersController extends ApiController_1.ApiController {
    constructor() {
        super();
        this.getUserListSuggestion = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { username } = req.body;
                const regex = new RegExp(username, 'i');
                const currentUser = req.user;
                const users = yield User_1.User.find({
                    username: { $regex: regex },
                    parentStr: { $elemMatch: { $eq: mongoose_1.Types.ObjectId(currentUser._id) } },
                })
                    .select({
                    _id: 1,
                    username: 1,
                    role: 1,
                })
                    .limit(10);
                return this.success(res, users);
            }
            catch (e) {
                return this.fail(res, e);
            }
        });
        this.saveGeneralSettings = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { transactionPassword, userId, userSetting } = req.body;
                const { _id, role } = req === null || req === void 0 ? void 0 : req.user;
                const currentUserData = yield User_1.User.findOne({ _id });
                return yield currentUserData
                    .compareTxnPassword(transactionPassword)
                    .then((isMatch) => __awaiter(this, void 0, void 0, function* () {
                    if (!isMatch) {
                        return this.fail(res, 'Transaction Password not matched');
                    }
                    yield User_1.User.updateMany({
                        $or: [
                            { parentStr: { $elemMatch: { $eq: mongoose_1.Types.ObjectId(_id) } } },
                            { _id: mongoose_1.Types.ObjectId(userId) },
                        ],
                    }, { $set: { userSetting } });
                    return this.success(res, {}, 'Settings Saved');
                }));
            }
            catch (e) {
                return this.fail(res, e);
            }
        });
        this.resetTransactionPassword = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { transactionPassword, userId } = req.body;
                const { _id, role } = req === null || req === void 0 ? void 0 : req.user;
                const currentUserData = yield User_1.User.findOne({ _id });
                return yield currentUserData
                    .compareTxnPassword(transactionPassword)
                    .then((isMatch) => __awaiter(this, void 0, void 0, function* () {
                    if (!isMatch) {
                        return this.fail(res, 'Transaction Password not matched');
                    }
                    yield User_1.User.updateOne({ _id: mongoose_1.Types.ObjectId(userId) }, { $set: { changePassAndTxn: false } });
                    return this.success(res, {}, 'Settings Saved');
                }));
            }
            catch (e) {
                return this.fail(res, e);
            }
        });
        this.signUp = this.signUp.bind(this);
        this.getUserList = this.getUserList.bind(this);
        this.getUserDetail = this.getUserDetail.bind(this);
        this.getParentUserDetail = this.getParentUserDetail.bind(this);
        this.saveUserDepositFC = this.saveUserDepositFC.bind(this);
        this.updateUser = this.updateUser.bind(this);
        this.updateUserStatus = this.updateUserStatus.bind(this);
        this.updateUserWallet = this.updateUserWallet.bind(this);
        this.updateUserWhatsapp = this.updateUserWhatsapp.bind(this);
    }
    signUp(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = yield Database_1.Database.getInstance().startSession();
            try {
                session.startTransaction();
                const { password, username, parent, partnership, role, fullname, city, phone, creditRefrences, exposerLimit, userSetting, transactionPassword, } = req.body;
                const currentUser = req.user;
                const currentUserData = yield User_1.User.findOne({ _id: currentUser._id });
                return yield currentUserData
                    .compareTxnPassword(transactionPassword)
                    .then((isMatch) => __awaiter(this, void 0, void 0, function* () {
                    if (isMatch) {
                        return this.fail(res, 'Transaction Password not matched');
                    }
                    const user = yield User_1.User.findOne({ username });
                    if (user) {
                        return this.fail(res, 'User already exixts!');
                    }
                    const parentUser = yield User_1.User.findOne({ username: parent });
                    if (!parentUser) {
                        return this.fail(res, 'Parent User not exixts!');
                    }
                    let updatedUserSetting = {};
                    if (role !== Role_1.RoleType.user) {
                        let errorMsg = this.validatePartnership(JSON.parse(JSON.stringify(parentUser)), partnership);
                        if (errorMsg) {
                            return this.fail(res, `${errorMsg.game} Partnership should be less then or equal ${errorMsg.parentRatio}`);
                        }
                        updatedUserSetting = this.getUserSetting(userSetting, parentUser.userSetting);
                    }
                    if (role === Role_1.RoleType.user) {
                        if (!exposerLimit)
                            this.fail(res, 'Exposer Limit is reuired field');
                    }
                    const newUserParentStr = (parentUser === null || parentUser === void 0 ? void 0 : parentUser.parentStr)
                        ? [...parentUser === null || parentUser === void 0 ? void 0 : parentUser.parentStr, parentUser._id]
                        : [parentUser._id];
                    // User Setting
                    const userData = {
                        username,
                        password,
                        role: role,
                        level: parentUser.level + 1,
                        isLogin: true,
                        betLock: true,
                        parentId: parentUser._id,
                        parentStr: newUserParentStr,
                        fullName: fullname,
                        city: city,
                        phone: phone,
                        creditRefrences,
                        exposerLimit,
                        userSetting: updatedUserSetting,
                    };
                    const newUser = new User_1.User(userData);
                    yield newUser.save({ session });
                    if (newUser._id !== undefined && newUser._id !== null) {
                        yield Balance_1.Balance.findOneAndUpdate({ userId: newUser._id }, { balance: 0, exposer: 0, profitLoss: -creditRefrences, mainBalance: 0 }, { new: true, upsert: true, session });
                        if (role === Role_1.RoleType.user) {
                            // const parentStack: any = await UserBetStake.findOne({
                            //   userId: parentUser._id,
                            // }).lean()
                            // delete parentStack._id
                            // delete parentStack.userId
                            yield UserBetStake_1.UserBetStake.findOneAndUpdate({ userId: newUser._id }, Object.assign({}, UserBetStake_1.defaultStack), { new: true, upsert: true, session });
                        }
                    }
                    if (newUser._id !== undefined && newUser._id !== null && role !== Role_1.RoleType.user) {
                        const partnershipData = this.partnership(partnership, parentUser.partnership, newUser._id);
                        yield User_1.User.findOneAndUpdate({ _id: newUser._id }, { partnership: partnershipData }, { session });
                    }
                    yield session.commitTransaction();
                    session.endSession();
                    return this.success(res, {}, 'New User Added');
                }));
            }
            catch (e) {
                yield session.abortTransaction();
                session.endSession();
                return this.fail(res, "server error: " + e.message);
            }
        });
    }
    /* this function return this type of object
    "partnership":{
      "exchange":{
          "ownRatio":100,
          "allRatio":[
              {
                  "parent":null,
                  "ratio":100
              }
          ]
      }
    }
    */
    partnership(partnership, parentPartnership, parentId) {
        let partnershipData = {};
        for (let gameType in User_1.GameType) {
            const game = User_1.GameType[gameType];
            let lastParentPopped = this.getLastUserInPartnership(parentPartnership, game);
            let parentRatio = [
                ...parentPartnership[game].allRatio,
                {
                    parent: lastParentPopped.parent,
                    ratio: lastParentPopped.ratio - partnership[game],
                },
                {
                    parent: parentId,
                    ratio: parseInt(partnership[game].toString()),
                },
            ];
            partnershipData[game] = {
                ownRatio: partnership[game],
                allRatio: parentRatio,
            };
        }
        return partnershipData;
    }
    getLastUserInPartnership(parentPartnership, game) {
        return parentPartnership[game].allRatio.pop();
    }
    validatePartnership(parentUser, partnership) {
        for (let gameType in User_1.GameType) {
            const game = User_1.GameType[gameType];
            const checkPartnership = this.getLastUserInPartnership(parentUser.partnership, game);
            if (checkPartnership.ratio - partnership[game] < 0) {
                return { game, parentRatio: checkPartnership.ratio };
            }
        }
        return null;
    }
    getUserList(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { username, page, search, type, status } = req.query;
            const pageNo = page ? page : '1';
            const pageLimit = 20;
            const currentUser = req.user;
            const select = {
                _id: 1,
                username: 1,
                parentId: 1,
                role: 1,
                creditRefrences: 1,
                exposerLimit: 1,
                isLogin: 1,
                betLock: 1,
                partnership: 1,
                parentStr: 1,
                'balance.balance': 1,
                'balance.exposer': 1,
                'balance.profitLoss': 1,
                'balance.mainBalance': 1,
                'balance.casinoexposer': 1,
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
            let filters = [];
            if (username && search !== 'true') {
                const user = yield this.getUser(username);
                filters = (0, aggregation_pipeline_pagination_1.paginationPipeLine)(pageNo, [
                    {
                        $match: {
                            parentId: user === null || user === void 0 ? void 0 : user._id,
                            parentStr: { $elemMatch: { $eq: mongoose_1.Types.ObjectId(currentUser._id) } },
                        },
                    },
                    ...aggregateFilter,
                ], pageLimit);
            }
            else if (search === 'true' && type) {
                //if (username) const user: IUserModel | null = await this.getUser(username)
                filters = (0, aggregation_pipeline_pagination_1.paginationPipeLine)(pageNo, [
                    {
                        $match: {
                            role: type,
                            parentStr: { $elemMatch: { $eq: mongoose_1.Types.ObjectId(currentUser._id) } },
                        },
                    },
                    ...aggregateFilter,
                ], pageLimit);
            }
            else if (username && search === 'true') {
                filters = (0, aggregation_pipeline_pagination_1.paginationPipeLine)(pageNo, [
                    {
                        $match: {
                            username: new RegExp(username, 'i'),
                            parentStr: { $elemMatch: { $eq: mongoose_1.Types.ObjectId(currentUser._id) } },
                        },
                    },
                    ...aggregateFilter,
                ], pageLimit);
            }
            else {
                const { _id, role } = req === null || req === void 0 ? void 0 : req.user;
                if (status) {
                    filters = (0, aggregation_pipeline_pagination_1.paginationPipeLine)(pageNo, [
                        {
                            $match: {
                                parentId: mongoose_1.Types.ObjectId(_id),
                                isLogin: status === 'true',
                            },
                        },
                        ...aggregateFilter,
                    ], pageLimit);
                }
                else {
                    if (role !== 'admin') {
                        filters = (0, aggregation_pipeline_pagination_1.paginationPipeLine)(pageNo, [{ $match: { parentId: mongoose_1.Types.ObjectId(_id) } }, ...aggregateFilter], pageLimit);
                    }
                    else {
                        console.log(_id);
                        filters = (0, aggregation_pipeline_pagination_1.paginationPipeLine)(pageNo, [{ $match: { _id: mongoose_1.Types.ObjectId(_id) } }, ...aggregateFilter], pageLimit);
                    }
                }
            }
            const users = yield User_1.User.aggregate(filters);
            return this.success(res, Object.assign({}, users[0]));
        });
    }
    getUser(username) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield User_1.User.findOne({ username: username });
            return user;
        });
    }
    getUserDetail(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { username } = req.query;
            const user = yield User_1.User.findOne({ username: username });
            return this.success(res, user);
        });
    }
    getParentUserDetail(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { username } = req.query;
            const { role } = (req === null || req === void 0 ? void 0 : req.user) || "admin";
            let user;
            if (username === 'superadmin' && role == 'admin') {
                user = yield this.getUserDetailAndBalance(req);
            }
            else {
                user = yield this.getParentDetailAndBalance(req);
            }
            return this.success(res, user);
        });
    }
    getUserDetailAndBalance(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { username } = req.query;
            const select = {
                _id: 1,
                username: 1,
                parentId: 1,
                role: 1,
                creditRefrences: 1,
                exposerLimit: 1,
                isLogin: 1,
                betLock: 1,
                'balance.balance': 1,
                'balance.mainBalance': 1,
                parent: 1,
                'parentBalance.balance': 1,
                userSetting: 1,
                phone: 1,
            };
            return yield User_1.User.aggregate([
                {
                    $match: { username },
                },
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
                    $lookup: {
                        from: 'users',
                        localField: '_id',
                        foreignField: '_id',
                        pipeline: [{ $project: select }],
                        as: 'parent',
                    },
                },
                {
                    $unwind: '$parent',
                },
                {
                    $lookup: {
                        from: 'balances',
                        localField: 'parent._id',
                        foreignField: 'userId',
                        as: 'parentBalance',
                    },
                },
                {
                    $unwind: '$parentBalance',
                },
                {
                    $project: select,
                },
            ]);
        });
    }
    getParentDetailAndBalance(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { username } = req.query;
            const select = {
                _id: 1,
                username: 1,
                parentId: 1,
                role: 1,
                creditRefrences: 1,
                exposerLimit: 1,
                isLogin: 1,
                betLock: 1,
                'balance.balance': 1,
                'balance.mainBalance': 1,
                parent: 1,
                'parentBalance.balance': 1,
                userSetting: 1,
                phone: 1,
            };
            return yield User_1.User.aggregate([
                {
                    $match: { username },
                },
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
                    $lookup: {
                        from: 'users',
                        localField: 'parentId',
                        foreignField: '_id',
                        pipeline: [{ $project: select }],
                        as: 'parent',
                    },
                },
                {
                    $unwind: '$parent',
                },
                {
                    $lookup: {
                        from: 'balances',
                        localField: 'parent._id',
                        foreignField: 'userId',
                        as: 'parentBalance',
                    },
                },
                {
                    $unwind: '$parentBalance',
                },
                {
                    $project: select,
                },
            ]);
        });
    }
    getUserSetting(userSettings, parentSettings) {
        let userSettingData = {};
        for (let setting in userSettings) {
            const { minBet, maxBet, delay } = userSettings[setting];
            userSettingData[setting] = {
                minBet: minBet !== '0' || !minBet ? minBet : parentSettings[setting].minBet,
                maxBet: maxBet !== '0' || !maxBet ? maxBet : parentSettings[setting].maxBet,
                delay: delay !== '0' || !delay ? delay : parentSettings[setting].delay,
            };
        }
        return userSettingData;
    }
    saveUserDepositFC(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { amount, narration } = req.body;
                const { _id, role } = req === null || req === void 0 ? void 0 : req.user;
                if (role === 'admin') {
                    const getAccStmt = yield AccountStatement_1.AccoutStatement.findOne({ userId: _id });
                    const getOpenBal = (getAccStmt === null || getAccStmt === void 0 ? void 0 : getAccStmt.closeBal) ? getAccStmt.closeBal : 0;
                    const accountData = {
                        userId: _id,
                        narration,
                        amount,
                        type: AccountStatement_1.ChipsType.fc,
                        txnType: UserChip_1.TxnType.cr,
                        openBal: getOpenBal,
                        closeBal: getOpenBal + +amount,
                    };
                    const newAccStmt = new AccountStatement_1.AccoutStatement(accountData);
                    yield newAccStmt.save();
                    if (newAccStmt._id !== undefined && newAccStmt._id !== null) {
                        yield Balance_1.Balance.findOneAndUpdate({ userId: _id }, { balance: newAccStmt.closeBal }, { new: true, upsert: true });
                    }
                }
                return this.success(res, {}, 'Amount deposited to user');
            }
            catch (e) {
                return this.fail(res, e);
            }
        });
    }
    updateUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { username, password, confirmPassword, transactionPassword } = req.body;
                const currentUser = req.user;
                const currentUserData = yield User_1.User.findOne({ _id: currentUser._id });
                return yield currentUserData
                    .compareTxnPassword(transactionPassword)
                    .then((isMatch) => __awaiter(this, void 0, void 0, function* () {
                    if (!isMatch) {
                        return this.fail(res, 'Transaction Password not matched');
                    }
                    const user = yield User_1.User.findOne({ username });
                    if (user) {
                        const salt = bcrypt_nodejs_1.default.genSaltSync(10);
                        const hash = bcrypt_nodejs_1.default.hashSync(password, salt);
                        let setData = { password: hash };
                        if (user.role !== Role_1.RoleType.admin)
                            setData = Object.assign(Object.assign({}, setData), { changePassAndTxn: false });
                        yield User_1.User.findOneAndUpdate({ _id: user._id }, { $set: setData });
                        user_socket_1.default.logout({
                            role: user.role,
                            sessionId: '123',
                            _id: user._id,
                        });
                        return this.success(res, {}, 'User password updated');
                    }
                    else {
                        return this.fail(res, 'User does not exist!');
                    }
                }));
            }
            catch (e) {
                return this.fail(res, e);
            }
        });
    }
    updateUserStatus(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { username, isUserActive, isUserBetActive, transactionPassword, single } = req.body;
                const currentUser = req.user;
                const currentUserData = yield User_1.User.findOne({ _id: currentUser._id });
                if (!single) {
                    const isMatch = yield currentUserData.compareTxnPassword(transactionPassword);
                    if (!isMatch) {
                        return this.fail(res, 'Transaction Password not matched');
                    }
                }
                const user = yield User_1.User.findOne({ username });
                if (user) {
                    yield User_1.User.updateMany({
                        $or: [
                            { _id: user._id },
                            { parentStr: { $elemMatch: { $eq: mongoose_1.Types.ObjectId(user._id) } } },
                        ],
                    }, {
                        isLogin: isUserActive,
                        betLock: isUserBetActive,
                    });
                    return this.success(res, {}, 'User status updated');
                }
                else {
                    return this.fail(res, 'User does not exist!');
                }
            }
            catch (e) {
                return this.fail(res, e);
            }
        });
    }
    updateUserWallet(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { username, amount, walletUpdateType, transactionPassword } = req.body;
                console.log(req.body, "ghftfh");
                const currentUser = req.user;
                const currentUserData = yield User_1.User.findOne({ _id: currentUser._id });
                return yield currentUserData
                    .compareTxnPassword(transactionPassword)
                    .then((isMatch) => __awaiter(this, void 0, void 0, function* () {
                    if (!isMatch) {
                        return this.fail(res, 'Transaction Password not matched');
                    }
                    const user = yield User_1.User.findOne({ username });
                    let succesMsg;
                    if (user) {
                        if (walletUpdateType === 'EXP') {
                            yield User_1.User.findOneAndUpdate({ _id: user._id }, {
                                exposerLimit: amount,
                            });
                            succesMsg = 'User exposure limit updated';
                        }
                        else if (walletUpdateType === 'CRD') {
                            yield User_1.User.findOneAndUpdate({ _id: user._id }, {
                                creditRefrences: amount,
                            });
                            const fancyObj = new FancyController_1.FancyController();
                            yield fancyObj.updateUserAccountStatement([user._id], user.parentStr);
                            succesMsg = 'User credit refrence updated';
                        }
                        return this.success(res, {}, succesMsg);
                    }
                    else {
                        return this.fail(res, 'User does not exist!');
                    }
                }));
            }
            catch (e) {
                return this.fail(res, e);
            }
        });
    }
    updateUserWhatsapp(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('req.body', req.body);
                const { whatsapp } = req.body;
                const currentUser = req.user;
                if (!whatsapp) {
                    return res.status(400).json({ message: 'WhatsApp number is required' });
                }
                // Update only the whatsapp field of the current user
                const updatedUser = yield User_1.User.findByIdAndUpdate(currentUser._id, { phone: whatsapp }, { new: true } // return the updated document
                );
                console.log('updatedUser', updatedUser);
                return res.status(200).json({
                    message: 'WhatsApp number updated successfully',
                    user: updatedUser,
                });
            }
            catch (e) {
                console.error(e);
                return res.status(500).json({ message: 'Failed to update WhatsApp', error: e.message });
            }
        });
    }
}
exports.DealersController = DealersController;
//# sourceMappingURL=DealersController.js.map