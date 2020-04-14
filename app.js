require('dotenv').config();
const express = require('express');
const cors = require('cors');
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const config = require('./config'); // credentials

const awsConfig = new AWS.Config(config);
const dynamodb = new AWS.DynamoDB(awsConfig);

const { session, sessionOptions } = require('./config/sessionConfig')(dynamodb);
const Poll = require('./model/pollModel')(dynamodb);
const { uuidPattern } = require('./utils');

const whitelist = [
  'https://interactive.yr.media',
  'https://youthradio.github.io',
  'http://localhost:3000',
  `http://localhost:${process.env.PORT}`,
  'https://radames.static.observableusercontent.com',
];

const corsOptionsDelegate = (req, callback) => {
  console.log(req.header('Origin'), whitelist.includes(req.header('Origin')));
  const corsOptions = {
    origin: whitelist.includes(req.header('Origin')),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
  };
  return callback(null, corsOptions); // callback expects two parameters: error and options
};

const app = express();

if (!process.env.MODE === 'dev' || process.env.MODE === undefined) {
  app.set('trust proxy', 1); // trust first proxy
}

app.disable('x-powered-by');
app.use(session(sessionOptions));
app.use(cors(corsOptionsDelegate));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
  if (req.session.views) {
    req.session.views++;
    res.setHeader('Content-Type', 'text/html');
    res.write('<p>views: ' + req.session.views + '</p>');
    res.write('<p>expires in: ' + req.session.cookie.maxAge / 1000 + 's</p>');
    res.end();
  } else {
    req.session.views = 1;
    res.end('welcome to the session demo. refresh!');
  }
});

app.get('/getAll', async (req, res, next) => {
  try {
    const poll = await Poll.scan().exec();
    res.header('Content-Type', 'application/json');
    res.send(JSON.stringify(poll, null, 4));
  } catch (err) {
    res.statusCode = 500;
    res.err({ msg: new Error('error creating POLL'), err: err });
  }
});

app.post('/create', async (req, res, next) => {
  const bodyData = req.body;
  if (!bodyData) {
    res.status(500);
    return res.json({ err: true, msg: 'NO DATA' });
  }
  if (!bodyData.token || bodyData.token !== process.env.TOKEN) {
    res.status(500);
    return res.json({ err: true, msg: 'Invalid Token' });
  }
  if (
    !bodyData.title ||
    !bodyData.question ||
    !bodyData.options ||
    !bodyData.options.every((e) => e !== '' || e !== undefined)
  ) {
    res.status(500);
    return res.json({ err: true, msg: 'Invalid Poll Data' });
  }
  try {
    const poll = new Poll({
      poll_id: uuidv4(),
      title: bodyData.title,
      main_question: bodyData.question,
      options: bodyData.options.map((option) => ({
        id: uuidv4(),
        count: 0,
        text: option.text,
      })),
    });

    await poll.save();
    res.json(poll);
  } catch (err) {
    res.statusCode = 500;
    res.err({ msg: new Error('error creating POLL'), err: err });
  }
});
app.get('/vote_poll/:id/:vote', async (req, res, next) => {
  const poll_id = req.params.id;
  const vote_id = req.params.vote;
  if (!uuidPattern.test(poll_id) && !uuidPattern.test(vote_id)) {
    res.status(500);
    res.json({ err: true, msg: 'invalid ids' });
  }

  const selectedPoll = await Poll.get({
    poll_id: poll_id,
  });

  // check if user has already voted
  if (req.session.voted_polls && req.session.voted_polls.includes(poll_id)) {
    res.header('Content-Type', 'application/json');
    res.send(JSON.stringify({ hasvoted: true, poll: selectedPoll }, null, 4));
    return;
  } else {
    req.session.voted_polls = [];
    req.session.voted_polls.push(poll_id);
  }

  const options = selectedPoll.options.map((option) => {
    // if voted poll then add 1 otherwise pass
    const newcount = option.id === vote_id ? option.count + 1 : option.count;
    return Object.assign(option, { count: newcount });
  });

  await Poll.update(
    {
      poll_id: poll_id,
    },
    { options: options }
  );
  res.header('Content-Type', 'application/json');
  res.send(JSON.stringify({ hasvoted: false, poll: selectedPoll }, null, 4));
});

module.exports = app;
