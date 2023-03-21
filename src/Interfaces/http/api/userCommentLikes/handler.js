const AddUserCommentLikesUseCase = require('../../../../Applications/use_case/AddUserCommentLikesUseCase');

class UserCommentLikesHandler {
  constructor(container) {
    this._container = container;

    this.postCommentLikesHandler = this.postCommentLikesHandler.bind(this);
  }

  async postCommentLikesHandler(request, h) {
    const addUserCommentLikesUseCase = this._container.getInstance(AddUserCommentLikesUseCase.name);
    const { id: owner } = request.auth.credentials;
    const { threadId: thread, commentId: comment } = request.params;

    const payload = {
      owner,
      thread,
      comment,
    };

    await addUserCommentLikesUseCase.execute(payload);

    return h.response({
      status: 'success',
    });
  }
}

module.exports = UserCommentLikesHandler;
