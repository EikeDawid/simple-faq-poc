import * as fs from 'fs';
import { pipeline, env } from '@xenova/transformers';
import { FaqItem } from './models/faq-item.interface';
import { FaqWithEmbedding } from './models/faq-with-embedding.interface';

env.allowLocalModels = false;

async function generateEmbeddings() {
    console.log("Starting embedding generation process...");

    const faqs: FaqItem[] = JSON.parse(fs.readFileSync('./data/zavamed_faqs.json', 'utf-8'));
    console.log(`-> Loaded ${faqs.length} FAQs from file.`);

    console.log("-> Loading language model (this may take a minute on the first run)...");
    const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    console.log("-> Model loaded successfully.");

    const questionsToEmbed = faqs.map(faq => 
        `${faq.context.primaryTopic} ${faq.context.subCategory}: ${faq.question}`
    );
    // const answersToEmbed = faqs.map(faq => 
    //     `${faq.answer}`
    // );

    console.log(`-> Generating embeddings for all ${questionsToEmbed.length} FAQs...`);
    const questionsEmbeddingsTensor = await extractor(questionsToEmbed, { pooling: 'mean', normalize: true });
    // console.log(`-> Generating embeddings for all questions`);
    // const answersEmbeddingsTensor = await extractor(answersToEmbed, { pooling: 'mean', normalize: true });
    console.log("-> Embeddings generated successfully.");

    console.log('-> Converting Tensor to a standard array...');
    const questionsEmbeddingsArray = await questionsEmbeddingsTensor.tolist();
    // const answersEmbeddingsArray = [] await answersEmbeddingsTensor.tolist();


    // Now, we can map over our data and use the standard array.
    const faqsWithEmbeddings: FaqWithEmbedding[] = faqs.map((faq, i) => ({
        ...faq,
        questionEmbedding: questionsEmbeddingsArray[i], 
        answerEmbedding: [],
    }));

    if (!fs.existsSync('data')) {
        fs.mkdirSync('data');
    }
    fs.writeFileSync('./data/faqs_with_embeddings.json', JSON.stringify(faqsWithEmbeddings, null, 2));

    console.log(`\nProcess complete! Saved ${faqsWithEmbeddings.length} FAQs with embeddings to data/faqs_with_embeddings.json`);
}

generateEmbeddings();
