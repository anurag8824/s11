"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Handler_1 = __importDefault(require("../exception/Handler"));
const Http_1 = __importDefault(require("../middlewares/Http"));
const Kernel_1 = __importDefault(require("../middlewares/Kernel"));
const routes_1 = require("../routes");
const Locals_1 = __importDefault(require("./Locals"));
class Express {
    /**
     * Initializes the express server
     */
    constructor() {
        this.express = (0, express_1.default)();
        this.mountDotEnv();
        this.mountMiddlewares();
        this.routes();
    }
    mountDotEnv() {
        this.express = Locals_1.default.init(this.express);
    }
    /**
     * Mounts all the defined middlewares
     */
    mountMiddlewares() {
        this.express = Kernel_1.default.init(this.express);
    }
    /**
     * Starts the express server
     */
    init() {
        const port = Locals_1.default.config().port;
        const portHttps = Locals_1.default.config().portHttps;
        // Registering Exception / Error Handlers
        this.express.use(Handler_1.default.logErrors);
        this.express.use(Handler_1.default.clientErrorHandler);
        this.express.use(Handler_1.default.errorHandler);
        this.express = Handler_1.default.notFoundHandler(this.express);
        // const options = {
        //   key: readFileSync(path.resolve('certificate/cert.key')),
        //   cert: readFileSync(path.resolve('certificate/cert.pem')),
        // }
        // const server = createServer(options, this.express)
        // @ts-ignore
        // Start the server on the specified port
        this.express
            .listen(port, () => {
            return console.log('\x1b[33m%s\x1b[0m', `Server :: Running @ 'http://localhost:${port}'`);
        })
            .on('error', (_error) => {
            return console.log('Error: ', _error.message);
        });
        // server
        //   .listen(portHttps, () => {
        //     return console.log('\x1b[33m%s\x1b[0m', `Server :: Running @ 'http://localhost:${port}'`)
        //   })
        //   .on('error', (_error) => {
        //     return console.log('Error: ', _error.message)
        //   })
    }
    routes() {
        this.express.use(routes_1.routes);
        this.express.use(Http_1.default.postMiddleware);
    }
}
/** Export the express module */
exports.default = new Express();
//# sourceMappingURL=Express.js.map