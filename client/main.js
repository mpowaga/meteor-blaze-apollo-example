import { Meteor } from 'meteor/meteor';
import React from 'react';
import { Accounts } from 'meteor/accounts-base';
import ApolloClient, { createNetworkInterface } from 'apollo-client';
import connect from 'meteor/mpowaga:blaze-apollo';

import { registerGqlTag } from 'apollo-client/gql';
registerGqlTag();

const networkInterface = createNetworkInterface('/graphql');

networkInterface.use([{
  applyMiddleware(request, next) {
    const currentUserToken = Accounts._storedLoginToken();

    if (!currentUserToken) {
      next();
      return;
    }

    if (!request.options.headers) {
      request.options.headers = new Headers();
    }

    request.options.headers.Authorization = currentUserToken;

    next();
  }
}]);

const client = new ApolloClient({
  networkInterface,
});
connect(client);

Template.chat.onCreated(() => {
  const instance = Template.instance();
  instance.channel = new ReactiveVar('#general');
});

Template.chat.queries({
  messagesQuery: {
    query: gql`
      query messages($channel: String!) {
        messages(channel: $channel) {
          username
          content
        }
      }
    `,
    variables: (instance) => ({
      channel: instance.channel.get()
    })
  }
});

Template.chat.mutations({
  postMessage: (username, content) => ({
    mutation: gql`
      mutation postMessage($username: String!, $content: String!, $channel: String!) {
        postMessage(username: $username, content: $content, channel: $channel) {
          username,
          content
        }
      }
    `,
    variables: (instance) => ({
      username,
      content,
      channel: instance.channel.get()
    })
  })
});

Template.chat.helpers({
  inChannel(channel) {
    return Template.instance().channel.get() === channel;
  }
});

Template.chat.events({
  'click .js-change-channel'(event, instance) {
    event.preventDefault();
    instance.channel.set($(event.target).data('channel'));
  },

  'click .js-send'(event, instance) {
    const username = instance.$('.js-username').val();
    const message = instance.$('.js-message').val();
    instance.postMessage(username, message).then(() => {
      instance.$('.js-message').val('');
      instance.messagesQuery().refetch();
    });
  }
});
