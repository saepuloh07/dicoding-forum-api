const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const UserCommentLikesTableTestHelper = require('../../../../tests/UserCommentLikesTableTestHelper');
const AddUserCommentLikes = require('../../../Domains/userCommentLikes/entities/AddUserCommentLikes');
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
    it('should return likesCount correctly after add new likes', async () => {
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
      const likes = await UserCommentLikesTableTestHelper.getCommentLikes(commentPayload.id);
      expect(likes).toHaveLength(1);
    });

    it('should return likesCount correctly after delete likes', async () => {
      // Arrange
      const userPayload = { id: 'user-1234', username: 'saeful' };
      const threadPayload = { id: 'thread-1234', owner: userPayload.id };
      const commentPayload = { id: 'comment-1234', thread: threadPayload.id, owner: userPayload.id };
      const likesPayload = { id: 'likes-0001', owner: userPayload.id, comment: commentPayload.id };
      await UsersTableTestHelper.addUser(userPayload);
      await ThreadsTableTestHelper.addThread(threadPayload);
      await CommentsTableTestHelper.addComment(commentPayload);
      await UserCommentLikesTableTestHelper.addUserCommentLikes(likesPayload);

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
      const likes = await UserCommentLikesTableTestHelper.getCommentLikes(commentPayload.id);
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
      expect(likesCount).toEqual(2);
    });
  });
});
