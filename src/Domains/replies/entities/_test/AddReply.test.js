const AddReply = require('../AddReply');

describe('a AddReply entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      content: 'abc',
      owner: 'user-1234',
    };

    // Action and Assert
    expect(() => new AddReply(payload)).toThrowError('ADD_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      thread: 123,
      comment: {},
      content: true,
      owner: 'abc',
    };

    // Action and Assert
    expect(() => new AddReply(payload)).toThrowError('ADD_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create addReply object correctly', () => {
    // Arrange
    const payload = {
      thread: 'thread-1234',
      comment: 'comment-1234',
      content: 'Ini sebuah content',
      owner: 'user-1234',
    };

    // Action
    const { thread, comment, content, owner } = new AddReply(payload);

    // Assert
    expect(thread).toEqual(payload.thread);
    expect(comment).toEqual(payload.comment);
    expect(content).toEqual(payload.content);
    expect(owner).toEqual(payload.owner);
  });
});
