/*import OpenAI from "openai";
import {Chat} from "openai/resources";
import ChatCompletionMessageParam = Chat.ChatCompletionMessageParam;

const openai = new OpenAI({apiKey: "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"});

export async function isCurrencyExchange(text: string): Promise<boolean> {
    const messages: ChatCompletionMessageParam[] = [
        {
            role: "system",
            content: "Вы помощник, который помогает искать клиентов, которые ищут обменник валют, и отвечает только 'true' или 'false' без дополнительных пояснений.",
        },
        {
            role: "user",
            content: `Текст: "${text}"
            Вопрос: Этот человек ищет обмен валюты?
            Ответ: Пожалуйста, ответьте "true" если ищет обмен валюты, и "false" если предлагает обмен валюты.`,
        },
    ];

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: messages,
            max_tokens: 1,
            temperature: 0,
        });

        console.log(completion.choices);

        const answer = completion.choices[0].message?.content?.trim().toLowerCase();

        return answer === "true";
    } catch (e) {
        console.error(e);
        return false;
    }
}*/

