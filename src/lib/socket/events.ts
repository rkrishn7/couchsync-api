export enum SocketEvents {
  DISCONNECT = 'disconnect',
  JOIN_PARTY = 'join_party',
  SEND_MESSAGE = 'send_message',
  NEW_MESSAGE = 'new_message',
  GET_MESSAGES = 'get_messages',
  VIDEO_EVENT = 'video_event',
  URL_CHANGE = 'url_change',
  USER_LOADED = 'user_loaded',
}

export enum VideoSocketEvents {
  VIDEO_PLAY = 'video_play',
  VIDEO_PAUSE = 'video_pause',
  VIDEO_SEEKED = 'video_seeked',
  VIDEO_PROGRESS = 'video_progress',
}

