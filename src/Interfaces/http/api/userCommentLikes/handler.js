const AddDeleteCommentLikesUseCase = require('../../../../Applications/use_case/AddDeleteCommentLikesUseCase');

class UserCommentLikesHandler {
  constructor(container) {
    this._container = container;

    this.postCommentLikesHandler = this.postCommentLikesHandler.bind(this);
  }

  async postCommentLikesHandler(request, h) {
    const addDeleteCommentLikesUseCase = this._container.getInstance(AddDeleteCommentLikesUseCase.name);
    const { id: owner } = request.auth.credentials;
    const { threadId: thread, commentId: comment } = request.params;

    const payload = {
      owner,
      thread,
      comment,
    };

    await addDeleteCommentLikesUseCase.execute(payload);

    return h.response({
      status: 'success',
    });
  }
}

module.exports = UserCommentLikesHandler;
