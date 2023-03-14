const functions = require('firebase-functions');
const request = require('request-promise');

const LINE_MESSAGING_API = 'https://api.line.me/v2/bot/message';

const LINE_HEADER = {
  'Content-Type': 'application/json',
  Authorization:
    'Bearer 8f0PJlDyaFSMOSyJfmy29ot9hi6MeT0Bx9kIbrADF4FOmLWUNWdhpQfjD4UP25aPqwdfyq6Ba0iKRUi3WbwzsAiGK7WEeE6sjx6KBo4KsXqLGS7p/+WrHmehw7VeGAG5wLbEU6BiuYcubNmOP0scTwdB04t89/1O/w1cDnyilFU=',
};
const OPEN_WEATHER_API_KEY = 'd73608cead23fb5b27429deac691d518';
const TEST_USER_ID = 'Ud2041d59657ee39e93e4daa0d52ff51e';

const reply = (bodyResponse) => {
  return request({
    method: 'POST',
    uri: `${LINE_MESSAGING_API}/reply`,
    headers: LINE_HEADER,
    body: JSON.stringify({
      replyToken: bodyResponse.events[0].replyToken,
      messages: [
        { type: 'text', text: `Hello ${bodyResponse.events[0].source.userId}` },
      ],
    }),
  });
};

const push = (res, msg) => {
  return request({
    method: 'POST',
    uri: `${LINE_MESSAGING_API}/push`,
    headers: LINE_HEADER,
    body: JSON.stringify({
      to: TEST_USER_ID,
      messages: [
        {
          type: 'text',
          text: msg,
        },
      ],
    }),
  })
    .then(() => res.status(200).send('Done'))
    .catch((error) => {
      return Promise.reject(error);
    });
};

const broadcast = (res, msg) => {
  return request({
    method: 'POST',
    uri: `${LINE_MESSAGING_API}/broadcast`,
    headers: LINE_HEADER,
    body: JSON.stringify({
      messages: [
        {
          type: 'text',
          text: msg,
        },
      ],
    }),
  })
    .then(() => {
      const ret = { message: 'Done' };
      return res.status(200).send(ret);
    })
    .catch((error) => {
      const ret = { message: `Sending error: ${error}` };
      return res.status(500).send(ret);
    });
};

exports.lineBot = functions.https.onRequest((req, res) => {
  if (req.body.events[0].message.type !== 'text') return;

  reply(req.body);
});

exports.LineBotPush = functions.https.onRequest((req, res) => {
  return request({
    method: 'GET',
    uri: `https://api.openweathermap.org/data/2.5/weather?units=metric&type=accurate&zip=10330,th&appid=${OPEN_WEATHER_API_KEY}`,
    json: true,
    headers: LINE_HEADER,
  })
    .then((response) => {
      const message = `City: ${response.name}\nWeather: ${response.weather[0].description}\nTemperature: ${response.main.temp}`;
      return push(res, message);
    })
    .catch((error) => {
      return Promise.reject(error);
    });
});

exports.LineBotBroadcast = functions.https.onRequest((req, res) => {
  const inputMessage = req.query.text;

  if (inputMessage && inputMessage.trim() !== '') {
    return broadcast(res, inputMessage);
  }

  return res.status(400).send({ message: 'Text not found' });
});
