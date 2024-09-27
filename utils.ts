import {Api} from "telegram";
import {Entity} from "telegram/define";
import * as path from "node:path";
import * as fs from "node:fs";
import {Chat, User} from "./model";

export let keywords: string[] = [];
export let ignores: User[] = [];
export let chats: Chat[] = [];

export function isApiUser(entity: Entity | undefined): entity is Api.User {
    return entity ? entity.className === "User" : false;
}

export function isApiChat(entity: Entity | undefined): entity is Api.Chat {
    return entity ? entity.className === "Chat" : false;
}

export function isApiChannel(entity: Entity | undefined): entity is Api.Channel {
    return entity ? entity.className === "Channel" : false;
}

export function isApiDialogs(entity: Api.messages.TypeDialogs | undefined): entity is Api.messages.Dialogs {
    return entity ? entity.className === "messages.Dialogs" : false;
}

const keywordsFilePath = path.join(__dirname, "keywords.json");

export function readKeywordsFile(): string[] {
    if (!fs.existsSync(keywordsFilePath)) {
        return []; // Если файл не существует, возвращаем пустой массив
    }

    const fileData = fs.readFileSync(keywordsFilePath, 'utf-8');
    try {
        return JSON.parse(fileData);
    } catch (error) {
        console.error('Ошибка при чтении JSON:', error);
        return [];
    }
}

function writeKeywordsFile(data: string[]): void {
    fs.writeFileSync(keywordsFilePath, JSON.stringify(data, null, 4), 'utf-8');
}

// Добавление ключевого слова в массив
export function addKeyword(newElement: string): boolean {
    if (!keywords.includes(newElement)) {
        keywords.push(newElement); // Добавляем элемент, если его нет в массиве
        writeKeywordsFile(keywords); // Синхронизируем с файлом
        console.log(`Ключевое слово "${newElement}" добавлено в массив.`);
        return true;
    } else {
        console.log(`Ключевое слово "${newElement}" уже существует в массиве.`);
        return false;
    }
}

// Удаление ключевого слова из массива
export function removeKeyword(elementToRemove: string): boolean {
    if (keywords.includes(elementToRemove)) {
        const index = keywords.indexOf(elementToRemove);
        if (index > -1) {
            keywords.splice(index, 1); // Удаляем элемент из массива
            writeKeywordsFile(keywords); // Синхронизируем с файлом
            console.log(`Ключевое слово "${elementToRemove}" удалено из массива.`);
            return true;
        }
        return false;
    } else {
        console.log(`Ключевое слово "${elementToRemove}" не найдено в массиве.`);
        return false;
    }
}


const usersFilePath = path.join(__dirname, "users.json");

// Чтение файла пользователей
export function readUsersFile(): User[] {
    if (!fs.existsSync(usersFilePath)) {
        return []; // Если файл не существует, возвращаем пустой массив
    }

    const fileData = fs.readFileSync(usersFilePath, 'utf-8');
    try {
        return JSON.parse(fileData);
    } catch (error) {
        console.error('Ошибка при чтении JSON:', error);
        return [];
    }
}

// Запись в файл пользователей
function writeUsersFile(data: User[]): void {
    fs.writeFileSync(usersFilePath, JSON.stringify(data, null, 4), 'utf-8');
}

// Добавление пользователя в массив игнорируемых
export function addUser(newUser: User): boolean {
    if (!ignores.some(user => user.id === newUser.id)) {
        ignores.push(newUser); // Добавляем пользователя, если его нет в массиве
        writeUsersFile(ignores); // Синхронизируем с файлом
        console.log(`Пользователь "${newUser.name}" добавлен в игнор-лист.`);
        return true;
    } else {
        console.log(`Пользователь с ID "${newUser.id}" уже существует в игнор-листе.`);
        return false;
    }
}

// Удаление пользователя из массива игнорируемых
export function removeUser(userId: number): boolean {
    if (ignores.some(user => user.id === userId)) {
        const index = ignores.findIndex(user => user.id === userId);
        if (index > -1) {
            ignores.splice(index, 1); // Удаляем пользователя из массива
            writeUsersFile(ignores); // Синхронизируем с файлом
            console.log(`Пользователь с ID "${userId}" удален из игнор-листа.`);
            return true;
        }
        return false;
    } else {
        console.log(`Пользователь с ID "${userId}" не найден в игнор-листе.`);
        return false;
    }
}

const chatsFilePath = path.join(__dirname, "chats.json");

// Чтение файла чатов
export function readChatsFile(): Chat[] {
    if (!fs.existsSync(chatsFilePath)) {
        return []; // Если файл не существует, возвращаем пустой массив
    }

    const fileData = fs.readFileSync(chatsFilePath, 'utf-8');
    try {
        return JSON.parse(fileData);
    } catch (error) {
        console.error('Ошибка при чтении JSON:', error);
        return [];
    }
}

// Запись в файл чатов
function writeChatsFile(data: Chat[]): void {
    fs.writeFileSync(chatsFilePath, JSON.stringify(data, null, 4), 'utf-8');
}

// Добавление чата в массив
export function addChat(newChat: Chat): boolean {
    if (!chats.some(chat => chat.id === newChat.id)) {
        chats.push(newChat); // Добавляем чат, если его нет в массиве
        writeChatsFile(chats); // Синхронизируем с файлом
        console.log(`Чат "${newChat.name}" добавлен в массив.`);
        return true;
    } else {
        console.log(`Чат с ID "${newChat.id}" уже существует в массиве.`);
        return false;
    }
}

// Удаление чата из массива
export function removeChat(chatId: number): boolean {
    if (chats.some(chat => chat.id === chatId)) {
        const index = chats.findIndex(chat => chat.id === chatId);
        if (index > -1) {
            chats.splice(index, 1); // Удаляем чат из массива
            writeChatsFile(chats); // Синхронизируем с файлом
            console.log(`Чат с ID "${chatId}" удален из массива.`);
            return true;
        }

        return false;
    } else {
        console.log(`Чат с ID "${chatId}" не найден в массиве.`);
        return false;
    }
}

// Функция для инициализации данных из файлов
export function initializeData(): void {
    // Загрузка ключевых слов из файла
    keywords = readKeywordsFile();
    console.log(`Ключевые слова загружены: ${keywords.length} элементов.`);

    // Загрузка игнор-листа из файла
    ignores = readUsersFile();
    console.log(`Пользователи из игнор-листа загружены: ${ignores.length} пользователей.`);

    // Загрузка чатов из файла
    chats = readChatsFile();
    console.log(`Чаты загружены: ${chats.length} чатов.`);
}

export function trimBrackets(text: string): string {
    const start = text.indexOf("[") + 1
    const end = text.lastIndexOf("]")
    return text.substring(start, end).trim()
}

/*const keywordsFilePath = path.join(__dirname, "keywords.json");

export function readKeywordsFile(): string[] {
    if (!fs.existsSync(keywordsFilePath)) {
        return []; // Если файл не существует, возвращаем пустой массив
    }

    const fileData = fs.readFileSync(keywordsFilePath, 'utf-8');
    try {
        return JSON.parse(fileData);
    } catch (error) {
        console.error('Ошибка при чтении JSON:', error);
        return [];
    }
}

function writeKeywordsFile(data: string[]): void {
    fs.writeFileSync(keywordsFilePath, JSON.stringify(data, null, 4), 'utf-8');
}

export function addKeyword(newElement: string): boolean {
    const data = readKeywordsFile();
    if (!data.includes(newElement)) {
        data.push(newElement); // Добавляем элемент, если его нет в массиве
        writeKeywordsFile(data);
        console.log(`Элемент "${newElement}" добавлен.`);
        return true;
    } else {
        console.log(`Элемент "${newElement}" уже существует.`);
        return false;
    }
}

export function removeKeyword(elementToRemove: string): boolean {
    let data = readKeywordsFile();
    if (data.includes(elementToRemove)) {
        data = data.filter(item => item !== elementToRemove); // Удаляем элемент
        writeKeywordsFile(data);
        console.log(`Элемент "${elementToRemove}" удален.`);
        return true;
    } else {
        console.log(`Элемент "${elementToRemove}" не найден.`);
        return false;
    }
}

const usersFilePath = path.join(__dirname, "users.json");

// Чтение файла пользователей
export function readUsersFile(): User[] {
    if (!fs.existsSync(usersFilePath)) {
        return []; // Если файл не существует, возвращаем пустой массив
    }

    const fileData = fs.readFileSync(usersFilePath, 'utf-8');
    try {
        return JSON.parse(fileData);
    } catch (error) {
        console.error('Ошибка при чтении JSON:', error);
        return [];
    }
}

// Запись в файл пользователей
function writeUsersFile(data: User[]): void {
    fs.writeFileSync(usersFilePath, JSON.stringify(data, null, 4), 'utf-8');
}

// Добавление пользователя
export function addUser(newUser: User): boolean {
    const data = readUsersFile();
    if (!data.some(user => user.id === newUser.id)) {
        data.push(newUser); // Добавляем пользователя, если его нет в массиве
        ignores.push(newUser)
        writeUsersFile(data);
        console.log(`Пользователь "${newUser.name}" добавлен.`);
        return true;
    } else {
        console.log(`Пользователь с ID "${newUser.id}" уже существует.`);
        return false;
    }
}

// Удаление пользователя
export function removeUser(userId: number): boolean {
    let data = readUsersFile();
    if (data.some(user => user.id === userId)) {
        data = data.filter(user => user.id !== userId); // Удаляем пользователя по ID
        writeUsersFile(data);
        console.log(`Пользователь с ID "${userId}" удален.`);
        return true;
    } else {
        console.log(`Пользователь с ID "${userId}" не найден.`);
        return false;
    }
}

const chatsFilePath = path.join(__dirname, "chats.json");

// Чтение файла чатов
export function readChatsFile(): Chat[] {
    if (!fs.existsSync(chatsFilePath)) {
        return []; // Если файл не существует, возвращаем пустой массив
    }

    const fileData = fs.readFileSync(chatsFilePath, 'utf-8');
    try {
        return JSON.parse(fileData);
    } catch (error) {
        console.error('Ошибка при чтении JSON:', error);
        return [];
    }
}

// Запись в файл чатов
function writeChatsFile(data: Chat[]): void {
    fs.writeFileSync(chatsFilePath, JSON.stringify(data, null, 4), 'utf-8');
}

// Добавление чата
export function addChat(newChat: Chat): boolean {
    const data = readChatsFile();
    if (!data.some(chat => chat.id === newChat.id)) {
        data.push(newChat); // Добавляем чат, если его нет в массиве
        writeChatsFile(data);
        console.log(`Чат "${newChat.name}" добавлен.`);
        return true;
    } else {
        console.log(`Чат с ID "${newChat.id}" уже существует.`);
        return false;
    }
}

// Удаление чата
export function removeChat(chatId: number): boolean {
    let data = readChatsFile();
    if (data.some(chat => chat.id === chatId)) {
        data = data.filter(chat => chat.id !== chatId); // Удаляем чат по ID
        writeChatsFile(data);
        console.log(`Чат с ID "${chatId}" удален.`);
        return true;
    } else {
        console.log(`Чат с ID "${chatId}" не найден.`);
        return false;
    }
}*/