import * as readline from 'readline';
import { SearchEngine } from './search-engine';

/**
 * An interactive command-line interface to test our SearchEngine.
 */
async function main() {
    console.log("--- Interactive FAQ Search Engine ---");
    
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const searchEngine = new SearchEngine();
    await searchEngine.init();
    console.log("\n✅ Search engine ready.");
    console.log("Type your query and press Enter. Type 'exit' or press CTRL+C to quit.");

    const askQuery = () => {
        rl.question('\nSearch query> ', async (query) => {
            if (query.toLowerCase() === 'exit') {
                rl.close();
                return;
            }

            const results = await searchEngine.search(query);

            if (results.length === 0) {
                console.log("No results found.");
            } else {
                console.log("--- Top Results ---");
                results.forEach(res => {
                    console.log(`[Score: ${res.similarity.toFixed(4)}] ${res.faq.question}`);
                    console.log(`  (Source: ${res.faq.context.primaryTopic} -> ${res.faq.context.subCategory})\n`);
                });
            }
            
            askQuery();
        });
    };

    askQuery();
}

main();