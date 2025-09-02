import * as cheerio from 'cheerio';

/**
 * Cleans boilerplate text from a string.
 * @param text The string to clean.
 * @returns The cleaned string.
 */
function cleanText(text: string | undefined): string {
    if (!text) return ''; // Add a check for undefined input
    return text
        .replace(/\| ZAVA UK/gi, '')
        .replace(/ZAVA Online Doctor/gi, '')
        .replace(/FAQs/gi, '')
        .trim();
}

/**
 * Extracts the best possible primary topic from the page using a fallback strategy.
 * This function is exported so it can be used by our strategies.
 * @param $ The Cheerio instance for the page.
 * @returns The cleanest possible primary topic string.
 */
export function extractPrimaryTopic($: cheerio.Root): string {
    // 1. Try for Open Graph title first
    let topic = $('meta[property="og:title"]').attr('content');
    if (topic) {
        return cleanText(topic);
    }

    // 2. Fallback to HTML title
    topic = $('head > title').text();
    if (topic) {
        return cleanText(topic);
    }
    
    // 3. Final fallback to H1
    topic = $('h1').first().text();
    return cleanText(topic);
}
