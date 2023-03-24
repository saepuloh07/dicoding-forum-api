const AddDeleteCommentLikes = require('../AddDeleteCommentLikes');

describe('a AddDeleteCommentLikes entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      owner: 'user-1234',
    };

    // Action and Assert
    expect(() => new AddDeleteCommentLikes(payload)).toThrowError('ADD_USER_COMMENT_LIKES.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      owner: 1234,
      comment: true,
      thread: ["true"],
    };

    // Action and Assert
    expect(() => new AddDeleteCommentLikes(payload)).toThrowError('ADD_USER_COMMENT_LIKES.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create addDeleteCommentLikes object correctly', () => {
    // Arrange
    const payload = {
      owner: 'user-1234',
      comment: 'comment-1234',
      thread: 'thread-1234',
    };

    // Action
    const { owner, comment, thread } = new AddDeleteCommentLikes(payload);

    // Assert
    expect(owner).toEqual(payload.owner);
    expect(comment).toEqual(payload.comment);
    expect(thread).toEqual(payload.thread);
  });
});
