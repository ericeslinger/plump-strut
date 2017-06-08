export interface ChannelMessage {
  request: string;
}

export interface ListAuthenticationChannelMessage extends ChannelMessage {
  request: 'list';
}

export interface TestKeyAuthenticationChannelMessage extends ChannelMessage {
  request: 'testkey';
  key: string;
}

export interface StartAuthenticationChannelMessage extends ChannelMessage {
  request: 'startauth';
  nonce: string;
}

export type AuthenticationChannelMessage
  = ListAuthenticationChannelMessage
  | TestKeyAuthenticationChannelMessage
  | StartAuthenticationChannelMessage;
