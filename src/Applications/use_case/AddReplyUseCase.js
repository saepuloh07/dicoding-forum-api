const AddReply = require('../../Domains/replies/entities/AddReply');

class AddReplyUseCase {
  constructor({ commentRepository, threadRepository, replyRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
    this._replyRepository = replyRepository;
  }

  async execute(useCasePayload) {
    const { thread, comment } = useCasePayload;
    await this._threadRepository.checkAvailabilityThread(thread);
    await this._commentRepository.checkAvailabilityComment(comment);

    const payload = new AddReply(useCasePayload);
    return this._replyRepository.addReply(payload);
  }
}

module.exports = AddReplyUseCase;