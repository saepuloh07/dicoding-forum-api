class DeleteReplyUseCase {
  constructor({ commentRepository, threadRepository, replyRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
    this._replyRepository = replyRepository;
  }

  async execute(useCasePayload) {
    this._validatePayload(useCasePayload);
    const { thread, comment, reply, owner } = useCasePayload;
    await this._threadRepository.checkAvailabilityThread(thread);
    await this._commentRepository.checkAvailabilityComment(comment);
    await this._replyRepository.checkAvailabilityReply(reply);
    await this._replyRepository.verifyReplyOwner(reply, owner);
    await this._replyRepository.deleteReply(reply);
  }

  _validatePayload({ thread, comment, reply, owner }) {
    if (!thread || !comment || !reply || !owner) {
      throw new Error('DELETE_REPLY_USE_CASE.NOT_CONTAIN_VALID_PAYLOAD');
    }

    if (typeof thread !== 'string' || typeof comment !== 'string' || typeof reply !== 'string' || typeof owner !== 'string') {
      throw new Error('DELETE_REPLY_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = DeleteReplyUseCase;