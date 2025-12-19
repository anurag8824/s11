"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const CORS_1 = __importDefault(require("./CORS"));
const Http_1 = __importDefault(require("./Http"));
const Statics_1 = __importDefault(require("./Statics"));
const StatusMonitor_1 = __importDefault(require("./StatusMonitor"));
const Locals_1 = __importDefault(require("../providers/Locals"));
class Kernel {
    static init(_express) {
        // Check if CORS is enabled
        if (Locals_1.default.config().isCORSEnabled) {
            // Mount CORS middleware
            _express = CORS_1.default.mount(_express);
        }
        // Mount basic express apis middleware
        _express = Http_1.default.mount(_express);
        // Mount statics middleware
        _express = Statics_1.default.mount(_express);
        // Mount status monitor middleware
        _express = StatusMonitor_1.default.mount(_express);
        //Post middleware
        _express.use(Http_1.default.postMiddleware);
        return _express;
    }
}
exports.default = Kernel;
//# sourceMappingURL=Kernel.js.map