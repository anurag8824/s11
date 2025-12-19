"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CallbackRoutes = void 0;
const express_1 = require("express");
const CasCallbackController_1 = require("../controllers/CasCallbackController");
class CallbackRoutes {
    constructor() {
        this.casCallBackController = new CasCallbackController_1.CasCallbackController();
        this.router = (0, express_1.Router)();
        this.routes();
    }
    routes() {
        this.router.post('/get-balance', this.casCallBackController.getbalance);
        this.router.post('/get-bet-request', this.casCallBackController.getBetrequest);
        this.router.post('/get-win-request', this.casCallBackController.getCreditRequest);
    }
}
exports.CallbackRoutes = CallbackRoutes;
//# sourceMappingURL=intcasino.js.map