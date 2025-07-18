const express = require('express');
const line = require('@line/bot-sdk');
require('dotenv').config();

const app = express();

// LINE bot設定
const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

// ミドルウェア設定
app.post('/webhook', line.middleware(config), (req, res) => {
  const events = req.body.events;
  Promise
    .all(events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

function handleEvent(event) {
  // テキストメッセージだけ対応
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  const client = new line.Client(config);
  return client.replyMessage(event.replyToken, {
    type: 'text',
    text: `くまお先生だよ！「${event.message.text}」って言ったね？`,
  });
}

// ポート設定（Railwayでは process.env.PORT が必須）
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
