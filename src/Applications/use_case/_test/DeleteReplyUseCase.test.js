const DeleteReplyUseCase = require('../DeleteReplyUseCase');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');

describe('DeleteReplyUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */

  it('should throw error if use case payload not contain thread id and comment id', async () => {
    // Arrange
    const useCasePayload = {};
    const replyUseCase = new DeleteReplyUseCase({});

    // Action & Assert
    await expect(replyUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('DELETE_REPLY_USE_CASE.NOT_CONTAIN_VALID_PAYLOAD');
  });

  it('should throw error if payload not string', async () => {
    // Arrange
    const useCasePayload = {
      thread: 1,
      comment: true,
      reply: 1,
      content: ['Dicoding Indonesia'],
      owner: 'user-1234',
    };
    const replyUseCase = new DeleteReplyUseCase({});

    // Action & Assert
    await expect(replyUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('DELETE_REPLY_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should orchestrating the delete comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      thread: 'thread-1234',
      comment: 'comment-1234',
      reply: 'reply-1234',
      content: 'Dicoding Indonesia',
      owner: 'user-1234',
    };

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();
    const mockReplyRepository = new ReplyRepository();

    /** mocking needed function */
    mockThreadRepository.checkAvailabilityThread = jest.fn(() => Promise.resolve());
    mockCommentRepository.checkAvailabilityComment = jest.fn(() => Promise.resolve());
    mockReplyRepository.checkAvailabilityReply = jest.fn(() => Promise.resolve());
    mockReplyRepository.verifyReplyOwner = jest.fn(() => Promise.resolve());
    mockReplyRepository.deleteReply = jest.fn(() => Promise.resolve());

    /** creating use case instance */
    const replyUseCase = new DeleteReplyUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    await replyUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.checkAvailabilityThread).toHaveBeenCalledWith(useCasePayload.thread);
    expect(mockCommentRepository.checkAvailabilityComment).toHaveBeenCalledWith(useCasePayload.comment);
    expect(mockReplyRepository.checkAvailabilityReply).toHaveBeenCalledWith(useCasePayload.reply);
    expect(mockReplyRepository.verifyReplyOwner).toHaveBeenCalledWith(useCasePayload.reply, useCasePayload.owner);
    expect(mockReplyRepository.deleteReply).toHaveBeenCalledWith(useCasePayload.reply);
  });
});
