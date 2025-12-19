"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiController = void 0;
const ResponseApi_1 = require("../util/ResponseApi");
class ApiController {
    success(res, obj, message = '') {
        return res.status(201).json((0, ResponseApi_1.success)(obj, message));
    }
    fail(res, err) {
        return res.status(401).json((0, ResponseApi_1.error)(err.toString()));
    }
}
exports.ApiController = ApiController;
//# sourceMappingURL=ApiController.js.map