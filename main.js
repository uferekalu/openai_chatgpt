const express = require('express')
const OpenAI = require('openai')
const cors = require('cors')
const NodeCache = require('node-cache')
require('dotenv').config()

const app = express()
const cache = new NodeCache({ stdTTL: 3600 })
app.use(express.json())

const openai = new OpenAI({
  apiKey: process.env.apiKey,
})

const responseCache = {}

app.get('/getResponse', cors(), async (req, res) => {
  try {
    const userPrompt = req.query.userPrompt
    console.log('Received user prompt:', userPrompt)

    if (responseCache[userPrompt]) {
      console.log(`Response for '${userPrompt}' found in cache`)
      return res.status(200).json({ result: responseCache[userPrompt] })
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: userPrompt }],
      max_tokens: 100,
    })

    responseCache[userPrompt] = response.choices[0].message.content

    console.log(response.choices[0].message.content)
    res.status(200).json({ result: response.choices[0].message.content })
  } catch (error) {
    console.error('Error processing request:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

app.get('/summarize', cors(), async (req, res) => {
  try {
    const url = req.query.url
    const cacheKey = `summary-${url}`
    const cachedSummary = cache.get(cacheKey)
    if (cachedSummary) {
      res.status(200).json({ summary: cachedSummary })
      return
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: `Summarize the content of the website at URL: ${url}`,
        },
      ],
      max_tokens: 50,
      temperature: 0.5,
    })

    const summary = response.choices[0].message.content
    console.log({url: url, summary: summary})

    cache.set(cacheKey, summary, 3600)

    res.json({ summary })
  } catch (error) {
    console.error('Error:', error)
    res
      .status(500)
      .json({ error: 'An error occurred while processing your request.' })
  }
})

app.listen(4000, () => {
  console.log('server started!')
})
