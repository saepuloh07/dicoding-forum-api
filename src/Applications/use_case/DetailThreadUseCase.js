const DetailThread = require('../../Domains/threads/entities/DetailThread');
const DetailComment = require('../../Domains/comments/entities/DetailComment');
const DetailReply = require('../../Domains/replies/entities/DetailReply');

class DetailThreadUseCase {
  constructor({ commentRepository, threadRepository, replyRepository, userCommentLikesRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
    this._replyRepository = replyRepository;
    this._userCommentLikesRepository = userCommentLikesRepository;
  }

  async execute(useCasePayload) {
    const { thread } = new DetailThread(useCasePayload);
    await this._threadRepository.checkAvailabilityThread(thread);
    const detailThread = await this._threadRepository.getDetailThread(thread);
    const getCommentsThread = await this._commentRepository.getCommentsByThreadId(thread);
    detailThread.comments = new DetailComment({ comments: getCommentsThread }).comments;
    for(const comment of detailThread.comments) {
      const getRepliesComment = await this._replyRepository.getRepliesByCommentId(comment.id);
      comment.replies = new DetailReply({ replies: getRepliesComment }).replies;
      comment.likeCount = await this._userCommentLikesRepository.getCommentLikes(comment.id);
    }
    return {
      thread: detailThread,
    };
  }
}

module.exports = DetailThreadUseCase;