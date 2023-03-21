const CommentRepository = require('../../../Domains/comments/CommentRepository');
const DetailThreadUseCase = require('../DetailThreadUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const UserCommentLikesRepository = require('../../../Domains/userCommentLikes/UserCommentLikesRepository');

describe('DetailThreadUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should correctly get detail thread data', async () => {
    // Arrange
    const useCasePayload = {
      thread: 'thread-1234',
    };

    const expectedThread = {
      id: 'thread-1234',
      title: 'Sebuah title',
      body: 'Sebuah body thread',
      date: '2023-03-10T07:22:33.555Z',
      username: 'dicoding',
    };

    const expectedReplies = [
      {
        id: 'reply-1234',
        username: 'saeful',
        date: '2023-03-10T07:22:33.555Z',
        content: 'balasan dari saeful',
      },
      {
        id: 'reply-5678',
        username: 'dicoding',
        date: '2023-03-10T07:22:33.555Z',
        content: '**balasan telah dihapus**',
      },
    ];

    const expectedComments = [
      {
        id: 'comment-1234',
        username: 'saeful',
        date: '2023-03-10T07:22:33.555Z',
        replies: expectedReplies,
        content: 'komentar dari saeful',
        likeCount: undefined,
      },
      {
        id: 'comment-5678',
        username: 'dicoding',
        date: '2023-03-10T07:22:33.555Z',
        replies: expectedReplies,
        content: '**komentar telah dihapus**',
        likeCount: undefined,
      },
    ];

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();
    const mockReplyRepository = new ReplyRepository();
    const mockUserCommentLikesRepository = new UserCommentLikesRepository();

    /** mocking needed function */
    mockThreadRepository.checkAvailabilityThread = jest.fn(() => Promise.resolve());
    mockThreadRepository.getDetailThread = jest.fn()
      .mockImplementation(() => Promise.resolve({
        id: 'thread-1234',
        title: 'Sebuah title',
        body: 'Sebuah body thread',
        date: '2023-03-10T07:22:33.555Z',
        username: 'dicoding',
      }));
    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve([{
        id: 'comment-1234',
        username: 'saeful',
        date: '2023-03-10T07:22:33.555Z',
        content: 'komentar dari saeful',
        is_deleted: false,
      },
      {
        id: 'comment-5678',
        username: 'dicoding',
        date: '2023-03-10T07:22:33.555Z',
        content: '**komentar telah dihapus**',
        is_deleted: true,
      }]));
    mockReplyRepository.getRepliesByCommentId = jest.fn()
      .mockImplementation(() => Promise.resolve([
        {
          id: 'reply-1234',
          username: 'saeful',
          date: '2023-03-10T07:22:33.555Z',
          content: 'balasan dari saeful',
          is_deleted: false,
        },
        {
          id: 'reply-5678',
          username: 'dicoding',
          date: '2023-03-10T07:22:33.555Z',
          content: '**balasan telah dihapus**',
          is_deleted: true,
        },
      ]));
    mockUserCommentLikesRepository.getCommentLikes = jest.fn(() => Promise.resolve());

    /** creating use case instance */
    const detailThreadUseCase = new DetailThreadUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
      replyRepository: mockReplyRepository,
      userCommentLikesRepository: mockUserCommentLikesRepository,
    });

    // Action
    const detailThread = await detailThreadUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.checkAvailabilityThread).toHaveBeenCalledWith(useCasePayload.thread);
    expect(mockThreadRepository.getDetailThread).toHaveBeenCalledWith(useCasePayload.thread);
    expect(mockCommentRepository.getCommentsByThreadId).toHaveBeenCalledWith(useCasePayload.thread);
    expect(mockReplyRepository.getRepliesByCommentId).toHaveBeenCalledWith('comment-1234');
    expect(mockUserCommentLikesRepository.getCommentLikes).toHaveBeenCalledWith('comment-1234');

    expect(detailThread).toStrictEqual({
      thread: {
        ...expectedThread,
        comments: expectedComments,
      }
    });
  });
});
