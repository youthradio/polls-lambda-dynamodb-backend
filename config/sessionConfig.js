const session = require('express-session');
const DynamoDBStore = require('connect-dynamodb')({ session: session });

const { v4: uuidv4 } = require('uuid');

const isDev = process.env.MODE === 'dev';

module.exports = function (dynamodb) {
  const sessionStoreOptions = {
    table: 'sessions',
    client: dynamodb,
    // Optional ProvisionedThroughput params, defaults to 5
    readCapacityUnits: 1,
    writeCapacityUnits: 1,
  };
  const sessionOptions = {
    genid: function (req) {
      return uuidv4();
    },
    store: new DynamoDBStore(sessionStoreOptions),
    secret: process.env.COOKIE_SECRET,
    cookie: { secure: !isDev, sameSite:'none'},
    resave: false,
    saveUninitialized: true,
  };

  return { session, sessionOptions };
};
