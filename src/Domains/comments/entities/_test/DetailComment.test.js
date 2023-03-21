const DetailComment = require('../DetailComment');

describe('a DetailComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {};

    // Action and Assert
    expect(() => new DetailComment(payload)).toThrowError('DETAIL_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      comments: 123,
    };

    // Action and Assert
    expect(() => new DetailComment(payload)).toThrowError('DETAIL_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should remap comments data incorrectly', () => {
    const payload = {
      comments: [
        {
          id: 'comment-1234',
          username: 'saefull',
          date: '2021-08-08T07:22:33.555Z',
          content: 'sebuah comment',
        },
        {
          id: 'comment-5678',
          username: 'dicoding',
          date: '2021-08-08T07:26:21.338Z',
          content: 'komentar yang lain tapi udah dihapus',
        },
      ],
    };

    const { comments } = new DetailComment(payload);

    expect(comments).toEqual(payload.comments);
  });

  it('should create detailComment object correctly after remap', () => {
    // Arrange
    const payload = {
      comments: [
        {
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
          content: 'komentar yang lain tapi udah dihapus',
          is_deleted: true,
        },
      ],
    };

    const expectedPayload = [
      {
        id: 'comment-1234',
        username: 'saeful',
        date: '2023-03-10T07:22:33.555Z',
        content: 'komentar dari saeful',
      },
      {
        id: 'comment-5678',
        username: 'dicoding',
        date: '2023-03-10T07:22:33.555Z',
        content: '**komentar telah dihapus**',
      },
    ];

    // Action
    const { comments } = new DetailComment(payload);

    // Assert
    expect(comments).toEqual(expectedPayload);
  });
});
