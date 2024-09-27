import Groq from "groq-sdk";

const groq = new Groq({apiKey: "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"});

export interface GroqResult {
    result: boolean;
    explanation: string;
}

export async function isCurrencyExchange(text: string): Promise<GroqResult> {
    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "Вы помощник, который отделяет людей, которые хотят обменять деньги (клиент) и обменники, которые предлагают обмен, поясни свой выбор и в конце пиши 'true', если это клиент, или 'false', если это обменник.",
                    /*content: "Вы помощник, который отвечает только 'true' или 'false' без дополнительных пояснений.",*/
                },
                {
                    role: "user",
                    content: `Текст: "${text}"
                    Вопрос: Этот человек ищет обмен валюты (клиент) или он сам обменник?.
                    Ответ: Пожалуйста, ответь, этот человек ищет обмен валюты (клиент) или он сам предлагает обмен валюты (то есть он обменник, такие обычно пишут: обменяю ваши рубли на баты, обменяю usdt на thb, хороший курс, пишут само значение курса). И в конце напиши 'true', если это клиент, или 'false', если это обменник.`,
                    /*Ответ: Пожалуйста, ответь true, если этот человек ищет обмен валюты, или false, если он предлагает обмен валюты (то есть он сам обменник, такие обычно пишут: обменяю ваши рубли на баты, обменяю usdt на thb, хороший курс, пишут само значение курса).`,*/
                },
            ],
            model: "llama3-8b-8192",
        });

        console.log(`AI: ${chatCompletion.choices[0]?.message?.content?.trim().toLowerCase()}`);
        const answer = chatCompletion.choices[0]?.message?.content?.trim().toLowerCase();

        return {
            result: answer?.includes("true") === true,
            explanation: chatCompletion.choices[0]?.message?.content || "null"
        }
    } catch (e) {
        console.error(e);
        return {
            result: false,
            explanation: `${e?.toString()}`
        };
    }
}
