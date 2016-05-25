import { Random } from 'meteor/random';
import { Meteor } from 'meteor/meteor';
import Messages from '/imports/collections/messages';

export const schema = [`
type Message {
  username: String!
  content: String!
  channel: String!
}

type Query {
  messages(channel: String!): [Message]
}

type Mutation {
  postMessage(
    username: String!
    content: String!
    channel: String!
  ): Message
}

schema {
  query: Query
  mutation: Mutation
}
`];


export const resolvers = {
  Query: {
    messages(root, { channel }, context) {
      return Messages.find({ channel }).fetch();
    }
  },

  Mutation: {
    postMessage: Meteor.bindEnvironment((root, message, context) => {
      Messages.insert(message);
      return message;
    })
  }
};
