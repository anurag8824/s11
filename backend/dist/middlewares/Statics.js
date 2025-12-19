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
const path = __importStar(require("path"));
const express = __importStar(require("express"));
const Log_1 = __importDefault(require("./Log"));
class Statics {
    static mount(_express) {
        Log_1.default.info("Booting the 'Statics' middleware...");
        // Loads Options
        const options = { maxAge: 31557600000 };
        // Load Statics
        _express.use('/', express.static(path.join(__dirname, '../../public'), options));
        _express.use('/uploads', express.static(path.join(__dirname, '../../uploads')));
        _express.use('/uploads-settings', express.static(path.join(__dirname, '../../uploads-settings')));
        // Load NPM Statics
        _express.use('/vendor', express.static(path.join(__dirname, '../../node_modules'), options));
        return _express;
    }
}
exports.default = Statics;
//# sourceMappingURL=Statics.js.map