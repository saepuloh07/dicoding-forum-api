const AddUserCommentLikes = require('../../Domains/userCommentLikes/entities/AddDeleteCommentLikes');

class AddDeleteCommentLikesUseCase {
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
    const isExist = await this._userCommentLikesRepository.verifyCommentLikeIsExist(payload);
    if (isExist) {
      await this._userCommentLikesRepository.deleteUserCommentLikes(payload);
    } else {
      await this._userCommentLikesRepository.addUserCommentLikes(payload);
    }
  }
}

module.exports = AddDeleteCommentLikesUseCase;
