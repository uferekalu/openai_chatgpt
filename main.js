const express = require('express');
const OpenAI = require("openai");
const cors = require('cors');
require('dotenv').config()

const app = express();
app.use(express.json());

const openai = new OpenAI({
    apiKey: process.env.apiKey
});

app.get('/getResponse', cors(), async (req, res) => {
    const userPrompt = req.query.userPrompt;
    console.log(userPrompt);
    const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{"role": "user", "content": userPrompt}],
        max_tokens: 100
    });

    console.log(response.choices[0].message.content);
    res.status(200).json({result: response.choices[0].message.content});
});

app.listen(4000, () => {
    console.log("server started!");
});
