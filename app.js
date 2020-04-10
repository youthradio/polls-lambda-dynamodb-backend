require('dotenv').config();
const express = require('express');
const cors = require('cors');
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const config = require('./config'); // credentials

const awsConfig = new AWS.Config(config);
const dynamodb = new AWS.DynamoDB(awsConfig);

const { session, options } = require('./config/sessionConfig')(dynamodb);
const Poll = require('./model/pollModel')(dynamodb);
const { uuidPattern } = require('./utils');

const corsOptions = {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204,
};
const app = express();

if (!process.env.MODE === 'dev') {
  app.set('trust proxy', 1); // trust first proxy
}

app.disable('x-powered-by');
app.use(session(options));
app.use(cors(corsOptions));

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

app.get('/get', async (req, res, next) => {
  try {
    const poll = await Poll.scan().exec();
    res.json(poll);
  } catch (err) {
    console.log(err);
    res.statusCode = 500;
    res.err({ msg: new Error('error creating POLL'), err: err });
  }
});

app.get('/create', async (req, res, next) => {
  try {
    const poll_id = uuidv4();

    const poll = new Poll({
      poll_id: poll_id,
      title: 'First pool',
      main_question: 'What could happen if machines learned how to be “human”?',
      options: [
        {
          id: '857732bc-3647-4051-b75c-fcbbb08db4f4',
          count: 0,
          text: 'It might as well be the end of the world.',
        },
        {
          id: '85b2759b-6f90-492a-b072-303b142e0c44',
          count: 0,
          text: 'We could be best friends with them!!!',
        },
      ],
    });

    await poll.save();
    res.json(poll);
  } catch (err) {
    console.log(err);
    res.statusCode = 500;
    res.err({ msg: new Error('error creating POLL'), err: err });
  }
});
app.get('/update_poll/:id', async (req, res, next) => {
  const pollid = req.params.id;

  if (!uuidPattern.test(pollid)) {
    res.status(500);
    res.json({ msg: 'invalid id'});
  }

  const pollinfo = await Poll.scan(
    {
      EMAIL: { eq: res.EMAIL },
      MOBILE: { eq: res.MOBILE },
    },
    { conditionalOperator: 'OR' }
  ).exec();

  existing_user.forEach((user) => {
    user_id = user.USER_ID;
  });

  if (!user_id) {
    user_id = uuidv1();
  }

  const user = new User({
    USER_ID: user_id,
    TITLE: res.TITLE,
    NAME: res.NAME,
    EMAIL: res.EMAIL,
    MOBILE: res.MOBILE,
    COMPANY: res.COMPANY,
    ADDRESS: res.ADDRESS,
    INTEREST: res.INTEREST,
  });

  await user.save();

  return user_id;
});

module.exports = app;
