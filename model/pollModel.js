const dynamoose = require('dynamoose');
const { uuidPattern }  = require('./../utils')

module.exports = function (dynamodb) {
  dynamoose.setDDB(dynamodb);

  const pollSchema = new dynamoose.Schema(
    {
      poll_id: {
        hashKey: true,
        validate: function (v) {
          return uuidPattern.test(v);
        },
        type: String,
      },
      title: {
        type: String,
      },
      main_question: {
        type: String,
        required: true,
      },
      options: {
        type: 'list',
        required: true,
        list: [
          {
            type: 'map',
            map: {
              id: {
                type: String,
                required: true,
                validate: function (v) {
                  return uuidPattern.test(v);
                },
              },
              text: {
                type: String,
              },
              counter: {
                type: Number,
                default: 0,
              },
            },
          },
        ],
      },
    },
    { saveUnknown: true, useDocumentTypes: true }
  );

  const Poll = dynamoose.model('POLLS_TABLE', pollSchema);
  return Poll;
};
