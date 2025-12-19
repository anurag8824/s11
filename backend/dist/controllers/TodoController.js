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
exports.TodoController = void 0;
const child_process_1 = require("child_process");
const fs_1 = require("fs");
const promises_1 = require("fs/promises");
const path_1 = __importDefault(require("path"));
const Setting_1 = require("../models/Setting");
const ApiController_1 = require("./ApiController");
const Payments_1 = require("../models/Payments");
const mongoose_1 = require("mongoose");
class TodoController extends ApiController_1.ApiController {
    constructor() {
        super(...arguments);
        this.excuteCmd = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const pathURL = path_1.default.join(__dirname, '../../');
            (0, child_process_1.exec)(`${pathURL}excute.sh`, function (err, stdout, stderr) {
                //   // handle err, stdout, stderr
                console.log(err, stdout);
            });
            return this.success(res, { path: pathURL });
        });
        this.saveSettings = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const pathURL = path_1.default.join(__dirname, '../../');
                const { settingList } = req.body;
                const headerMessageJson = {
                    headerMessageLink: '',
                    headerMessage: '',
                };
                settingList.map((setting) => __awaiter(this, void 0, void 0, function* () {
                    if (setting.name === 'userMaintenanceMessage' && setting.active) {
                        (0, promises_1.writeFile)(`${pathURL}public/maintenance.json`, `{"message":"${setting.value}"}`, {
                            flag: 'w',
                        });
                    }
                    else if (setting.name === 'userMaintenanceMessage') {
                        if ((0, fs_1.existsSync)(`${pathURL}public/maintenance.json`)) {
                            (0, fs_1.unlinkSync)(`${pathURL}public/maintenance.json`);
                        }
                    }
                    if (setting.name === 'adminMessage' || setting.name === 'userMessage') {
                        (0, promises_1.writeFile)(`${pathURL}public/${setting.name}.json`, `{"message":"${setting.value}"}`, {
                            flag: 'w',
                        });
                    }
                    if (setting.name === 'headerMessage' || setting.name === 'headerMessageLink') {
                        headerMessageJson[setting.name] = setting.value;
                    }
                    yield Setting_1.Setting.findOneAndUpdate({ name: setting.name }, { $set: { value: setting.value, active: setting.active } });
                }));
                if (headerMessageJson.headerMessage) {
                    (0, promises_1.writeFile)(`${pathURL}public/headerMessage.json`, JSON.stringify(headerMessageJson), {
                        flag: 'w',
                    });
                }
                return this.success(res, {}, 'Setting Saved');
            }
            catch (e) {
                return this.fail(res, e.message);
            }
        });
        this.savepaymentSettings = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const pathURL = path_1.default.join(__dirname, '../../');
                const user = req.user;
                const { settingList } = req.body;
                const hostName = user === null || user === void 0 ? void 0 : user._id;
                console.log(req.files, " req.files req.files");
                //@ts-expect-error
                let files = (_a = req.files) === null || _a === void 0 ? void 0 : _a.reduce((acc, file) => {
                    acc[file.fieldname] = file.path;
                    return acc;
                }, {});
                console.log(files);
                let settingsData = yield Payments_1.Payment.find({
                    $or: [
                        { userId: { $in: hostName } },
                        { userId: mongoose_1.Types.ObjectId("63382d9bfbb3a573110c1ba5") } // Matches static ID
                    ]
                });
                console.log(settingsData, "settingsData");
                settingsData = settingsData.reduce((acc, setting) => {
                    acc[setting.name] = setting;
                    return acc;
                });
                console.log(settingsData);
                settingList.map((setting, index) => __awaiter(this, void 0, void 0, function* () {
                    if (setting.inputType === 'file') {
                        const oldFile = settingsData[setting.name].value;
                        if (files[`settingList[${index}][${setting.name}-file]`]) {
                            setting['value'] = files[`settingList[${index}][${setting.name}-file]`];
                            const filePath = path_1.default.join(pathURL, oldFile);
                            if ((0, fs_1.existsSync)(filePath) && oldFile) {
                                (0, fs_1.unlinkSync)(filePath);
                            }
                        }
                        else {
                            setting['value'] = oldFile;
                        }
                    }
                    console.log(hostName);
                    console.log(setting);
                    yield Payments_1.Payment.findOneAndUpdate({ name: setting.name, userId: hostName }, {
                        $set: {
                            value: setting.value,
                            active: setting.active || null,
                            name: setting.name,
                            label: setting.label,
                            userId: hostName,
                            inputType: setting === null || setting === void 0 ? void 0 : setting.inputType
                        },
                    }, {
                        upsert: true,
                        new: true, // Return the new document after update/insert
                    });
                }));
                return this.success(res, {}, 'Setting Saved');
            }
            catch (e) {
                return this.fail(res, e.message);
            }
        });
        this.settingsList = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const settings = yield Setting_1.Setting.find({});
            return this.success(res, { settings });
        });
        this.paymentSettingsList = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const userinfo = req.user;
            let settings = yield Payments_1.Payment.find({ userId: userinfo === null || userinfo === void 0 ? void 0 : userinfo._id });
            if (settings.length <= 0) {
                let settingsData = [];
                let settingsCommon = yield Payments_1.Payment.find({ userId: mongoose_1.Types.ObjectId("63382d9bfbb3a573110c1ba5") });
                settingsCommon.map((setting) => {
                    setting.value = "";
                    settingsData.push(setting);
                });
                settings = settingsData;
            }
            return this.success(res, { settings });
        });
        this.getSettingList = (req, res) => __awaiter(this, void 0, void 0, function* () {
            let settings = yield Setting_1.Setting.find({});
            const settingsData = {};
            //@ts-expect-error
            settings.map((setting) => {
                settingsData[setting.name] = setting.value;
            });
            return this.success(res, { settings: settingsData });
        });
        this.getUserSettingList = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const userinfo = req.user;
            console.log(userinfo);
            let settiddngs = yield Payments_1.Payment.find({ userId: userinfo === null || userinfo === void 0 ? void 0 : userinfo.parentId });
            if (settiddngs.length <= 0) {
                settiddngs = yield Payments_1.Payment.find({ userId: mongoose_1.Types.ObjectId("63382d9bfbb3a573110c1ba5") });
            }
            console.log(settiddngs);
            const settingsData = {};
            //@ts-expect-error
            settiddngs.map((setting) => {
                settingsData[setting.name] = setting.value;
            });
            if (settiddngs.length <= 0) {
            }
            return this.success(res, { settings: settingsData });
        });
    }
}
exports.TodoController = TodoController;
//# sourceMappingURL=TodoController.js.map