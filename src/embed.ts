import * as fs from 'fs';
import { pipeline, env } from '@xenova/transformers';
import { FaqItem } from './models/faq-item.interface';

env.allowLocalModels = false;

interface FaqWithEmbedding extends FaqItem {
    embedding: number[];
}

async function generateEmbeddings() {
    console.log("Starting embedding generation process...");

    const faqs: FaqItem[] = JSON.parse(fs.readFileSync('./data/zavamed_faqs.json', 'utf-8'));
    console.log(`-> Loaded ${faqs.length} FAQs from file.`);

    console.log("-> Loading language model (this may take a minute on the first run)...");
    const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    console.log("-> Model loaded successfully.");

    const textsToEmbed = faqs.map(faq => 
        `${faq.context.primaryTopic}: ${faq.question}`
    );

    console.log(`-> Generating embeddings for all ${textsToEmbed.length} FAQs...`);
    const embeddingsTensor = await extractor(textsToEmbed, { pooling: 'mean', normalize: true });
    console.log("-> Embeddings generated successfully.");

    // --- THE FIX: Convert the Tensor to a regular JavaScript array ---
    console.log('-> Converting Tensor to a standard array...');
    const embeddingsArray = await embeddingsTensor.tolist();
    // --- END OF FIX ---

    // Now, we can map over our data and use the standard array.
    const faqsWithEmbeddings: FaqWithEmbedding[] = faqs.map((faq, i) => ({
        ...faq,
        embedding: embeddingsArray[i], // This now works correctly
    }));

    if (!fs.existsSync('data')) {
        fs.mkdirSync('data');
    }
    fs.writeFileSync('./data/faqs_with_embeddings.json', JSON.stringify(faqsWithEmbeddings, null, 2));

    console.log(`\nProcess complete! Saved ${faqsWithEmbeddings.length} FAQs with embeddings to data/faqs_with_embeddings.json`);
}

generateEmbeddings();
