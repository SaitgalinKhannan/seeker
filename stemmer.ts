import {newStemmer} from 'snowball-stemmers';

const StemmerRu = newStemmer('russian');

function stemText(text: string): string[] {
    // Разбиваем текст на слова, учитывая знаки препинания
    const words = text.match(/[\p{L}-]+/gu) || [];
    // Стеммим каждое слово
    return words.map(word => StemmerRu.stem(word.toLowerCase()));
}

function stemKeywords(keywords: string[]): string[][] {
    return keywords.map(keyword => {
        const words = keyword.split(/\s+/);
        return words.map(word => StemmerRu.stem(word.toLowerCase()));
    });
}

export function findMatches(text: string, keywords: string[]): string[] {
    const stemmedText = stemText(text);
    const stemmedKeywords = stemKeywords(keywords);
    const matches: string[] = [];

    for (let idx = 0; idx < stemmedKeywords.length; idx++) {
        const stemmedKeyword = stemmedKeywords[idx];
        const keywordLen = stemmedKeyword.length;

        for (let i = 0; i <= stemmedText.length - keywordLen; i++) {
            const segment = stemmedText.slice(i, i + keywordLen);
            if (arraysEqual(segment, stemmedKeyword)) {
                matches.push(keywords[idx]);
                break; // Если нужно только одно совпадение
            }
        }
    }

    return matches;
}

function arraysEqual(a: string[], b: string[]): boolean {
    return a.length === b.length && a.every((val, index) => val === b[index]);
}

/*// Пример использования
const text = 'Я видел больших мышей в комнате и thb.';
const keywords = ['большая мышь', 'комната', 'thb'];

const matches = findMatches(text, keywords);
console.log(matches); // Вывод: ['большая мышь', 'комната']*/
