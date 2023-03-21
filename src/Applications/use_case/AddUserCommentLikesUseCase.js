const AddUserCommentLikes = require('../../Domains/userCommentLikes/entities/AddUserCommentLikes');

class AddUserCommentLikesUseCase {
  constructor({ threadRepository, commentRepository, userCommentLikesRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._userCommentLikesRepository = userCommentLikesRepository;
  }

  async execute(useCasePayload) {
    const { thread,  comment } = useCasePayload;
    await this._threadRepository.checkAvailabilityThread(thread);
    await this._commentRepository.checkAvailabilityComment(comment);

    const payload = new AddUserCommentLikes(useCasePayload);
    await this._userCommentLikesRepository.addUserCommentLikes(payload);
  }
}

module.exports = AddUserCommentLikesUseCase;
