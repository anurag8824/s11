"use strict";
/**
 * Primary file for your Clustered API Server
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = __importStar(require("path"));
const dotenv = __importStar(require("dotenv"));
const Express_1 = __importDefault(require("./Express"));
const Database_1 = require("./Database");
const Log_1 = __importDefault(require("../middlewares/Log"));
class App {
    // Clear the console
    clearConsole() {
        process.stdout.write('\x1B[2J\x1B[0f');
    }
    // Loads your dotenv file
    loadConfiguration() {
        Log_1.default.info('Configuration :: Booting @ Master...');
        const fileName = process.env.NODE_ENV === 'development' ? '.env' : `.env.${process.env.NODE_ENV}`;
        dotenv.config({
            path: path.join(__dirname, `../../${fileName}`),
        });
    }
    // Loads your Server
    loadServer() {
        Log_1.default.info('Server :: Booting @ Master...');
        Express_1.default.init();
    }
    // Loads the Database Pool
    loadDatabase() {
        Log_1.default.info('Database :: Booting @ Master...');
        Database_1.Database.init();
    }
}
exports.default = new App();
//# sourceMappingURL=App.js.map