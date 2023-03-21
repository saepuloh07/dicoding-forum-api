const AddReplyUseCase = require('../../../../Applications/use_case/AddReplyUseCase');
const DeleteReplyUseCase = require('../../../../Applications/use_case/DeleteReplyUseCase');

class RepliesHandler {
  constructor(container) {
    this._container = container;

    this.postReplyHandler = this.postReplyHandler.bind(this);
    this.deleteReplyHandler = this.deleteReplyHandler.bind(this);
  }

  async postReplyHandler(request, h) {
    const addReplyUseCase = this._container.getInstance(AddReplyUseCase.name);
    const { id: owner } = request.auth.credentials;
    const { threadId: thread, commentId: comment } = request.params;

    const payload = {
      thread,
      comment,
      content: request.payload.content,
      owner,
    };

    const addedReply = await addReplyUseCase.execute(payload);
    return h.response({
      status: 'success',
      data: {
        addedReply,
      },
    }).code(201);
  }

  async deleteReplyHandler(request, h) {
    const deleteReplyUseCase = this._container.getInstance(DeleteReplyUseCase.name);
    const { id: owner } = request.auth.credentials;
    const { threadId: thread, commentId: comment, replyId: reply } = request.params;

    const useCasePayload = {
      thread,
      comment,
      reply,
      owner,
    };
    
    await deleteReplyUseCase.execute(useCasePayload);

    return h.response({
      status: 'success',
    });
  }
}

module.exports = RepliesHandler;
