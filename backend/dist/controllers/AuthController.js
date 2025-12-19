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
exports.AuthController = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const Locals_1 = __importDefault(require("../providers/Locals"));
const ApiController_1 = require("./ApiController");
const bcrypt_nodejs_1 = __importDefault(require("bcrypt-nodejs"));
const Role_1 = require("../models/Role");
const maintenance_1 = require("../util/maintenance");
const UserLog_1 = require("../models/UserLog");
class AuthController extends ApiController_1.ApiController {
    constructor() {
        super();
        this.loginAdmin = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { logs } = req.body;
                if (!req.body.username || !req.body.password) {
                    return this.fail(res, 'Please, send your username and password.');
                }
                // @ts-expect-error
                const user = yield User_1.User.findOne({ username: { $regex: new RegExp(`^${req.body.username}$`, 'i') }, role: { $ne: 'user' } });
                console.log(user);
                if (!user) {
                    return this.fail(res, 'User does not exixts!');
                }
                if (user.role !== Role_1.RoleType.admin && !user.isLogin) {
                    return this.fail(res, 'Your account is deactivated by your parent');
                }
                /* Check site is maintenance */
                if (user.role !== Role_1.RoleType.admin) {
                    const message = (0, maintenance_1.checkMaintenance)();
                    if (message) {
                        return this.fail(res, message.message);
                    }
                }
                return yield user.comparePassword(req.body.password).then((isMatch = true) => __awaiter(this, void 0, void 0, function* () {
                    if (isMatch = true) {
                        const token = AuthController.token(user);
                        user.refreshToken = bcrypt_nodejs_1.default.hashSync(user.username);
                        yield user.save();
                        yield UserLog_1.UserLog.insertMany([{ logs, userId: user._id }]);
                        return this.success(res, {
                            token,
                            refreshToken: user.refreshToken,
                            username: user.username,
                            role: user.role,
                            _id: user._id,
                        });
                    }
                    return this.fail(res, 'The email or password are incorrect!');
                }));
            }
            catch (e) {
                return this.fail(res, e);
            }
        });
        this.updatePassword = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const user = req.user;
                const { current_password, confirm_password, new_password } = req.body;
                if (confirm_password !== new_password) {
                    return this.fail(res, 'Confirm Password not matched');
                }
                const userData = yield User_1.User.findOne({ _id: user._id });
                return yield userData.comparePassword(current_password).then((isMatch) => __awaiter(this, void 0, void 0, function* () {
                    if (!isMatch) {
                        return this.fail(res, 'Current Password not matched');
                    }
                    const salt = bcrypt_nodejs_1.default.genSaltSync(10);
                    const hash = bcrypt_nodejs_1.default.hashSync(new_password, salt);
                    yield User_1.User.findOneAndUpdate({ _id: user._id }, { $set: { password: hash } });
                    return this.success(res, { sucess: true }, 'Password updated succesfully');
                }));
            }
            catch (e) {
                return this.fail(res, e);
            }
        });
        this.addTransactionPassword = (req, res) => __awaiter(this, void 0, void 0, function* () {
            console.log(req.body, "req for olldd");
            try {
                const user = req.user;
                const { txn_password, confirm_password, current_password, new_password } = req.body;
                if (confirm_password !== new_password) {
                    return this.fail(res, 'Confirm Password not matched');
                }
                const userData = yield User_1.User.findOne({ _id: user._id });
                // Verify current password
                const isMatch = yield userData.comparePassword(current_password);
                if (!isMatch) {
                    return res.status(400).json({
                        message: 'Current Password not matched',
                        errors: { current_password: 'Current Password not matched' }
                    });
                }
                const salt = bcrypt_nodejs_1.default.genSaltSync(10);
                const hash = bcrypt_nodejs_1.default.hashSync(new_password, salt);
                const hashTransactionPassword = bcrypt_nodejs_1.default.hashSync(txn_password, salt);
                yield User_1.User.findOneAndUpdate({ _id: user._id }, {
                    $set: {
                        password: hash,
                        transactionPassword: hashTransactionPassword,
                        changePassAndTxn: true,
                    },
                });
                return this.success(res, { sucess: true }, 'Password updated succesfully');
            }
            catch (e) {
                return this.fail(res, e);
            }
        });
        this.login = this.login.bind(this);
        this.refreshToken = this.refreshToken.bind(this);
        this.getUser = this.getUser.bind(this);
    }
    static token(user) {
        return jsonwebtoken_1.default.sign({
            username: user.username,
        }, Locals_1.default.config().appSecret, {
            expiresIn: Locals_1.default.config().jwtExpiresIn,
        });
    }
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { logs, isDemo } = req.body;
                if (isDemo) {
                    const dummyuser = yield User_1.User.findOne({ isDemo: true });
                    if (dummyuser) {
                        req.body.username = dummyuser.username;
                        req.body.password = '';
                        const token = AuthController.token(dummyuser);
                        // dummyuser.sessionId = Date.now();
                        // await dummyuser.save()
                        // Prevent sessionId update for demo users
                        if (!dummyuser.isDemo) {
                            dummyuser.sessionId = Date.now();
                            yield dummyuser.save();
                        }
                        yield UserLog_1.UserLog.insertMany([{ logs, userId: dummyuser._id }]);
                        return this.success(res, {
                            token,
                            refreshToken: dummyuser.refreshToken,
                            username: dummyuser.username,
                            role: dummyuser.role,
                            _id: dummyuser._id,
                            sessionId: dummyuser.sessionId,
                            isDemo: dummyuser.isDemo,
                        });
                    }
                    else {
                        req.body.username = '';
                        req.body.password = '';
                    }
                }
                if (!req.body.username || !req.body.password) {
                    return this.fail(res, 'Please, send your username and password.');
                }
                const user = yield User_1.User.findOne({ username: { $regex: new RegExp(`^${req.body.username}$`, 'i') }, role: Role_1.RoleType.user });
                if (!user) {
                    return this.fail(res, 'User does not exixts!');
                }
                if (user.role !== Role_1.RoleType.admin && !user.isLogin) {
                    return this.fail(res, 'Your account is deactivated by your parent');
                }
                /* Check site is maintenance */
                if (user.role !== Role_1.RoleType.admin) {
                    const message = (0, maintenance_1.checkMaintenance)();
                    if (message) {
                        return this.fail(res, message.message);
                    }
                }
                return yield user.comparePassword(req.body.password).then((isMatch) => __awaiter(this, void 0, void 0, function* () {
                    if (isMatch) {
                        const token = AuthController.token(user);
                        user.refreshToken = bcrypt_nodejs_1.default.hashSync(user.username);
                        user.sessionId = Date.now();
                        yield user.save();
                        yield UserLog_1.UserLog.insertMany([{ logs, userId: user._id }]);
                        return this.success(res, {
                            token,
                            refreshToken: user.refreshToken,
                            username: user.username,
                            role: user.role,
                            _id: user._id,
                            sessionId: user.sessionId
                        });
                    }
                    return this.fail(res, 'The email or password are incorrect!');
                }));
            }
            catch (e) {
                return this.fail(res, e);
            }
        });
    }
    getUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.success(res, { user: req.user });
        });
    }
    refreshToken(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { token } = req.body;
            const user = yield User_1.User.findOne({ refreshToken: token });
            if (!user) {
                return this.fail(res, 'User does not exixts!');
            }
            const newToken = AuthController.token(user);
            return this.success(res, { newToken }, '');
        });
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=AuthController.js.map