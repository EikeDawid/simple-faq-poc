import * as cheerio from 'cheerio';
import { FaqItem } from '../models/faq-item.interface';
import { IScrapingStrategy } from './scraping-strategy.interface';


export class DedicatedFaqPageStrategy implements IScrapingStrategy {
    public canHandle($: cheerio.Root): boolean {
        return true;
    }

    public execute($: cheerio.Root, url: string): FaqItem[] {
        console.log("-> Using DedicatedFaqPageStrategy with new container logic.");
        const faqList: FaqItem[] = [];
        const primaryTopic = $('h1').first().text().trim();

        // 1. Find all category headings on the page.
        $('body h2').each((_, h2Element) => {
            const categoryTag = $(h2Element);
            const subCategory = categoryTag.text().trim();

            if (subCategory.length < 5 || subCategory.toLowerCase().includes('customer reviews')) {
                return; // Skips irrelevant sections like "Cookies".
            }

            // 2. Find all sibling elements between this category and the next.
            const categoryContent = categoryTag.nextUntil('h2');

            // 3. Find all potential Q&A container blocks within this section.
            // A Q&A block is a div that has an h3 with a question mark inside it.
            const qaBlocks = categoryContent.filter((_, el) => {
                return $(el).find("h3:contains('?')").length > 0;
            });
            
            qaBlocks.each((_, blockElement) => {
                const block = $(blockElement);
                const questionText = block.find('h3').text().trim();
                
                // 4. Robustly find the answer.
                // The answer is in the next sibling of the block we just found.
                const answerBlock = block.next();
                const answerText = answerBlock.text().trim().replace(/\s\s+/g, ' ');

                if (questionText && answerText.length > 10) {
                    faqList.push({
                        question: questionText,
                        answer: answerText,
                        sourceUrl: url,
                        context: {
                            pageType: 'General FAQ',
                            primaryTopic: primaryTopic,
                            subCategory: subCategory,
                        },
                    });
                }
            });
        });
        return faqList;
    }
}