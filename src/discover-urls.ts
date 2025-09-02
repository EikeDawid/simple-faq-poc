import axios from 'axios';
import * as cheerio from 'cheerio';

// The entry point for the website's sitemap
const SITEMAP_INDEX_URL = 'https://www.zavamed.com/uk/sitemap.xml';

/**
 * Fetches a sitemap XML file and parses it to extract all URLs.
 * @param url The URL of the sitemap.xml file.
 * @returns A promise that resolves to an array of URL strings.
 */
async function fetchAndParseSitemap(url: string): Promise<string[]> {
    try {
        console.log(`   Fetching sitemap: ${url}`);
        const response = await axios.get(url);
        // We tell Cheerio to parse the data in XML mode
        const $ = cheerio.load(response.data, { xmlMode: true });
        const urls: string[] = [];
        
        // Find every <loc> tag and extract its text content
        $('loc').each((_, element) => {
            urls.push($(element).text());
        });
        
        return urls;
    } catch (error) {
        console.error(`Failed to fetch or parse sitemap: ${url}`, error);
        return [];
    }
}

/**
 * Discovers all relevant page URLs from the website's sitemap index.
 * @returns A promise that resolves to a comprehensive list of page URLs to scrape.
 */
export async function discoverUrlsFromSitemap(): Promise<string[]> {
    console.log('Discovering URLs from sitemap index...');
    
    // make sure to have the weightloss faq
    let allPageUrls: string[] = [ 'https://www.zavamed.com/uk/weight-loss-faqs.html' ];

        const pageUrls = await fetchAndParseSitemap(SITEMAP_INDEX_URL);
        allPageUrls = allPageUrls.concat(pageUrls);

    
    console.log(`-> Discovery complete. Found ${allPageUrls.length} total page URLs.`);
    return allPageUrls;
}
