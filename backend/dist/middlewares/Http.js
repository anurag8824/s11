"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const compression_1 = __importDefault(require("compression"));
const Log_1 = __importDefault(require("./Log"));
const Locals_1 = __importDefault(require("../providers/Locals"));
const Passport_1 = __importDefault(require("../passport/Passport"));
const express = __importStar(require("express"));
const express_validator_1 = require("express-validator");
const ResponseApi_1 = require("../util/ResponseApi");
const Role_1 = require("../models/Role");
const maintenance_1 = require("../util/maintenance");
class Http {
    static mount(_express) {
        Log_1.default.info("Booting the 'HTTP' middleware...");
        // Enables the request body parser
        _express.use(express.json({
            limit: Locals_1.default.config().maxUploadLimit,
        }));
        _express.use(express.urlencoded({
            limit: Locals_1.default.config().maxUploadLimit,
            parameterLimit: Locals_1.default.config().maxParameterLimit,
            extended: false,
        }));
        // Disable the x-powered-by header in response
        _express.disable('x-powered-by');
        // Enables the CORS
        _express.use((0, cors_1.default)());
        // Enables the "gzip" / "deflate" compression for response
        _express.use((0, compression_1.default)());
        // Loads the passport configuration
        _express = Passport_1.default.mountPackage(_express);
        return _express;
    }
    static validateRequest(req, res, next) {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            const errorObject = {};
            errors.array().map((err) => {
                errorObject[err.param] = err.msg;
            });
            return res.status(400).json((0, ResponseApi_1.validation)(errorObject));
        }
        next();
    }
    static adminUserRequest(req, res, next) {
        const user = req.user;
        if (!user) {
            return res.status(400).json((0, ResponseApi_1.error)('You are not authrized'));
        }
        else if (user.role !== Role_1.RoleType.admin && user.role !== Role_1.RoleType.sadmin) {
            return res.status(400).json((0, ResponseApi_1.error)('You are not authrized'));
        }
        next();
    }
    static maintenance(req, res, next) {
        const user = req.user;
        if (user && user.role !== Role_1.RoleType.admin) {
            const message = (0, maintenance_1.checkMaintenance)();
            if (message) {
                return res.status(401).json((0, ResponseApi_1.error)(message.message, { maintenance: true }));
            }
        }
        next();
    }
}
Http.postMiddleware = (req, res, next) => {
    const originalJson = res.json;
    // @ts-ignore
    res.json = function (data) {
        const user = req.user;
        if (user)
            data.changePassAndTxn = user.changePassAndTxn;
        originalJson.call(this, data);
    };
    next();
};
exports.default = Http;
//# sourceMappingURL=Http.js.map