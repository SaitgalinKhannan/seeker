import {Api, TelegramClient} from "telegram";
import readline from "readline";
import {NewMessage, NewMessageEvent} from "telegram/events";
import {Entity} from "telegram/define";
import {
    isApiUser,
    isApiChannel,
    addKeyword,
    removeKeyword,
    addUser,
    removeUser,
    addChat,
    removeChat,
    initializeData,
    ignores,
    chats,
    keywords
} from "./utils";
import {apiHash, apiId, chatId, chatIdWithoutPrefix, commands, start_message, storeSession} from "./constants";
import {Chat, User} from "./model";
import {findMatches} from "./stemmer";
import {GroqResult, isCurrencyExchange} from "./groq";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const client = new TelegramClient(storeSession, apiId, apiHash, {connectionRetries: 5});

async function handleCommands(message: Api.Message) {
    const text = message.text.substring(1);

    if (text.includes("start")) {
        await message.reply({message: start_message, parseMode: "html"});
        return;
    }

    if (text.includes("ignores")) {
        const ignoresData = JSON.stringify(ignores, null, 4)
        await message.reply({message: ignoresData, parseMode: "html"});
        return;
    }

    if (text.includes("chats")) {
        const chatsData = JSON.stringify(chats, null, 4)
        await message.reply({message: chatsData, parseMode: "html"});
        return;
    }

    if (text.includes("keywords")) {
        const keywordsData = JSON.stringify(keywords, null, 4)
        await message.reply({message: keywordsData, parseMode: "html"});
        return;
    }

    if (text.includes("remove_keyword")) {
        const parts = text.split(" ");
        if (parts.length > 1) {
            const keyword = parts[1];
            const result = removeKeyword(keyword)
            if (result) {
                await message.reply({
                    message: `Ключевое слово <code>${keyword}</code> удалено из списка`,
                    parseMode: "html"
                });
            } else {
                await message.reply({
                    message: `Ключевое слово <code>${keyword}</code> не найдено в списке`,
                    parseMode: "html"
                });
            }
        } else {
            await message.reply({message: `Аргумент не найден`, parseMode: "html"});
        }
        return;
    }

    if (text.includes("keyword")) {
        const parts = text.split(" ");
        if (parts.length > 1) {
            const keyword = parts[1];
            const result = addKeyword(keyword)
            if (result) {
                await message.reply({
                    message: `Ключевое слово <code>${keyword}</code> добавлено в список`,
                    parseMode: "html"
                });
            } else {
                await message.reply({
                    message: `Ключевое слово <code>${keyword}</code> уже есть в списке`,
                    parseMode: "html"
                });
            }
        } else {
            await message.reply({message: `Аргумент не найден`, parseMode: "html"});
        }
        return;
    }

    if (text.includes("remove_ignore")) {
        const parts = text.split(" ");
        if (parts.length > 1 && !isNaN(parseInt(parts[1]))) {
            const id = parseInt(parts[1]);
            const result = removeUser(id)
            if (result) {
                await message.reply({message: `Пользователь <code>${id}</code> удален из списка`, parseMode: "html"});
            } else {
                await message.reply({message: `Пользователь <code>${id}</code> не найден в списке`, parseMode: "html"});
            }
        } else {
            await message.reply({message: `Аргумент не найден`, parseMode: "html"});
        }
        return;
    }

    if (text.includes("ignore")) {
        const id = parseInt(text.substring(6));
        console.log(id)
        try {
            if (!isNaN(id)) {
                let users: Api.TypeUser[]
                try {
                    users = await client.invoke(
                        new Api.users.GetUsers({
                            id: [id],
                        })
                    );
                } catch (e) {
                    users = []
                    console.error(e);
                }

                const user = users[0]
                let localUser: User

                if (users.length < 1 || !isApiUser(user)) {
                    /*await message.reply({message: `Ошибка, пользователь не найден`, parseMode: "html"});
                    return;*/
                    localUser = {
                        id: id,
                        name: "Отсутствует",
                        userName: "Отсутствует"
                    }
                } else {
                    localUser = {
                        id: user.id.valueOf(),
                        name: `${user.firstName} ${user.lastName}`,
                        userName: user.username || "Отсутствует"
                    }
                }

                const result = addUser(localUser)
                if (result) {
                    await message.reply({
                        message: `Пользователь <code>${id}</code> добавлено в список`,
                        parseMode: "html"
                    });
                } else {
                    await message.reply({
                        message: `Пользователь <code>${id}</code> уже есть в списке`,
                        parseMode: "html"
                    });
                }
            } else {
                await message.reply({message: `Аргумент не найден`, parseMode: "html"});
            }
        } catch (e) {
            await message.reply({message: `Ошибка, пользователь не найден!`, parseMode: "html"});
            console.error(e);
        }
        return;
    }

    if (text.includes("remove_chat")) {
        const parts = text.split(" ");
        if (parts.length > 1 && !isNaN(parseInt(parts[1]))) {
            const id = parseInt(parts[1]);
            const result = removeChat(id)
            if (result) {
                await message.reply({message: `Чат <code>${id}</code> удален из списка`, parseMode: "html"});
            } else {
                await message.reply({message: `Чат <code>${id}</code> не найден в списке`, parseMode: "html"});
            }
        } else {
            await message.reply({message: `Аргумент не найден`, parseMode: "html"});
        }

        return;
    }

    if (text.includes("chat")) {
        const parts = text.split(" ");
        if (parts.length > 1) {
            try {
                const chatIdentification = parts[1];
                const typeChats = await client.invoke(
                    new Api.channels.GetChannels({
                        id: [chatIdentification],
                    })
                );
                const channels = typeChats.chats
                const channel = typeChats.chats[0]

                if (channels.length < 1 || !isApiChannel(channel)) {
                    await message.reply({message: `Ошибка, чат не найден`, parseMode: "html"});
                    return;
                }

                if (channel.accessHash) {
                    try {
                        await client.invoke(
                            new Api.channels.JoinChannel({
                                channel: new Api.InputChannel({channelId: channel.id, accessHash: channel.accessHash}),
                            })
                        );
                    } catch (e) {
                        await message.reply({
                            message: `Не удается вступить в чат ${chatIdentification}, сделайте это вручную`,
                            parseMode: "html"
                        });
                        console.error(e)
                    }
                }

                let joined: boolean = false

                try {
                    const dialogs = await client.getDialogs()
                    const ids = dialogs.map(d => d.id)
                    if (ids.some(id => id && (channel.id === id || channel.id.toString() === id.toString().substring(4)))) {
                        joined = true
                    }
                } catch (e) {
                    console.log(e)
                }

                if (joined) {
                    let chatLink: string

                    if (channel.username) {
                        chatLink = `https://t.me/${channel.username}`
                    } else {
                        chatLink = `https://t.me/c/${channel.id.toString().includes("-100") ? channel.id.toString().substring(3) : channel.id.toString()}/2`
                    }

                    const localChat: Chat = {
                        id: channel.id.valueOf(),
                        name: `${channel.title || "Отсутствует"}`,
                        link: chatLink
                    }
                    const result = addChat(localChat)

                    if (result) {
                        await message.reply({
                            message: `Чат <code>${chatIdentification}</code> добавлен в список`,
                            parseMode: "html"
                        });
                    } else {
                        await message.reply({
                            message: `Чат <code>${chatIdentification}</code> уже есть в списке`,
                            parseMode: "html"
                        });
                    }
                } else {
                    await message.reply({
                        message: `Не удается вступить в чат ${chatIdentification}, сделайте это вручную и повторите команду заново`,
                        parseMode: "html"
                    });
                }
            } catch (e) {
                await message.reply({message: `Ошибка, чат не найден!`, parseMode: "html"});
                console.error(e);
            }
        } else {
            await message.reply({message: `Аргумент не найден`, parseMode: "html"});
        }

        return;
    }
}

async function handleKeywords(message: Api.Message, resultFromAI: GroqResult) {
    const sender: Entity | undefined = await message.getSender()
    let user: Api.User | null = null
    /*let chat: Api.Chat | null = null*/
    let channel: Api.Channel | null = null

    if (isApiUser(sender)) {
        user = sender
    }

    /*if (isApiChat(message.chat)) {
        chat = message.chat
    }*/

    if (isApiChannel(message.chat)) {
        channel = message.chat
    }

    if (user && channel) {
        let messageText = "Сообщение от пользователя:\n" +
            `<b>ID:</b> /ignore${user.id}\n` +
            `<b>Username:</b> ${user.username ? "@" + user.username : "Отсутствует"}\n` +
            `<b>Имя:</b> ${user.firstName} ${user.lastName}\n` +
            `<b>Сообщение:</b> ${message.text}\n\n` +
            `Из чата\n` +
            `<b>ID:</b> <code>${message.chatId}</code>\n`

        if (channel.username) {
            messageText += `<b>Название:</b> @${channel.username}\n` +
                `<b>Ссылка:</b> https://t.me/${channel.username}\n` +
                `<b>Ссылка на сообщение:</b> https://t.me/${channel.username}/${message.id}\n`
        } else {
            messageText += `<b>Название:</b> Отсутствует\n` +
                `<b>Ссылка:</b> https://t.me/c/${channel.id.toString().includes("-100") ? channel.id.toString().substring(3) : channel.id.toString()}/${message.id}\n` +
                `<b>Ссылка на сообщение:</b> https://t.me/c/${channel.id.toString().includes("-100") ? channel.id.toString().substring(3) : channel.id.toString()}/${message.id}\n\n`
        }

        if (resultFromAI.result) {
            messageText += `<bold>Подтверждено ИИ</bold> ✅✅✅✅✅✅✅\n\n${resultFromAI.explanation}`
        }

        await client.sendMessage(chatId, {message: messageText, parseMode: "html"})
    }
}

async function handleIncomingMessage(event: NewMessageEvent) {
    const messageText = event.message.text.trim(); // Получаем текст сообщения

    if (event.message.chat?.id.valueOf() === chatIdWithoutPrefix && commands.some(cmd => messageText.includes(cmd))) {
        await handleCommands(event.message)
        return;
    }

    const sender = await event.message.getSender()
    const isFromBlackList = ignores.some(
        user => user.id === sender?.id.valueOf() ||
            user.id.toString() === sender?.id.valueOf().toString().substring(4) ||
            user.id.toString().substring(4) === sender?.id.valueOf().toString() ||
            user.id.toString().substring(4) === sender?.id.valueOf().toString().substring(4)
    )
    const matchesCount = findMatches(messageText, keywords).length
    const isFromChats = chats.some(
        chat => chat.id === event.message.chatId?.valueOf() ||
            chat.id.toString() === event.message.chatId?.valueOf().toString().substring(4) ||
            chat.id.toString().substring(4) === event.message.chatId?.valueOf().toString() ||
            chat.id.toString().substring(4) === event.message.chatId?.valueOf().toString().substring(4)
    )
    if (matchesCount > 0 && isFromChats && !isFromBlackList) {
        const resultFromAI = await isCurrencyExchange(messageText);
        await handleKeywords(event.message, resultFromAI);
    }
}

async function main() {
    initializeData();
    console.log("Loading interactive example...");
    await client.start({
        phoneNumber: async () =>
            new Promise((resolve) =>
                rl.question("Please enter your number: ", resolve)
            ),
        password: async () =>
            new Promise((resolve) =>
                rl.question("Please enter your password: ", resolve)
            ),
        phoneCode: async () =>
            new Promise((resolve) =>
                rl.question("Please enter the code you received: ", resolve)
            ),
        onError: (err) => console.log(err),
    });
    console.log("You should now be connected.");
    client.session.save()

    await client.sendMessage("me", {message: "Hello World!"});
    client.addEventHandler(handleIncomingMessage, new NewMessage({incoming: true}))
}

main()
    .then()
    .catch(console.error);