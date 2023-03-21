const DetailReply = require('../DetailReply');

describe('a DetailReply entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {};

    // Action and Assert
    expect(() => new DetailReply(payload)).toThrowError('DETAIL_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      replies: 123,
    };

    // Action and Assert
    expect(() => new DetailReply(payload)).toThrowError('DETAIL_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should remap comments data incorrectly', () => {
    const payload = {
      replies: [
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
          content: 'balasan yang lain tapi udah dihapus',
        },
      ],
    };

    const { replies } = new DetailReply(payload);

    expect(replies).toEqual(payload.replies);
  });

  it('should create detailReply object correctly after remap', () => {
    // Arrange
    const payload = {
      replies: [
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
          content: 'balasan yang lain tapi udah dihapus',
          is_deleted: true,
        },
      ],
    };

    const expectedPayload = [
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

    // Action
    const { replies } = new DetailReply(payload);

    // Assert
    expect(replies).toEqual(expectedPayload);
  });
});
