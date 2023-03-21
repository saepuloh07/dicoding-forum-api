const AddComment = require('../AddComment');

describe('a AddComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      content: 'abc',
      owner: 'user-1234',
    };

    // Action and Assert
    expect(() => new AddComment(payload)).toThrowError('ADD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      thread: 123,
      content: true,
      owner: 'abc',
    };

    // Action and Assert
    expect(() => new AddComment(payload)).toThrowError('ADD_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create addComment object correctly', () => {
    // Arrange
    const payload = {
      thread: 'thread-1234',
      content: 'Ini sebuah content',
      owner: 'user-1234',
    };

    // Action
    const { thread, content, owner } = new AddComment(payload);

    // Assert
    expect(thread).toEqual(payload.thread);
    expect(content).toEqual(payload.content);
    expect(owner).toEqual(payload.owner);
  });
});
