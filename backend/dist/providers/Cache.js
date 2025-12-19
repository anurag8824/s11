"use strict";
/**
 * Define cache middleware
 *
 * @author Faiz A. Farooqui <faiz@geekyants.com>
 */
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
Object.defineProperty(exports, "__esModule", { value: true });
const mcache = __importStar(require("memory-cache"));
class Cache {
    /**
     * Checks for the available cached data
     * or adds if not available
     */
    cache(_duration) {
        return (req, res, next) => {
            let key = '__express__' + req.originalUrl || req.url;
            let cachedBody = mcache.get(key);
            if (cachedBody) {
                res.send(cachedBody);
            }
            else {
                // @ts-ignore
                res.sendResponse = res.send;
                // @ts-ignore
                res.send = (body) => {
                    mcache.put(key, body, _duration * 1000);
                    // @ts-ignore
                    res.sendResponse(body);
                };
                next();
            }
        };
    }
}
exports.default = new Cache();
//# sourceMappingURL=Cache.js.map