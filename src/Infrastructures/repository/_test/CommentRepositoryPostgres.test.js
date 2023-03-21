const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const AddComment = require('../../../Domains/comments/entities/AddComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('CommentRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addComment function', () => {
    it('should persist add comment and return added comment correctly', async () => {
      // Arrange
      const userPayload = { id: 'user-1234', username: 'saeful', fullname: 'Muhamad Saepuloh' };
      const threadPayload = { id: 'thread-1234', title: 'Sebuah title', body: 'Sebuah body thread', owner: userPayload.id };
      await UsersTableTestHelper.addUser(userPayload);
      await ThreadsTableTestHelper.addThread(threadPayload);

      const payloadComment = new AddComment({
        thread: threadPayload.id,
        content: 'Ini Sebuah Comment',
        owner: userPayload.id,
      });
      const fakeIdGenerator = () => '1234'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);
      const commentId = 'comment-1234';

      // Action
      await commentRepositoryPostgres.addComment(payloadComment);

      // Assert
      const comments = await CommentsTableTestHelper.findCommentsById(commentId);
      expect(comments).toHaveLength(1);
    });

    it('should return added comment correctly', async () => {
      // Arrange
      const userPayload = { id: 'user-1234', username: 'saeful', fullname: 'Muhamad Saepuloh' };
      const threadPayload = { id: 'thread-1234', title: 'Sebuah title', body: 'Sebuah body thread', owner: userPayload.id };
      await UsersTableTestHelper.addUser(userPayload);
      await ThreadsTableTestHelper.addThread(threadPayload);

      const payloadComment = new AddComment({
        thread: threadPayload.id,
        content: 'Ini Sebuah Content',
        owner: userPayload.id,
      });
      const fakeIdGenerator = () => '1234'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedComment = await commentRepositoryPostgres.addComment(payloadComment);

      // Assert
      expect(addedComment).toStrictEqual(new AddedComment({
        id: 'comment-1234',
        content: payloadComment.content,
        owner: userPayload.id,
      }));
    });
  });

  describe('checkAvailabilityComment function', () => {
    it('should throw NotFoundError if comment not available', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      const commentId = 'xxx';

      // Action & Assert
      await expect(commentRepositoryPostgres.checkAvailabilityComment(commentId))
        .rejects.toThrow(NotFoundError);
    });

    it('should not throw NotFoundError if comment available', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      const userPayload = { id: 'user-1234', username: 'saeful', fullname: 'Muhamad Saepuloh' };
      const threadPayload = { id: 'thread-1234', title: 'Sebuah title', body: 'Sebuah body thread', owner: userPayload.id };
      const commentPayload = { id: 'comment-1234', thread: threadPayload.id, content: 'Sebuah Content', owner: userPayload.id };
      await UsersTableTestHelper.addUser(userPayload);
      await ThreadsTableTestHelper.addThread(threadPayload);
      await CommentsTableTestHelper.addComment(commentPayload);

      // Action & Assert
      await expect(commentRepositoryPostgres.checkAvailabilityComment(commentPayload.id))
        .resolves.not.toThrow(NotFoundError);
    });
  });

  describe('verifyCommentOwner function', () => {
    it('should throw AuthorizationError if comment dont belong to owner', async () => {
      // Arrange
      const userPayload = { id: 'user-1234', username: 'saeful', fullname: 'Muhamad Saepuloh' };
      const userPayload1 = { id: 'user-4321', username: 'epul', fullname: 'Muhamad Saepuloh' };
      const threadPayload = { id: 'thread-1234', title: 'Sebuah title', body: 'Sebuah body thread', owner: userPayload.id };
      const commentPayload = { id: 'comment-1234', thread: threadPayload.id, content: 'Sebuah Content', owner: userPayload.id };
      await UsersTableTestHelper.addUser(userPayload);
      await UsersTableTestHelper.addUser(userPayload1);
      await ThreadsTableTestHelper.addThread(threadPayload);
      await CommentsTableTestHelper.addComment(commentPayload);

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentOwner(commentPayload.id, userPayload1.id))
        .rejects.toThrow(AuthorizationError);
    });

    it('should not throw AuthorizationError if comment belongs to the owner', async () => {
      // Arrange
      const userPayload = { id: 'user-1234', username: 'saeful', fullname: 'Muhamad Saepuloh' };
      const threadPayload = { id: 'thread-1234', title: 'Sebuah title', body: 'Sebuah body thread', owner: userPayload.id };
      const commentPayload = { id: 'comment-1234', thread: threadPayload.id, content: 'Sebuah Content', owner: userPayload.id };
      await UsersTableTestHelper.addUser(userPayload);
      await ThreadsTableTestHelper.addThread(threadPayload);
      await CommentsTableTestHelper.addComment(commentPayload);

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentOwner(commentPayload.id, userPayload.id))
        .resolves.not.toThrow(AuthorizationError);
    });
  });

  describe('deleteComment function', () => {
    it('should soft delete comment from database', async () => {
      // Arrange
      const userPayload = { id: 'user-1234', username: 'saeful', fullname: 'Muhamad Saepuloh' };
      const threadPayload = { id: 'thread-1234', title: 'Sebuah title', body: 'Sebuah body thread', owner: userPayload.id };
      const commentPayload = { id: 'comment-1234', thread: threadPayload.id, content: 'Sebuah Content', owner: userPayload.id };
      await UsersTableTestHelper.addUser(userPayload);
      await ThreadsTableTestHelper.addThread(threadPayload);
      await CommentsTableTestHelper.addComment(commentPayload);

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      await commentRepositoryPostgres.deleteComment(commentPayload.id);

      // Assert
      const comment = await CommentsTableTestHelper.checkIsDeletedCommentsById(commentPayload.id);
      expect(comment).toEqual(true);
    });
  });

  describe('getCommentsByThreadId function', () => {
    it('should get comments by thread id', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      const userPayload = { id: 'user-1234', username: 'saeful' };
      const threadPayload = { id: 'thread-1234', title: 'sebuah title', body: 'sebuah thread', owner: userPayload.id };
      const commentPayload = { id: 'comment-1234', thread: threadPayload.id, content: 'sebuah comment', owner: userPayload.id, createdAt: new Date().toISOString(), };
      await UsersTableTestHelper.addUser(userPayload);
      await ThreadsTableTestHelper.addThread(threadPayload);
      await CommentsTableTestHelper.addComment(commentPayload);

      // Action
      const commentsThread = await commentRepositoryPostgres.getCommentsByThreadId(threadPayload.id);

      // Assert
      expect(Array.isArray(commentsThread)).toBe(true);
      expect(commentsThread).toStrictEqual([{
        id: commentPayload.id,
        content: commentPayload.content,
        username: userPayload.username,
        date: commentPayload.createdAt,
        is_deleted: false,
      }]);
    });
  });
});
