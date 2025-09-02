import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import { FaqItem } from './models/faq-item.interface';
import { IScrapingStrategy } from './strategies/scraping-strategy.interface';
import { AccordionPageStrategy } from './strategies/accordion-page.strategy';
import { ServicePageStrategy } from './strategies/service-page.strategy';
import { LegacyFaqPageStrategy } from './strategies/legacy-faq-page.strategy';
import { discoverUrlsFromSitemap } from './discover-urls';

const FAKE_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36';

// The final, correct strategy array. Order is critical.
const scrapingStrategies: IScrapingStrategy[] = [
    new AccordionPageStrategy(), // Most specific: looks for <hb-accordion>
    new ServicePageStrategy(),   // Next specific: looks for a specific H2 title
    new LegacyFaqPageStrategy(),   // The general fallback for everything else
];


async function scrapeFaqFromUrl(url: string): Promise<FaqItem[]> {
    console.log(`\nScraping URL: ${url}`);
    let browser = null;
    try {
        browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setUserAgent(FAKE_USER_AGENT);
        await page.setViewport({ width: 1280, height: 800 });
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

        console.log(`-> Forcing all accordions to open (if they exist)...`);
        await page.evaluate(() => {
            const accordions = document.querySelectorAll('hb-accordion');
            accordions.forEach(acc => acc.setAttribute('open', 'true'));
        });
        await new Promise(r => setTimeout(r, 500));

        const htmlContent = await page.content();
        const $ = cheerio.load(htmlContent);

        const pageTitle = $('head > title').text().trim();
        console.log(`-> Page Title: "${pageTitle}"`);

        // Find the first strategy that can handle the page's structure.
        const strategy = scrapingStrategies.find(s => s.canHandle($));

        if (strategy) {
            console.log(`-> Strategy Found: "${strategy.constructor.name}"`);
            const results = strategy.execute($, url);
            console.log(`-> Found ${results.length} FAQs on this page.`);
            return results;
        }
        return [];

    } catch (error) {
        console.error(`An unexpected error occurred while scraping ${url}:`, error);
        return [];
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

async function main() {
    console.log("Starting scraper...");

    // Get the full list of URLs from the sitemap instead of our small manual list.
    const urlsToScrape = await discoverUrlsFromSitemap();

    if (urlsToScrape.length === 0) {
        console.log("Could not discover any URLs from the sitemap. Aborting.");
        return;
    }

    let allFaqs: FaqItem[] = [];
    for (const url of urlsToScrape) {
        const faqsFromPage = await scrapeFaqFromUrl(url);
        allFaqs = allFaqs.concat(faqsFromPage);
    }
    const outputFilename = 'zavamed_faqs.json';
    if (!fs.existsSync('data')) { fs.mkdirSync('data'); }
    fs.writeFileSync(`data/${outputFilename}`, JSON.stringify(allFaqs, null, 2));
    console.log(`\nScraping complete! Total FAQs collected: ${allFaqs.length}`);
}

main();