require('dotenv').config();
const express = require('express');
const line = require('@line/bot-sdk');
const { uploadImageToCloudinary } = require('./cloudinary');
const { askGPTWithImage } = require('./openai');
const { formatReply } = require('./replyMessage');

const app = express();
app.use(express.json({ verify: (req, res, buf) => { req.rawBody = buf } }));

const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

const client = new line.Client(config);

app.post('/webhook', line.middleware(config), async (req, res) => {
  const events = req.body.events;
  for (const event of events) {
    if (event.type === 'message' && event.message.type === 'image') {
      try {
        const imageBuffer = await client.getMessageContent(event.message.id);
        const url = await uploadImageToCloudinary(imageBuffer);
        const gptResponse = await askGPTWithImage(url, "この画像を解説してください。日本語でお願いします。");
        const replyText = formatReply(gptResponse);
        await client.replyMessage(event.replyToken, { type: 'text', text: replyText });
      } catch (err) {
        console.error(err);
        await client.replyMessage(event.replyToken, { type: 'text', text: '画像の処理中にエラーが発生しました。' });
      }
    } else {
      await client.replyMessage(event.replyToken, { type: 'text', text: '画像を送ってね！' });
    }
  }
  res.sendStatus(200);
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on ${port}`));
