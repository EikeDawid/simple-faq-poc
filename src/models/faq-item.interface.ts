export interface FaqItem {
    question: string;
    answer: string;
    sourceUrl: string;
    context: {
        pageType: 'Service' | 'General FAQ';
        primaryTopic: string;
        subCategory: string;
    };
}
