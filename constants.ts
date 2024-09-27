import {StoreSession} from "telegram/sessions/StoreSession";

export const chatId = -1002458348682;
export const chatIdWithoutPrefix = 2458348682;
export const apiId = 18459008;
export const apiHash = "8f6a5ad804fab5dd9fc91a74ad3f2687";
//const stringSession = new StringSession("1AgAOMTQ5LjE1NC4xNjcuNDEBu3SrPoWNz1JByip++Mj+WYFTgL9xUaof/rOrl9dZdZu/3aZ2BQgmdW3Ogku6owni822WamqKoQQhEjEvTeEkZqekkZB1ytklNGwoEZhoQHGXP/8yij0qTBj3cSHuFI1n3v6ZbdPy18RsCD4/wYicOdiLevD346FY7pfdlGSV6kKmxWp/SfcSMT9cVQj9qSvwRrzEm74nJg02RcL2Wf0wcX1ejFDzUGpyy8Zh09mp0wRYONlPp1zqbNdRgYNN8nd8JSBNKpnnBDR37E7t25ISdFUbAoyHTh5k2DFGPPSVeOSk9YRfTlAPESPppifQW/n6EapWV5oNBk2K4aC+VzcPyMc=");
export const storeSession = new StoreSession("folder_name");

export const commands = ["start", "chats", "chat", "remove_chat", "keywords", "keyword", "remove_keywords", "ignores", "ignore", "remove_ignore"]
/*export const keywords: string[] = [];
export const ignores: User[] = [];
export const chats: Chat[] = []*/

export const start_message = `
<b>Команды</b><br/>
<code>/start</code><br/><br/>

<b>Группы</b><br/>
<code>/chats</code> - выведет список групп<br/>
<code>/chat</code> <code>@username</code> или <code>ID</code> - добавляет чат в список по @username или ID<br/>
<code>/remove_chat</code> <code>ID</code> - удаляет чат из списка по ID<br/><br/>

<b>Ключевые слова</b><br/>
<code>/keywords</code> - выведет список ключевых слов<br/>
<code>/keyword</code> слово или словосочетание - добавляет ключевое слово в список<br/>
<code>/remove_keyword</code> слово или словосочетание - удаляет ключевое слово из списка<br/>

<b>Игнор</b><br/>
<code>/ignores</code> - выведет список пользователей из игнор списка<br/>
<code>/ignore</code> <code>ID</code> - добавляет пользователя в игнор список<br/>
<code>/remove_ignore</code> <code>ID</code> - удаляет пользователя из игнор списка<br/>
`;