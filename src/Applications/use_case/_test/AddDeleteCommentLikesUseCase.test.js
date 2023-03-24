const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const AddUserCommentLikes = require('../../../Domains/userCommentLikes/entities/AddDeleteCommentLikes');
const UserCommentLikesRepository = require('../../../Domains/userCommentLikes/UserCommentLikesRepository');
const AddDeleteCommentLikesUseCase = require('../AddDeleteCommentLikesUseCase');

describe('AddDeleteCommentLikesUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should orchestrating the add new comment like action correctly', async () => {
    // Arrange
    const useCasePayload = {
      thread: 'thread-1234',
      comment: 'comment-1234',
      owner: 'user-1234',
    };

    const mockAddCommentLike = new AddUserCommentLikes({
      owner: useCasePayload.owner,
      comment: useCasePayload.comment,
      thread: useCasePayload.thread,
    });

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockUserCommentLikesRepository = new UserCommentLikesRepository();

    /** mocking needed function */
    mockThreadRepository.checkAvailabilityThread = jest.fn(() => Promise.resolve());
    mockCommentRepository.checkAvailabilityComment = jest.fn(() => Promise.resolve());
    mockUserCommentLikesRepository.verifyCommentLikeIsExist = jest.fn(() => Promise.resolve(false));
    mockUserCommentLikesRepository.addUserCommentLikes = jest.fn(() => Promise.resolve());

    /** creating use case instance */
    const commentLikesUseCase = new AddDeleteCommentLikesUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      userCommentLikesRepository: mockUserCommentLikesRepository,
    });

    // Action
    await commentLikesUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.checkAvailabilityThread).toBeCalledWith(useCasePayload.thread);
    expect(mockCommentRepository.checkAvailabilityComment).toBeCalledWith(useCasePayload.comment);
    expect(mockUserCommentLikesRepository.verifyCommentLikeIsExist).toBeCalledWith(mockAddCommentLike);
    expect(mockUserCommentLikesRepository.addUserCommentLikes).toBeCalledWith(mockAddCommentLike);
  });

  it('should orchestrating the delete comment like action correctly', async () => {
    // Arrange
    const useCasePayload = {
      thread: 'thread-1234',
      comment: 'comment-1234',
      owner: 'user-1234',
    };

    const mockAddCommentLike = new AddUserCommentLikes({
      owner: useCasePayload.owner,
      comment: useCasePayload.comment,
      thread: useCasePayload.thread,
    });

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockUserCommentLikesRepository = new UserCommentLikesRepository();

    /** mocking needed function */
    mockThreadRepository.checkAvailabilityThread = jest.fn(() => Promise.resolve());
    mockCommentRepository.checkAvailabilityComment = jest.fn(() => Promise.resolve());
    mockUserCommentLikesRepository.verifyCommentLikeIsExist = jest.fn(() => Promise.resolve(true));
    mockUserCommentLikesRepository.deleteUserCommentLikes = jest.fn(() => Promise.resolve());

    /** creating use case instance */
    const commentLikesUseCase = new AddDeleteCommentLikesUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      userCommentLikesRepository: mockUserCommentLikesRepository,
    });

    // Action
    await commentLikesUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.checkAvailabilityThread).toBeCalledWith(useCasePayload.thread);
    expect(mockCommentRepository.checkAvailabilityComment).toBeCalledWith(useCasePayload.comment);
    expect(mockUserCommentLikesRepository.verifyCommentLikeIsExist).toBeCalledWith(mockAddCommentLike);
    expect(mockUserCommentLikesRepository.deleteUserCommentLikes).toBeCalledWith(mockAddCommentLike);
  });
});
