"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sportsApi = void 0;
const axios_1 = __importDefault(require("axios"));
exports.sportsApi = axios_1.default.create({
    baseURL: `${process.env.SUPER_NODE_URL}api/`,
    timeout: 50000,
    headers: {
        'Content-Type': 'application/json',
    },
});
//# sourceMappingURL=api.js.map