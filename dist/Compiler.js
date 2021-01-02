"use strict";
/**
 * cc-compiler - Compiler.ts
 * The main compiler
 *
 * Author: Carl Ian Voller
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var event_emitter_es6_1 = __importDefault(require("event-emitter-es6"));
var child_process_1 = require("child_process");
var node_pty_1 = require("node-pty");
var langList_json_1 = __importDefault(require("./langList.json"));
var util_1 = require("util");
var Compiler = /** @class */ (function (_super) {
    __extends(Compiler, _super);
    /**
     * Creates a compiler instance.
     * @param {CompilerOptions} opts - Options object
     * @param {Number} opts.langNum - Index of Language to compile file in
     * @param {String} opts.mainFile - File to execute on compilation
     * @param {String} opts.pathToFiles - Absolute path to location of files
     * @param {String} opts.containerName	- Name of docker container
     * @param {String} opts.folderName (OPTIONAL) - Name of folder where files are stored within the container. If left blank, "code" is used instead.
     */
    function Compiler(opts) {
        var _this = _super.call(this) || this;
        // Parameter checks
        if ((!opts.langNum && opts.langNum !== 0) || typeof opts.langNum !== "number")
            throw "Required param 'langNum' missing or invalid.";
        if (!opts.mainFile || typeof opts.mainFile !== "string")
            throw "Required param 'mainFile' missing or invalid.";
        if (!opts.pathToFiles || typeof opts.pathToFiles !== "string")
            throw "Required param 'pathToFiles' missing or invalid.";
        if (!opts.containerName || typeof opts.containerName !== "string")
            throw "Required param 'containerName' missing or invalid.";
        _this.opts = opts;
        _this.folderName = opts.folderName || "code";
        return _this;
    }
    /**
     * Compilation function
     */
    Compiler.prototype.exec = function () {
        var _this = this;
        var runner = langList_json_1.default[this.opts.langNum];
        child_process_1.exec("chmod -R 777 " + this.opts.pathToFiles + ";chown -R cc-user:cc-user /usercode");
        // Arguments for docker run command
        var args = ["run", "--rm", "--name", this.opts.containerName, "-e", "TERM=xterm-256color", "--cpus=0.25", "--memory=200m",
            "-itv", this.opts.pathToFiles + ":/usercode/" + this.opts.folderName, "--workdir", "/usercode/" + this.opts.folderName, "cc-compiler", "/bin/bash"];
        // Creates a pseudo-tty shell (For colours, arrow keys and other basic terminal functionalities)
        this.process = node_pty_1.spawn("docker", args, { name: 'xterm-256color', cols: 32, rows: 200 });
        // Used for certain step2 commands
        var _ = this.opts.mainFile.split(".");
        _.pop();
        var fileWithoutExt = _.join(".");
        // Handles automatic terminal logic such as sending run commands
        var arrow = "\u001b[1;3;31m>> \u001b[0m", step1 = runner[0] + " " + this.opts.mainFile + "\r", step2 = runner[1] ? runner[1].replace("{}", fileWithoutExt) + "\r" : "", sentStep1 = false, sentStep2 = !step2; // If there isn't a step2 command, we assume it has already been sent
        // Handles terminal output and stdin
        this.process.onData(function (e) { return __awaiter(_this, void 0, void 0, function () {
            var e_1;
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        this.emit("inc", { out: e });
                        if (!e.includes(arrow)) return [3 /*break*/, 5];
                        if (!sentStep1) {
                            sentStep1 = !0;
                            return [2 /*return*/, (_a = this.process) === null || _a === void 0 ? void 0 : _a.write(step1)];
                        }
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, util_1.promisify(child_process_1.exec)("docker top " + this.opts.containerName + " | grep '" + (sentStep1 && !sentStep2 ? step1 : step2) + "'")];
                    case 2:
                        _d.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _d.sent();
                        if (!sentStep2) {
                            sentStep2 = !0;
                            return [2 /*return*/, (_b = this.process) === null || _b === void 0 ? void 0 : _b.write(step2)];
                        }
                        return [2 /*return*/, child_process_1.exec("docker rm -f " + this.opts.containerName)];
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        // Undo any stdin writen between steps if there is a step2.
                        if (!sentStep2 && sentStep1) {
                            return [2 /*return*/, (_c = this.process) === null || _c === void 0 ? void 0 : _c.write(String.fromCharCode(127))];
                        }
                        _d.label = 6;
                    case 6: return [2 /*return*/];
                }
            });
        }); });
        var isLaunched = false, // Has the docker container started
        sentDone = false; // Has the "done" event been emitted, if so, don't send another one.
        this.checkInterval = setInterval(function () {
            // Check if docker container is still running
            child_process_1.exec("docker ps | grep " + _this.opts.containerName, function (_, out) {
                // Checks if docker container has been launched. If so, emit launched event.
                if (out && !isLaunched) {
                    isLaunched = !0;
                    _this.emit("launched");
                    return;
                }
                // Timeout code execution after one minute.
                var timedOut = out.indexOf("minute") > -1;
                if (((!out && isLaunched) || timedOut) && !sentDone) {
                    _this.emit("done", { out: "", timedOut: timedOut });
                    sentDone = true;
                    return _this._cleanUp();
                }
            });
        }, 500);
    };
    /**
     * Handles STDIN to the running program.
     * @param {string} text - Text to push to the program
     */
    Compiler.prototype.push = function (text) {
        var _a;
        try {
            (_a = this.process) === null || _a === void 0 ? void 0 : _a.write(text);
        }
        catch (e) {
            console.warn(e);
        }
    };
    // Stops compilation and kills the docker process
    Compiler.prototype.stop = function () {
        var _this = this;
        var _a;
        try {
            (_a = this.process) === null || _a === void 0 ? void 0 : _a.kill("1");
        }
        catch (e) {
            console.warn(e);
        } // Kill processes
        setTimeout(function () { return child_process_1.exec("docker rm -f " + _this.opts.containerName); }, 200); // Remove docker container
    };
    // Resizes pseudo-tty
    Compiler.prototype.resize = function (_a) {
        var _b;
        var cols = _a.cols, rows = _a.rows;
        try {
            (_b = this.process) === null || _b === void 0 ? void 0 : _b.resize(cols, rows);
        }
        catch (e) {
            console.warn(e);
        }
    };
    // Cleans up after compilation ends.
    Compiler.prototype._cleanUp = function () {
        var _a;
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
        }
        try {
            (_a = this.process) === null || _a === void 0 ? void 0 : _a.kill("1");
        }
        catch (e) { }
    };
    return Compiler;
}(event_emitter_es6_1.default));
exports.default = Compiler;
