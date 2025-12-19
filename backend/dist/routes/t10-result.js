"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.T10ResultRoutes = void 0;
const express_1 = require("express");
const T10ResultController_1 = require("../controllers/T10ResultController");
class T10ResultRoutes {
    constructor() {
        this.T10ResultController = new T10ResultController_1.T10ResultController();
        this.router = (0, express_1.Router)();
        this.routes();
    }
    routes() {
        this.router.get('/set-t10-fancy-over-run-result', this.T10ResultController.fancyOverRunResult);
    }
}
exports.T10ResultRoutes = T10ResultRoutes;
//# sourceMappingURL=t10-result.js.map