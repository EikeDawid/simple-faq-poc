import * as cheerio from 'cheerio';
import { FaqItem } from '../models/faq-item.interface';
import { IScrapingStrategy } from './scraping-strategy.interface';
import { extractPrimaryTopic } from '../utils/context-extractor';


const QA_BLOCK_SELECTOR = 'hb-accordion';

export class UniversalStrategy implements IScrapingStrategy {
    public canHandle($: cheerio.Root): boolean {
        return $(QA_BLOCK_SELECTOR).length > 0;
    }

    public execute($: cheerio.Root, url: string): FaqItem[] {
        console.log("-> Using the definitive UniversalStrategy.");
        const faqList: FaqItem[] = [];
        const primaryTopic = extractPrimaryTopic($);
        let currentSubCategory = primaryTopic;

        $(QA_BLOCK_SELECTOR).each((_, element) => {
            const qaBlock = $(element);
            
            // --- UPDATED SELECTORS BASED ON YOUR FEEDBACK ---
            // 1. The question is in an <h4> element.
            const questionText = qaBlock.find('h4').text().trim();
            // 2. The answer is in a nested <div class="content">.
            const answerText = qaBlock.find('div.content').text().trim().replace(/\s\s+/g, ' ');
            // --- END UPDATED SELECTORS ---

            const subCategoryTag = qaBlock.prevAll('h2').first();
            if (subCategoryTag.length > 0) {
                currentSubCategory = subCategoryTag.text().trim();
            }

            if (questionText && answerText.length > 10) {
                faqList.push({
                    question: questionText,
                    answer: answerText,
                    sourceUrl: url,
                    context: {
                        pageType: 'General FAQ',
                        primaryTopic: primaryTopic,
                        subCategory: currentSubCategory,
                    },
                });
            }
        });
        return faqList;
    }
}