"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mondayClient = void 0;
const monday_sdk_js_1 = __importDefault(require("monday-sdk-js"));
class MondayClient {
    constructor() {
        this.monday = (0, monday_sdk_js_1.default)();
    }
    static getInstance() {
        if (!MondayClient.instance) {
            MondayClient.instance = new MondayClient();
        }
        return MondayClient.instance;
    }
    setToken(token) {
        this.monday.setToken(token);
    }
    async makeRequest(query) {
        try {
            const response = await this.monday.api(query);
            return response.data;
        }
        catch (error) {
            console.error("Error making Monday.com request:", error);
            throw error;
        }
    }
}
exports.mondayClient = MondayClient.getInstance();
