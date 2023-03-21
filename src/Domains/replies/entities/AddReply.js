class AddReply {
  constructor(payload) {
    this._verifyPayload(payload);

    const { thread, comment, content, owner } = payload;
    this.thread = thread;
    this.comment = comment;
    this.content = content;
    this.owner = owner;
  }

  _verifyPayload({ thread, comment, content, owner }) {
    if (!thread || !comment || !content || !owner) {
      throw new Error('ADD_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof thread !== 'string' || typeof comment !== 'string' || typeof content !== 'string' || typeof owner !== 'string') {
      throw new Error('ADD_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = AddReply;
