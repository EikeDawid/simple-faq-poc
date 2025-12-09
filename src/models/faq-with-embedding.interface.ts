// Interface for our data objects that include the embedding.
export interface FaqWithEmbedding {
    question: string;
    answer: string;
    sourceUrl: string;
    context: {
        pageType: 'Service' | 'General FAQ';
        primaryTopic: string;
        subCategory: string;
    };
    questionEmbedding: number[];
    answerEmbedding: number[];
}
