const session = require('express-session');
const DynamoDBStore = require('connect-dynamodb')({ session: session });

const { v4: uuidv4 } = require('uuid');

module.exports = function (dynamodb) {
  const sessionStoreOptions = {
    table: 'sessions',
    client: dynamodb,

    // Optional ProvisionedThroughput params, defaults to 5
    readCapacityUnits: 1,
    writeCapacityUnits: 1,
  };

  const options = {
    genid: function (req) {
      return uuidv4();
    },
    store: new DynamoDBStore(sessionStoreOptions),
    secret: process.env.COOKIE_SECRET,
    cookie: { maxAge: 60000 },
    resave: false,
    saveUninitialized: true,
  };

  if (!process.env.MODE === 'dev') {
    options.cookie.secure = true; // serve secure cookies
  }
  return { session, options };
};
