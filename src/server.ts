import express from 'express';
// Import our SearchEngine class from search.ts
import { SearchEngine } from './search-engine';

async function startServer() {
    const app = express();
    const PORT = 3000;

    // This line tells Express to serve our index.html file
    app.use(express.static('public'));

    // Create and initialize our SearchEngine once when the server starts.
    const searchEngine = new SearchEngine();
    await searchEngine.init();

    console.log('\nSearch engine initialized. Ready to accept requests.');

    // This is our API endpoint. The frontend will send requests to this URL.
    app.get('/api/search', async (req, res) => {
        const query = req.query.q as string;

        if (!query) {
            return res.status(400).json({ error: 'Query parameter "q" is required.' });
        }

        try {
            console.log(`-> Received search query: "${query}"`);
            const results = await searchEngine.search(query, 10);
            res.json(results);
        } catch (error) {
            console.error('Error during search:', error);
            res.status(500).json({ error: 'An internal server error occurred.' });
        }
    });

    // Start the server
    app.listen(PORT, () => {
        console.log(`Server is running at http://localhost:${PORT}`);
    });
}

startServer();
