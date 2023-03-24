const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const UserCommentLikesTableTestHelper = require('../../../../tests/UserCommentLikesTableTestHelper');
const AddUserCommentLikes = require('../../../Domains/userCommentLikes/entities/AddDeleteCommentLikes');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const UserCommentLikesRepositoryPostgres = require('../UserCommentLikesRepositoryPostgres');

describe('UserCommentLikesRepositoryPostgres', () => {
  afterEach(async () => {
    await UserCommentLikesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addUserCommentLikes function', () => {
    it('should persist add new comment like correctly', async () => {
      // Arrange
      const userPayload = { id: 'user-1234', username: 'saeful' };
      const threadPayload = { id: 'thread-1234', owner: userPayload.id };
      const commentPayload = { id: 'comment-1234', thread: threadPayload.id, owner: userPayload.id };
      await UsersTableTestHelper.addUser(userPayload);
      await ThreadsTableTestHelper.addThread(threadPayload);
      await CommentsTableTestHelper.addComment(commentPayload);

      const payload = new AddUserCommentLikes({
        owner: userPayload.id,
        comment: commentPayload.id,
        thread: threadPayload.id
      });
      const fakeIdGenerator = () => '1234'; // stub!
      const userCommentLikesRepositoryPostgres = new UserCommentLikesRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await userCommentLikesRepositoryPostgres.addUserCommentLikes(payload);

      // Assert
      const likes = await UserCommentLikesTableTestHelper.findLikesByCommentAndOwner(commentPayload.id, userPayload.id);
      expect(likes).toHaveLength(1);
    });
  });

  describe('verifyCommentLikeIsExist function', () => {
    it('should return TRUE if comment like already exist', async () => {
      // Arrange
      const userPayload = { id: 'user-1234', username: 'saeful' };
      const threadPayload = { id: 'thread-1234', owner: userPayload.id };
      const commentPayload = { id: 'comment-1234', thread: threadPayload.id, owner: userPayload.id };
      const likePayload = { id: 'likes-1234', comment: commentPayload.id, owner: userPayload.id };
      await UsersTableTestHelper.addUser(userPayload);
      await ThreadsTableTestHelper.addThread(threadPayload);
      await CommentsTableTestHelper.addComment(commentPayload);
      await UserCommentLikesTableTestHelper.addUserCommentLikes(likePayload);

      const fakeIdGenerator = () => '1234'; // stub!
      const userCommentLikesRepositoryPostgres = new UserCommentLikesRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const isExist = await userCommentLikesRepositoryPostgres.verifyCommentLikeIsExist(likePayload);

      // Assert
      expect(isExist).toBeDefined();
      expect(isExist).toStrictEqual(true);
    });

    it('should return FALSE if comment like does not exist', async () => {
      // Arrange
      const userCommentLikesRepositoryPostgres = new UserCommentLikesRepositoryPostgres(pool, {});

      // Action
      const isExist = await userCommentLikesRepositoryPostgres.verifyCommentLikeIsExist({owner: 'user-1234', comment: 'comment-1234'});

      // Assert
      expect(isExist).toBeDefined();
      expect(isExist).toStrictEqual(false);
    });
  });

  describe('deleteUserCommentLikes function', () => {
    it('should persist delete comment like correctly', async () => {
      // Arrange
      const userPayload = { id: 'user-1234', username: 'saeful' };
      const threadPayload = { id: 'thread-1234', owner: userPayload.id };
      const commentPayload = { id: 'comment-1234', thread: threadPayload.id, owner: userPayload.id };
      const likePayload = { id: 'likes-1234', comment: commentPayload.id, owner: userPayload.id };
      await UsersTableTestHelper.addUser(userPayload);
      await ThreadsTableTestHelper.addThread(threadPayload);
      await CommentsTableTestHelper.addComment(commentPayload);
      await UserCommentLikesTableTestHelper.addUserCommentLikes(likePayload);

      const payload = new AddUserCommentLikes({
        owner: userPayload.id,
        comment: commentPayload.id,
        thread: threadPayload.id
      });
      const fakeIdGenerator = () => '1234'; // stub!
      const userCommentLikesRepositoryPostgres = new UserCommentLikesRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await userCommentLikesRepositoryPostgres.deleteUserCommentLikes(payload);

      // Assert
      const likes = await UserCommentLikesTableTestHelper.findLikesByCommentAndOwner(commentPayload.id, userPayload.id);
      expect(likes).toHaveLength(0);
    });
  });

  describe('getCommentLikes function', () => {
    it('should get comment likes', async () => {
      // Arrange
      const userCommentLikesRepositoryPostgres = new UserCommentLikesRepositoryPostgres(pool, {});
      const userPayload1 = { id: 'user-0001', username: 'saeful1' };
      const userPayload2 = { id: 'user-0002', username: 'saeful2' };
      const threadPayload = { id: 'thread-1234', owner: userPayload1.id };
      const commentPayload = { id: 'comment-1234', thread: threadPayload.id, owner: userPayload1.id };
      const likesPayload1 = { id: 'likes-0001', owner: userPayload1.id, comment: commentPayload.id };
      const likesPayload2 = { id: 'likes-0002', owner: userPayload2.id, comment: commentPayload.id };
      await UsersTableTestHelper.addUser(userPayload1);
      await UsersTableTestHelper.addUser(userPayload2);
      await ThreadsTableTestHelper.addThread(threadPayload);
      await CommentsTableTestHelper.addComment(commentPayload);
      await UserCommentLikesTableTestHelper.addUserCommentLikes(likesPayload1);
      await UserCommentLikesTableTestHelper.addUserCommentLikes(likesPayload2);

      // Action
      const likesCount = await userCommentLikesRepositoryPostgres.getCommentLikes(commentPayload.id);
      
      // Assert
      expect(likesCount).toBeDefined();
      expect(likesCount).toEqual(2);
    });
  });
});
