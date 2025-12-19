"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_jwt_1 = require("passport-jwt");
const User_1 = require("../models/User");
const Locals_1 = __importDefault(require("../providers/Locals"));
class JwtStrategy {
    static init(_passport) {
        const opts = {
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: Locals_1.default.config().appSecret,
        };
        _passport.use(new passport_jwt_1.Strategy(opts, ({ username }, done) => {
            User_1.User.findOne({ username: username })
                // @ts-ignore
                /// .cache(1800, `user-cache-${username.toLowerCase()}`)
                .then((user) => {
                if (user) {
                    const { _id, username, role, level, partnership, userSetting, changePassAndTxn, sessionId, parentId } = user;
                    return done(null, {
                        _id,
                        username,
                        sessionId,
                        role,
                        level,
                        partnership,
                        userSetting,
                        changePassAndTxn,
                        parentId
                    });
                }
                return done(null, false);
            });
        }));
    }
}
exports.default = JwtStrategy;
//# sourceMappingURL=Jwt.js.map