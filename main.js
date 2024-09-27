"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const telegram_1 = require("telegram");
const sessions_1 = require("telegram/sessions");
const readline_1 = __importDefault(require("readline"));
const events_1 = require("telegram/events");
const apiId = 18459008;
const apiHash = "8f6a5ad804fab5dd9fc91a74ad3f2687";
//const stringSession = new StringSession("1AgAOMTQ5LjE1NC4xNjcuNDEBu3SrPoWNz1JByip++Mj+WYFTgL9xUaof/rOrl9dZdZu/3aZ2BQgmdW3Ogku6owni822WamqKoQQhEjEvTeEkZqekkZB1ytklNGwoEZhoQHGXP/8yij0qTBj3cSHuFI1n3v6ZbdPy18RsCD4/wYicOdiLevD346FY7pfdlGSV6kKmxWp/SfcSMT9cVQj9qSvwRrzEm74nJg02RcL2Wf0wcX1ejFDzUGpyy8Zh09mp0wRYONlPp1zqbNdRgYNN8nd8JSBNKpnnBDR37E7t25ISdFUbAoyHTh5k2DFGPPSVeOSk9YRfTlAPESPppifQW/n6EapWV5oNBk2K4aC+VzcPyMc=");
const storeSession = new sessions_1.StoreSession("folder_name");
const keywords = ["hi", "hello", "привет"];
const rl = readline_1.default.createInterface({
    input: process.stdin,
    output: process.stdout,
});
const client = new telegram_1.TelegramClient(storeSession, apiId, apiHash, {
    connectionRetries: 5,
});
async function handleIncomingMessage(event) {
    console.log(event);
    const messageText = event.message.text; // Получаем текст сообщения
    console.log("New message received: ", messageText);
    // Проверяем наличие ключевых слов в сообщении
    if (keywords.some(keyword => messageText.includes(keyword))) {
        console.log("Message contains a keyword!");
        // Можно добавить логику ответа на сообщение
        await client.sendMessage("me", { message: "Detected keyword in message!" });
    }
}
async function main() {
    console.log("Loading interactive example...");
    await client.start({
        phoneNumber: async () => new Promise((resolve) => rl.question("Please enter your number: ", resolve)),
        password: async () => new Promise((resolve) => rl.question("Please enter your password: ", resolve)),
        phoneCode: async () => new Promise((resolve) => rl.question("Please enter the code you received: ", resolve)),
        onError: (err) => console.log(err),
    });
    console.log("You should now be connected.");
    client.session.save();
    await client.sendMessage("me", { message: "Hello World!" });
    client.addEventHandler(handleIncomingMessage, new events_1.NewMessage({ incoming: true }));
}
main()
    .then()
    .catch(console.error);
