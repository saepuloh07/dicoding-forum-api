const UserCommentLikesRepository = require('../UserCommentLikesRepository');

describe('UserCommentLikesRepository interface', () => {
  it('should throw error when invoke abstract behavior', async () => {
    // Arrange
    const userCommentLikesRepository = new UserCommentLikesRepository();

    // Action and Assert
    await expect(userCommentLikesRepository.addUserCommentLikes({})).rejects.toThrowError('USER_COMMENT_LIKES_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(userCommentLikesRepository.verifyCommentLikeIsExist({})).rejects.toThrowError('USER_COMMENT_LIKES_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(userCommentLikesRepository.deleteUserCommentLikes({})).rejects.toThrowError('USER_COMMENT_LIKES_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(userCommentLikesRepository.getCommentLikes()).rejects.toThrowError('USER_COMMENT_LIKES_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});
