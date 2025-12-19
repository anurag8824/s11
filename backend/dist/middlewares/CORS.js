"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const Log_1 = __importDefault(require("./Log"));
class CORS {
    mount(_express) {
        Log_1.default.info("Booting the 'CORS' middleware...");
        const options = {
            origin: '*',
            optionsSuccessStatus: 200, // Some legacy browsers choke on 204
        };
        _express.use((0, cors_1.default)(options));
        return _express;
    }
}
exports.default = new CORS();
//# sourceMappingURL=CORS.js.map