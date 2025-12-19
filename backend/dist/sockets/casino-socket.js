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
const axios_1 = __importDefault(require("axios"));
const socket_io_client_1 = require("socket.io-client");
class CasinoSocket {
    constructor() {
        CasinoSocket.socket = (0, socket_io_client_1.io)(process.env.CASINO_SOCKET_URL, {
            transports: ['websocket'],
        });
        CasinoSocket.socket.on('connect', () => {
            console.log(`connect casino :${CasinoSocket.socket.id}`);
            CasinoSocket.socket.emit('joinCasinoRoom', 'result');
        });
        // CasinoSocket.socket.on('result', (data) => {
        // })
        CasinoSocket.socket.on('result', (data) => __awaiter(this, void 0, void 0, function* () {
            // axios
            //   .post(`http://localhost:${process.env.PORT}/api/save-casino-match`, { data })
            //   .then(() => {
            //     if (!data.beforeResultSet) {
            //       // const resultUrl = `http://localhost:${process.env.PORT}/api/setResult/${data.gameType}`
            //       // axios.get(`${resultUrl}`).catch((err) => console.log('casino result', err.stack))
            //     }
            //   })
            //   .catch((err) => console.log('save casino match', err.stack))
            if (data.beforeResultSet) {
                const resultUrl = data.beforeResultSet
                    ? `http://localhost:${process.env.PORT}/api/setResult/${data.gameType}/${data.beforeResultSet}`
                    : `http://localhost:${process.env.PORT}/api/setResult/${data.gameType}`;
                axios_1.default.get(`${resultUrl}`).catch((err) => console.log('casino result', err.stack));
            }
        }));
    }
}
exports.default = CasinoSocket;
//# sourceMappingURL=casino-socket.js.map