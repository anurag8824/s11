"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const Jwt_1 = __importDefault(require("./Jwt"));
const Log_1 = __importDefault(require("../middlewares/Log"));
const User_1 = require("../models/User");
const ResponseApi_1 = require("../util/ResponseApi");
class Passport {
    mountPackage(_express) {
        _express = _express.use(passport_1.default.initialize());
        // _express = _express.use(passport.session());
        passport_1.default.serializeUser((user, done) => {
            // @ts-ignore
            done(null, user.id);
        });
        passport_1.default.deserializeUser((id, done) => {
            User_1.User.findById(id, (err, user) => {
                done(err, user);
            });
        });
        this.mountLocalStrategies();
        return _express;
    }
    mountLocalStrategies() {
        try {
            Jwt_1.default.init(passport_1.default);
        }
        catch (_err) {
            Log_1.default.error(_err.stack);
        }
    }
    isAuthenticated(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        return res.redirect('/login');
    }
    isAuthorized(req, res, next) {
        const provider = req.path.split('/').slice(-1)[0];
        // @ts-ignore
        const token = req.user.tokens.find((token) => token.kind === provider);
        if (token) {
            return next();
        }
        else {
            return res.redirect(`/auth/${provider}`);
        }
    }
    authenticateJWT(req, res, next) {
        return passport_1.default.authenticate('jwt', function (err, user, info) {
            if (err) {
                return res.status(401).json((0, ResponseApi_1.error)((info === null || info === void 0 ? void 0 : info.message) ? info.message : '', {}, res.statusCode));
            }
            if (!user) {
                return res.status(401).json((0, ResponseApi_1.error)((info === null || info === void 0 ? void 0 : info.message) ? info.message : '', {}, res.statusCode));
            }
            else {
                req.user = user;
                return next();
            }
        })(req, res, next);
    }
}
exports.default = new Passport();
//# sourceMappingURL=Passport.js.map