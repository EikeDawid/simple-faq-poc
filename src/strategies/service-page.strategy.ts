import * as cheerio from 'cheerio';
import { FaqItem } from '../models/faq-item.interface';
import { IScrapingStrategy } from './scraping-strategy.interface';
import { extractPrimaryTopic } from '../utils/context-extractor';

export class ServicePageStrategy implements IScrapingStrategy {
    // --- FINAL UPDATED CANHANDLE LOGIC ---
    public canHandle($: cheerio.Root): boolean {
        // First, get the main page title.
        const mainHeading = $('h1').first().text().toLowerCase();
        // Check if the title indicates it's a dedicated, high-level FAQ page.
        const isDedicatedFaqPage = mainHeading.includes('frequently asked questions') || mainHeading.includes('faqs');

        // If it looks like a dedicated FAQ page, this strategy MUST NOT handle it.
        if (isDedicatedFaqPage) {
            return false;
        }

        // Otherwise, proceed with the original check for service-page-specific structures.
        const hasPatternA = $('div.Faq').length > 0;
        const hasPatternB = $('div.Accordion-data-wrapper').length > 0;
        return hasPatternA || hasPatternB;
    }
    // --- END UPDATED LOGIC ---

    public execute($: cheerio.Root, url: string): FaqItem[] {
        console.log("-> Using final ServicePageStrategy.");
        const faqList: FaqItem[] = [];
        const primaryTopic = extractPrimaryTopic($);

        const pushFaq = (question: string, answer: string) => {
            faqList.push({
                question,
                answer,
                sourceUrl: url,
                context: {
                    pageType: 'Service',
                    primaryTopic: primaryTopic,
                    subCategory: "Frequently asked questions",
                },
            });
        };

        // Attempt 1: The "Faq-item" pattern (e.g., Period Delay page).
        const patternAContainer = $('div.Faq');
        if (patternAContainer.length > 0) {
            console.log("--> Found 'Faq-item' structure. Using Pattern A.");
            patternAContainer.find('div.Faq-item').each((_, element) => {
                const qaBlock = $(element);
                const questionText = qaBlock.find('h2').text().trim();
                const answerText = qaBlock.find('div.Autotext.Autotext-block').text().trim().replace(/\s\s+/g, ' ');
                if (questionText && answerText.length > 10) pushFaq(questionText, answerText);
            });
        } 
        
        // Attempt 2 (Fallback): The "Accordion-data-wrapper" pattern (e.g., Erectile Dysfunction page).
        else {
            console.log("--> No 'Faq-item' found. Using Pattern B.");
            const QA_BLOCK_SELECTOR_B = 'div.Accordion-data-wrapper';
            const QUESTION_SELECTOR_B = 'dt.Accordion-heading span.title';
            const ANSWER_SELECTOR_B   = 'dd.Accordion-panel div.Autotext.Autotext-block';
            
            // Search the whole body for this pattern, as its container is less consistent.
            $(QA_BLOCK_SELECTOR_B).each((_, element) => {
                const qaBlock = $(element);
                const questionText = qaBlock.find(QUESTION_SELECTOR_B).text().trim();
                const answerText = qaBlock.find(ANSWER_SELECTOR_B).text().trim().replace(/\s\s+/g, ' ');
                if (questionText && answerText.length > 10) pushFaq(questionText, answerText);
            });
        }
        
        return faqList;
    }
}