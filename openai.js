const axios = require('axios');

async function askGPTWithImage(imageUrl, userPrompt) {
  const response = await axios.post('https://api.openai.com/v1/chat/completions', {
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: userPrompt },
          { type: "image_url", image_url: { url: imageUrl } }
        ]
      }
    ]
  }, {
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    }
  });

  return response.data.choices[0].message.content;
}

module.exports = { askGPTWithImage };
