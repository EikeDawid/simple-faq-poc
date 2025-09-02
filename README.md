# Simple FAQ POC

Hacked together simple poc to crawler a zavamed for faq entries, generate embeddings and run a simple in mem search over it. Mainly did this to play around with Gemini. 

## Setup

1. use `nvm` to `use` the right node version, you may have to `nvm install` first.
2. `npm install`
3. the `data/` directory contains an example crawl result as the crawler takes a bit to run. So if you don't wanna run it: make a copy of the `zavamed_faq.json.example` and remove the `.example`
4. Generate embeddings: `npm run emded`
5. you can now either use the commandline search client `npm run search` or altenative start the server with `npm start` and point your browser at (http://localhost:3000/)[http://localhost:3000/].
6. happy searching!