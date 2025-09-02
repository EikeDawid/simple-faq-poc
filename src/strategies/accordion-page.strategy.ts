import * as cheerio from 'cheerio';
import { FaqItem } from '../models/faq-item.interface';
import { IScrapingStrategy } from './scraping-strategy.interface';
import { extractPrimaryTopic } from '../utils/context-extractor';

const QA_BLOCK_SELECTOR = 'hb-accordion';
const QUESTION_SELECTOR = 'h4';
const ANSWER_SELECTOR = 'div.content';
// The precise selector for the category container, as you provided.
const CATEGORY_BLOCK_SELECTOR = 'div.has-background-cms-secondary-1';

export class AccordionPageStrategy implements IScrapingStrategy {
    public canHandle($: cheerio.Root): boolean {
        return $(QA_BLOCK_SELECTOR).length > 0;
    }

    public execute($: cheerio.Root, url: string): FaqItem[] {
        console.log("-> Using AccordionPageStrategy with precise sub-category logic.");
        const faqList: FaqItem[] = [];
        const primaryTopic = extractPrimaryTopic($);
        let currentSubCategory = primaryTopic;

        // A more precise selector for the category headers and Q&A blocks
        $(`${CATEGORY_BLOCK_SELECTOR}, ${QA_BLOCK_SELECTOR}`).each((_, element) => {
            const item = $(element);

            // Check if this block is a sub-category header block, using your exact logic.
            if (item.is(CATEGORY_BLOCK_SELECTOR)) {
                const categoryHeader = item.find('h2[id]');
                if (categoryHeader.length > 0) {
                    currentSubCategory = categoryHeader.text().trim();
                }
                return; // This block's purpose was to set the category, so we are done with it.
            }
            
            // If the item is a Q&A block, process it as before.
            if (item.is(QA_BLOCK_SELECTOR)) {
                const qaBlock = item;
                const questionText = qaBlock.find(QUESTION_SELECTOR).text().trim();
                const answerText = qaBlock.find(ANSWER_SELECTOR).text().trim().replace(/\s\s+/g, ' ');

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
            }
        });
        return faqList;
    }
}