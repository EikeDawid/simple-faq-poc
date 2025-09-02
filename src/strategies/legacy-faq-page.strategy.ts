import * as cheerio from 'cheerio';
import { FaqItem } from '../models/faq-item.interface';
import { IScrapingStrategy } from './scraping-strategy.interface';
import { extractPrimaryTopic } from '../utils/context-extractor';

export class LegacyFaqPageStrategy implements IScrapingStrategy {
    public canHandle($: cheerio.Root): boolean {
        // This is our final fallback strategy.
        return true;
    }

    public execute($: cheerio.Root, url: string): FaqItem[] {
        console.log("-> Using the correct LegacyFaqPageStrategy.");
        const faqList: FaqItem[] = [];
        const primaryTopic = extractPrimaryTopic($);
        let currentSubCategory = 'General';

        // Get all potential category (h2) and question (h3) headings in order.
        $('body h2, body h3').each((_, element) => {
            const tag = $(element);

            // Check if the tag is a category header, using your precise rule.
            if (tag.is('h2') && tag.attr('id') && tag.closest('div.Autotext-section').length > 0) {
                currentSubCategory = tag.text().trim();
                // This was a category header, so we continue to the next element.
                return;
            }
            
            // Check if the tag is a question.
            if (tag.is('h3') && tag.text().includes('?')) {
                const questionText = tag.text().trim();

                // Use the answer-finding logic that we previously found works for this page structure.
                const answerWrapper = tag.parent().next();
                const answerText = answerWrapper.text().trim().replace(/\s\s+/g, ' ');

                if (answerText.length > 10) {
                    faqList.push({
                        question: questionText,
                        answer: answerText,
                        sourceUrl: url,
                        context: {
                            pageType: 'General FAQ', // Correct page type
                            primaryTopic: primaryTopic,
                            subCategory: currentSubCategory, // Correct, scoped sub-category
                        }
                    });
                }
            }
        });
        return faqList;
    }
}