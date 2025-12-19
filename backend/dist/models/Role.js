"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Role = exports.RoleType = void 0;
const mongoose_1 = require("mongoose");
var RoleType;
(function (RoleType) {
    RoleType["admin"] = "admin";
    RoleType["sadmin"] = "sadmin";
    RoleType["smdl"] = "smdl";
    RoleType["mdl"] = "mdl";
    RoleType["dl"] = "dl";
    RoleType["user"] = "user";
})(RoleType = exports.RoleType || (exports.RoleType = {}));
const RoleSchema = new mongoose_1.Schema({
    role: { type: String, enum: RoleType },
    name: String,
});
const Role = (0, mongoose_1.model)('Role', RoleSchema);
exports.Role = Role;
//# sourceMappingURL=Role.js.map