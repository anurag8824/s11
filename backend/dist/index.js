"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const node_os_1 = require("node:os");
const node_cluster_1 = __importDefault(require("node:cluster"));
const App_1 = __importDefault(require("./providers/App"));
const NativeEvent_1 = __importDefault(require("./exception/NativeEvent"));
const user_socket_1 = __importDefault(require("./sockets/user-socket"));
const casino_socket_1 = __importDefault(require("./sockets/casino-socket"));
if (node_cluster_1.default.isMaster) {
    /**
     * Catches the process events
     */
    NativeEvent_1.default.process();
    /**
     * Clear the console before the app runs
     */
    App_1.default.clearConsole();
    /**
     * Load Configuration
     */
    App_1.default.loadConfiguration();
    /**
     * Find the number of available CPUS
     */
    const CPUS = (0, node_os_1.cpus)();
    /**
     * Fork the process, the number of times we have CPUs available
     */
    CPUS.forEach(() => node_cluster_1.default.fork());
    /**
     * Catches the cluster events
     */
    NativeEvent_1.default.cluster(node_cluster_1.default);
    new casino_socket_1.default();
}
else {
    /**
     * Run the Database pool
     */
    App_1.default.loadDatabase();
    /**
     * Run the Server on Clusters
     */
    App_1.default.loadServer();
    new user_socket_1.default();
}
//# sourceMappingURL=index.js.map