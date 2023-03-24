class AddDeleteCommentLikes {
  constructor(payload) {
    this._verifyPayload(payload);

    const { owner, comment, thread } = payload;
    this.owner = owner;
    this.thread = thread;
    this.comment = comment;
  }

  _verifyPayload({ owner, comment, thread }) {
    if (!comment || !thread || !owner) {
      throw new Error('ADD_USER_COMMENT_LIKES.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof comment !== 'string' || typeof thread !== 'string' || typeof owner !== 'string') {
      throw new Error('ADD_USER_COMMENT_LIKES.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = AddDeleteCommentLikes;
