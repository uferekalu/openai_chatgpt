const express = require('express');
const OpenAI = require("openai");
const cors = require('cors');
require('dotenv').config()

const app = express();
app.use(express.json());

const openai = new OpenAI({
    apiKey: process.env.apiKey
});

const responseCache = {};

app.get('/getResponse', cors(), async (req, res) => {
    try {
        const userPrompt = req.query.userPrompt;
        console.log('Received user prompt:', userPrompt);
        
        if (responseCache[userPrompt]) {
            console.log(`Response for '${userPrompt}' found in cache`);
            return res.status(200).json({result: responseCache[userPrompt]});
        }
        
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{"role": "user", "content": userPrompt}],
            max_tokens: 100
        });

        responseCache[userPrompt] = response.choices[0].message.content;

        console.log(response.choices[0].message.content);
        res.status(200).json({result: response.choices[0].message.content});
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({error: 'Internal Server Error'});
    }
});


app.listen(4000, () => {
    console.log("server started!");
});
