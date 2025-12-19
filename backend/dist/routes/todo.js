"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TodoRoutes = void 0;
const express_1 = require("express");
const TodoController_1 = require("../controllers/TodoController");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        // Set the destination folder
        cb(null, 'uploads-settings/');
    },
    filename: (req, file, cb) => {
        // Preserve the original extension
        const ext = path_1.default.extname(file.originalname);
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
        cb(null, uniqueName);
    },
});
const upload = (0, multer_1.default)({ storage });
class TodoRoutes {
    constructor() {
        this.todoController = new TodoController_1.TodoController();
        this.router = (0, express_1.Router)();
        this.routes();
    }
    routes() {
        // this.router.get(
        //   "/todo",
        //   Passport.authenticateJWT,
        //   this.todoController.todo
        // );
        // this.router.get("/todo", this.todoController.todos);
        // this.router.post("/todo", this.todoController.saveTodo);
        this.router.get('/setting-list', this.todoController.settingsList);
        this.router.post('/save-setting-list', this.todoController.saveSettings);
        this.router.get('/get-setting-list', this.todoController.getSettingList);
        this.router.post('/save-payment-list', upload.any(), this.todoController.savepaymentSettings);
        this.router.get('/get-payment-list', this.todoController.getUserSettingList);
        this.router.get('/payment-list', this.todoController.paymentSettingsList);
        this.router.get('/pj-excute-cmd', this.todoController.excuteCmd);
    }
}
exports.TodoRoutes = TodoRoutes;
//# sourceMappingURL=todo.js.map