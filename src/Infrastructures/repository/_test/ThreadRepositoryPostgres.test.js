const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const InvariantError = require('../../../Commons/exceptions/InvariantError');
const AddThread = require('../../../Domains/threads/entities/AddThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread function', () => {
    it('should persist add thread and return added thread correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({id: 'user-1234', username: 'saeful'});

      const payloadThread = new AddThread({
        title: 'dicoding',
        body: 'Dicoding Indonesia',
        owner: 'user-1234',
      });
      const fakeIdGenerator = () => '1234'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await threadRepositoryPostgres.addThread(payloadThread);

      // Assert
      const threads = await ThreadsTableTestHelper.findThreadsById('thread-1234');
      expect(threads).toHaveLength(1);
    });

    it('should return added thread correctly', async () => {
      // Arrange
      const userPayload = { id: 'user-1234', username: 'saeful' };
      await UsersTableTestHelper.addUser(userPayload);

      const payloadThread = new AddThread({
        title: 'dicoding',
        body: 'Dicoding Indonesia',
        owner: userPayload.id,
      });
      const fakeIdGenerator = () => '1234'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedThread = await threadRepositoryPostgres.addThread(payloadThread);

      // Assert
      expect(addedThread).toStrictEqual(new AddedThread({
        id: 'thread-1234',
        title: payloadThread.title,
        owner: userPayload.id,
      }));
    });
  });

  describe('checkAvailabilityThread function', () => {
    it('should throw NotFoundError if thread not available', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});
      const threadId = 'xxx';

      // Action & Assert
      await expect(threadRepositoryPostgres.checkAvailabilityThread(threadId))
        .rejects.toThrow(NotFoundError);
    });

    it('should not throw NotFoundError if thread available', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});
      const userPayload = { id: 'user-1234', username: 'saeful' };
      const threadPayload = { id: 'thread-1234', body: 'sebuah thread', owner: 'user-1234' };
      await UsersTableTestHelper.addUser(userPayload);
      await ThreadsTableTestHelper.addThread(threadPayload);

      // Action & Assert
      await expect(threadRepositoryPostgres.checkAvailabilityThread(threadPayload.id))
        .resolves.not.toThrow(NotFoundError);
    });
  });

  describe('getDetailThread function', () => {
    it('should get detailTread', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});
      const userPayload = { id: 'user-1234', username: 'saeful' };
      const threadPayload = { 
        id: 'thread-1234', 
        title: 'sebuah title', 
        body: 'sebuah thread', 
        owner: userPayload.id,
        createdAt: new Date().toISOString(),
      };
      await UsersTableTestHelper.addUser(userPayload);
      await ThreadsTableTestHelper.addThread(threadPayload);

      // Action
      const detailThread = await threadRepositoryPostgres.getDetailThread(threadPayload.id);
      
      // Assert
      expect(detailThread.id).toEqual(threadPayload.id);
      expect(detailThread.title).toEqual(threadPayload.title);
      expect(detailThread.body).toEqual(threadPayload.body);
      expect(detailThread.username).toEqual(userPayload.username);
      expect(detailThread.date).toEqual(threadPayload.createdAt);
    });
  });
});
