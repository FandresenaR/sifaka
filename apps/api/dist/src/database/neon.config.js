"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.neonConfig = void 0;
const serverless_1 = require("@neondatabase/serverless");
Object.defineProperty(exports, "neonConfig", { enumerable: true, get: function () { return serverless_1.neonConfig; } });
const ws_1 = __importDefault(require("ws"));
serverless_1.neonConfig.webSocketConstructor = ws_1.default;
serverless_1.neonConfig.useSecureWebSocket = true;
serverless_1.neonConfig.pipelineConnect = "password";
//# sourceMappingURL=neon.config.js.map