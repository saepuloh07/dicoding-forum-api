const DeleteCommentUseCase = require('../DeleteCommentUseCase');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');

describe('DeleteCommentUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */

  it('should throw error if use case payload not contain thread id and comment id', async () => {
    // Arrange
    const useCasePayload = {};
    const commentUseCase = new DeleteCommentUseCase({});

    // Action & Assert
    await expect(commentUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('DELETE_COMMENT_USE_CASE.NOT_CONTAIN_VALID_PAYLOAD');
  });

  it('should throw error if payload not string', async () => {
    // Arrange
    const useCasePayload = {
      thread: 1,
      comment: true,
      content: ['Dicoding Indonesia'],
      owner: 'user-1234',
    };
    const commentUseCase = new DeleteCommentUseCase({});

    // Action & Assert
    await expect(commentUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('DELETE_COMMENT_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should orchestrating the delete comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      thread: 'thread-1234',
      comment: 'comment-1234',
      content: 'Dicoding Indonesia',
      owner: 'user-1234',
    };

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.checkAvailabilityThread = jest.fn(() => Promise.resolve());
    mockCommentRepository.checkAvailabilityComment = jest.fn(() => Promise.resolve());
    mockCommentRepository.verifyCommentOwner = jest.fn(() => Promise.resolve());
    mockCommentRepository.deleteComment = jest.fn(() => Promise.resolve());

    /** creating use case instance */
    const commentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    await commentUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.checkAvailabilityThread).toHaveBeenCalledWith(useCasePayload.thread);
    expect(mockCommentRepository.checkAvailabilityComment).toHaveBeenCalledWith(useCasePayload.comment);
    expect(mockCommentRepository.verifyCommentOwner).toHaveBeenCalledWith(useCasePayload.comment, useCasePayload.owner);
    expect(mockCommentRepository.deleteComment).toHaveBeenCalledWith(useCasePayload.comment);
  });
});
