const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const AddReply = require('../../../Domains/replies/entities/AddReply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const pool = require('../../database/postgres/pool');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('ReplyRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await RepliesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addReply function', () => {
    it('should persist add reply and return added reply correctly', async () => {
      // Arrange
      const userPayload = { id: 'user-1234', username: 'saeful' };
      const threadPayload = { id: 'thread-1234', owner: userPayload.id };
      const commentPayload = { id: 'comment-1234', thread: threadPayload.id, owner: userPayload.id };
      await UsersTableTestHelper.addUser(userPayload);
      await ThreadsTableTestHelper.addThread(threadPayload);
      await CommentsTableTestHelper.addComment(commentPayload);

      const payload = new AddReply({
        thread: threadPayload.id,
        comment: commentPayload.id,
        content: 'Ini Sebuah Reply',
        owner: userPayload.id,
      });
      const fakeIdGenerator = () => '1234'; // stub!
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await replyRepositoryPostgres.addReply(payload);

      // Assert
      const replies = await RepliesTableTestHelper.findRepliesById('reply-1234');
      expect(replies).toHaveLength(1);
    });

    it('should return added reply correctly', async () => {
      // Arrange
      const userPayload = { id: 'user-1234', username: 'saeful' };
      const threadPayload = { id: 'thread-1234', owner: userPayload.id };
      const commentPayload = { id: 'comment-1234', thread: threadPayload.id, owner: userPayload.id };
      await UsersTableTestHelper.addUser(userPayload);
      await ThreadsTableTestHelper.addThread(threadPayload);
      await CommentsTableTestHelper.addComment(commentPayload);

      const payload = new AddReply({
        thread: threadPayload.id,
        comment: commentPayload.id,
        content: 'Ini Sebuah Reply',
        owner: userPayload.id,
      });
      const fakeIdGenerator = () => '1234'; // stub!
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedReply = await replyRepositoryPostgres.addReply(payload);

      // Assert
      expect(addedReply).toStrictEqual(new AddedReply({
        id: 'reply-1234',
        content: 'Ini Sebuah Reply',
        owner: userPayload.id,
      }));
    });
  });

  describe('checkAvailabilityReply function', () => {
    it('should throw NotFoundError if reply not available', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});
      const replyId = 'xxx';

      // Action & Assert
      await expect(replyRepositoryPostgres.checkAvailabilityReply(replyId))
        .rejects.toThrow(NotFoundError);
    });

    it('should not throw NotFoundError if reply available', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});
      const userPayload = { id: 'user-1234', username: 'saeful' };
      const threadPayload = { id: 'thread-1234', body: 'sebuah thread', owner: userPayload.id };
      const commentPayload = { id: 'comment-1234', thread: threadPayload.id, owner: userPayload.id };
      const replyPayload = { id: 'reply-1234', thread: threadPayload.id, comment: commentPayload.id, owner: userPayload.id };
      await UsersTableTestHelper.addUser(userPayload);
      await ThreadsTableTestHelper.addThread(threadPayload);
      await CommentsTableTestHelper.addComment(commentPayload);
      await RepliesTableTestHelper.addReply(replyPayload);

      // Action & Assert
      await expect(replyRepositoryPostgres.checkAvailabilityReply(replyPayload.id))
        .resolves.not.toThrow(NotFoundError);
    });
  });

  describe('verifyReplyOwner function', () => {
    it('should throw AuthorizationError if reply dont belong to owner', async () => {
      // Arrange
      const userPayload1 = { id: 'user-1234', username: 'saeful 1', fullname: 'Muhamad Saepuloh 1' };
      const userPayload2 = { id: 'user-5678', username: 'saeful 2', fullname: 'Muhamad Saepuloh 2' };
      const threadPayload = { id: 'thread-1234', title: 'Sebuah title', owner: userPayload1.id };
      const commentPayload = { id: 'comment-1234', thread: threadPayload.id, owner: userPayload1.id };
      const replyPayload = { id: 'reply-1234', thread: threadPayload.id, comment: commentPayload.id, owner: userPayload1.id };
      await UsersTableTestHelper.addUser(userPayload1);
      await UsersTableTestHelper.addUser(userPayload2);
      await ThreadsTableTestHelper.addThread(threadPayload);
      await CommentsTableTestHelper.addComment(commentPayload);
      await RepliesTableTestHelper.addReply(replyPayload);

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyReplyOwner(replyPayload.id, userPayload2.id))
        .rejects.toThrow(AuthorizationError);
    });

    it('should not throw AuthorizationError if comment belongs to the owner', async () => {
      // Arrange
      const userPayload1 = { id: 'user-1234', username: 'saeful 1', fullname: 'Muhamad Saepuloh 1' };
      const threadPayload = { id: 'thread-1234', title: 'Sebuah title', owner: userPayload1.id };
      const commentPayload = { id: 'comment-1234', thread: threadPayload.id, owner: userPayload1.id };
      const replyPayload = { id: 'reply-1234', thread: threadPayload.id, comment: commentPayload.id, owner: userPayload1.id };
      await UsersTableTestHelper.addUser(userPayload1);
      await ThreadsTableTestHelper.addThread(threadPayload);
      await CommentsTableTestHelper.addComment(commentPayload);
      await RepliesTableTestHelper.addReply(replyPayload);

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyReplyOwner(replyPayload.id, userPayload1.id))
        .resolves.not.toThrow(AuthorizationError);
    });
  });

  describe('deleteReply function', () => {
    it('should soft delete reply', async () => {
      // Arrange
      const userPayload = { id: 'user-1234', username: 'saeful 1', fullname: 'Muhamad Saepuloh 1' };
      const threadPayload = { id: 'thread-1234', title: 'Sebuah title', owner: userPayload.id };
      const commentPayload = { id: 'comment-1234', thread: threadPayload.id, owner: userPayload.id };
      const replyPayload = { id: 'reply-1234', thread: threadPayload.id, comment: commentPayload.id, owner: userPayload.id };
      await UsersTableTestHelper.addUser(userPayload);
      await ThreadsTableTestHelper.addThread(threadPayload);
      await CommentsTableTestHelper.addComment(commentPayload);
      await RepliesTableTestHelper.addReply(replyPayload);

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      await replyRepositoryPostgres.deleteReply(replyPayload.id);

      // Assert
      const reply = await RepliesTableTestHelper.checkIsDeletedRepliesById(replyPayload.id);
      expect(reply).toEqual(true);
    });
  });

  describe('getRepliesByCommentId function', () => {
    it('should get replies by comment id', async () => {
      // Arrange
      const userPayload = { id: 'user-1234', username: 'saeful 1', fullname: 'Muhamad Saepuloh 1' };
      const threadPayload = { id: 'thread-1234', title: 'Sebuah title', owner: userPayload.id };
      const commentPayload = { id: 'comment-1234', thread: threadPayload.id, owner: userPayload.id };
      const replyPayload = { id: 'reply-1234', thread: threadPayload.id, comment: commentPayload.id, content: 'Ini Contoh Reply', owner: userPayload.id, createdAt: new Date().toISOString(), };
      await UsersTableTestHelper.addUser(userPayload);
      await ThreadsTableTestHelper.addThread(threadPayload);
      await CommentsTableTestHelper.addComment(commentPayload);
      await RepliesTableTestHelper.addReply(replyPayload);

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      const repliesComment = await replyRepositoryPostgres.getRepliesByCommentId(commentPayload.id);

      // Assert
      expect(Array.isArray(repliesComment)).toBe(true);
      expect(repliesComment[0].id).toEqual(replyPayload.id);
      expect(repliesComment[0].content).toEqual(replyPayload.content);
      expect(repliesComment[0].username).toEqual(userPayload.username);
      expect(repliesComment[0].date).toEqual(replyPayload.createdAt);
    });
  });
});
