import * as cheerio from 'cheerio'; 
import { FaqItem } from '../models/faq-item.interface';

export interface IScrapingStrategy {
    /**
     * Determines if this strategy can handle the provided page content.
     * @param $ A Cheerio instance of the page.
     * @returns `true` if the strategy can handle the page, otherwise `false`.
     */
    canHandle($: cheerio.Root): boolean; // Changed type to cheerio.Root

    /**
     * Executes the scraping logic for this strategy.
     * @param $ A Cheerio instance of the page.
     * @param url The source URL of the page.
     * @returns An array of FaqItem objects.
     */
    execute($: cheerio.Root, url: string): FaqItem[]; // Changed type to cheerio.Root
}
