import { pipeline, env, FeatureExtractionPipeline } from '@xenova/transformers';
import * as fs from 'fs';
import { FaqWithEmbedding } from './models/faq-with-embedding.interface';

/**
 * A class to handle loading the AI model and performing semantic search.
 */

export class SearchEngine {
    // --- 2. USE the specific type here ---
    private extractor: FeatureExtractionPipeline | null = null;
    private faqs: FaqWithEmbedding[] = [];

    /**
     * Initializes the search engine by loading the AI model and the FAQ data.
     */
    public async init(): Promise<void> {
        console.log('Initializing SearchEngine...');
        env.allowLocalModels = false;

        this.extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
        console.log('-> AI model loaded.');

        const rawData = fs.readFileSync('./data/faqs_with_embeddings.json', 'utf-8');
        this.faqs = JSON.parse(rawData);
        console.log(`-> Loaded ${this.faqs.length} FAQs into memory.`);
    }

    /**
     * Calculates the cosine similarity between two vectors.
     */
    private cosineSimilarity(vecA: number[], vecB: number[]): number {
        let dotProduct = 0;
        let magA = 0;
        let magB = 0;
        for (let i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            magA += vecA[i] * vecA[i];
            magB += vecB[i] * vecB[i];
        }
        magA = Math.sqrt(magA);
        magB = Math.sqrt(magB);

        if (magA === 0 || magB === 0) {
            return 0;
        }

        return dotProduct / (magA * magB);
    }

    /**
     * Performs a semantic search to find the most relevant FAQs for a given query.
     */
    public async search(query: string, topK: number = 10) {
        if (!this.extractor) {
            throw new Error('SearchEngine is not initialized. Please call init() first.');
        }

        const queryEmbedding = await this.extractor(query, { pooling: 'mean', normalize: true });
        const queryVector: number[] = Array.from(queryEmbedding.data);

        const similarities = this.faqs.map(faq => ({
            faq: faq,
            similarity: this.cosineSimilarity(queryVector, faq.questionEmbedding)
        }));

        similarities.sort((a, b) => b.similarity - a.similarity);

        return similarities.slice(0, topK);
    }
}
