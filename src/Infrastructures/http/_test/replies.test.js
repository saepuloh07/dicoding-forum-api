const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/replies endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await RepliesTableTestHelper.cleanTable();
  });

  describe('when POST /threads/{threadId}/comments/{commentId}/replies', () => {
    it('should response 401 if payload not access token', async () => {
      // Arrange
      const server = await createServer(container);
  
      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/xxxx/comments/xxxx/replies',
        payload: {},
      });
  
      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const loginPayload = {
        username: 'saeful',
        password: 'password',
      };

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: loginPayload.username,
          password: loginPayload.password,
          fullname: 'Muhamad Saepuloh',
        },
      });

      const authentication = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: loginPayload,
      });
      const respAuth = JSON.parse(authentication.payload);

      const thread = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'ini sebuah title',
          body: 'ini sebuah body',
        },
        headers: { Authorization: `Bearer ${respAuth.data.accessToken}` },
      });
      const respThread = JSON.parse(thread.payload);
      const threadId = respThread.data.addedThread.id;

      const comment = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: { content: 'Ini content comment' },
        headers: { Authorization: `Bearer ${respAuth.data.accessToken}` },
      });
      const respComment = JSON.parse(comment.payload);
      const commentId = respComment.data.addedComment.id;

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: {},
        headers: { Authorization: `Bearer ${respAuth.data.accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat reply baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      const loginPayload = {
        username: 'saeful',
        password: 'password',
      };

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: loginPayload.username,
          password: loginPayload.password,
          fullname: 'Muhamad Saepuloh',
        },
      });

      const authentication = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: loginPayload,
      });
      const respAuth = JSON.parse(authentication.payload);

      const thread = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'ini sebuah title',
          body: 'ini sebuah body',
        },
        headers: { Authorization: `Bearer ${respAuth.data.accessToken}` },
      });
      const respThread = JSON.parse(thread.payload);
      const threadId = respThread.data.addedThread.id;

      const comment = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: { content: 'Ini content comment' },
        headers: { Authorization: `Bearer ${respAuth.data.accessToken}` },
      });
      const respComment = JSON.parse(comment.payload);
      const commentId = respComment.data.addedComment.id;

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: {
          content: ['ini sebuah content'],
        },
        headers: { Authorization: `Bearer ${respAuth.data.accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat reply baru karena tipe data tidak sesuai');
    });

    it('should response 201 and persisted reply', async () => {
      // Arrange
      const loginPayload = {
        username: 'saeful',
        password: 'password',
      };

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: loginPayload.username,
          password: loginPayload.password,
          fullname: 'Muhamad Saepuloh',
        },
      });

      const authentication = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: loginPayload,
      });
      const respAuth = JSON.parse(authentication.payload);

      const thread = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'ini sebuah title',
          body: 'ini sebuah body',
        },
        headers: { Authorization: `Bearer ${respAuth.data.accessToken}` },
      });
      const respThread = JSON.parse(thread.payload);
      const threadId = respThread.data.addedThread.id;

      const comment = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: { content: 'Ini content comment' },
        headers: { Authorization: `Bearer ${respAuth.data.accessToken}` },
      });
      const respComment = JSON.parse(comment.payload);
      const commentId = respComment.data.addedComment.id;

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: {
          content: 'ini sebuah content',
        },
        headers: { Authorization: `Bearer ${respAuth.data.accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedReply).toBeDefined();
    });
  });

  describe('when DETELE /threads/{threadId}/comments/{commentId}/replies/{replyId}', () => {
    it('should response 403 if comment is deleted by another user', async () => {
      // Arrange
      const loginPayload = {
        username: 'saeful',
        password: 'password',
      };

      const loginPayload1 = {
        username: 'saeful1',
        password: 'password',
      };

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: loginPayload.username,
          password: loginPayload.password,
          fullname: 'Muhamad Saepuloh',
        },
      });

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: loginPayload1.username,
          password: loginPayload1.password,
          fullname: 'Muhamad Saepuloh',
        },
      });

      const authentication = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: loginPayload,
      });
      const responseAuth = JSON.parse(authentication.payload);

      const authentication1 = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: loginPayload1,
      });
      const responseAuth1 = JSON.parse(authentication1.payload);

      const thread = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'ini sebuah title',
          body: 'ini sebuah body',
        },
        headers: { Authorization: `Bearer ${responseAuth.data.accessToken}` },
      });
      const responseThread = JSON.parse(thread.payload);
      const threadId = responseThread.data.addedThread.id;

      const comment = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: {
          content: 'Sebuah Comment',
        },
        headers: { Authorization: `Bearer ${responseAuth.data.accessToken}` },
      });
      const responseComment = JSON.parse(comment.payload);
      const commentId = responseComment.data.addedComment.id;

      const reply = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: {
          content: 'Sebuah Comment',
        },
        headers: { Authorization: `Bearer ${responseAuth.data.accessToken}` },
      });
      const responseReply = JSON.parse(reply.payload);
      const replyId = responseReply.data.addedReply.id;

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        headers: { Authorization: `Bearer ${responseAuth1.data.accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('anda tidak bisa menghapus komentar orang lain.');
    });

    it('should response 404 if thread not found', async () => {
      // Arrange
      const loginPayload = {
        username: 'saeful',
        password: 'password',
      };

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: loginPayload.username,
          password: loginPayload.password,
          fullname: 'Muhamad Saepuloh',
        },
      });

      const authentication = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: loginPayload,
      });
      const responseAuth = JSON.parse(authentication.payload);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/xxx/comments/xxx/replies/xxx`,
        headers: { Authorization: `Bearer ${responseAuth.data.accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });

    it('should response 404 if comment not found', async () => {
      // Arrange
      const loginPayload = {
        username: 'saeful',
        password: 'password',
      };

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: loginPayload.username,
          password: loginPayload.password,
          fullname: 'Muhamad Saepuloh',
        },
      });

      const authentication = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: loginPayload,
      });
      const responseAuth = JSON.parse(authentication.payload);

      const thread = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'ini sebuah title',
          body: 'ini sebuah body',
        },
        headers: { Authorization: `Bearer ${responseAuth.data.accessToken}` },
      });
      const responseThread = JSON.parse(thread.payload);
      const threadId = responseThread.data.addedThread.id;

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/xxx/replies/xxx`,
        headers: { Authorization: `Bearer ${responseAuth.data.accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('comment tidak ditemukan');
    });

    it('should response 404 if reply not found', async () => {
        // Arrange
        const loginPayload = {
          username: 'saeful',
          password: 'password',
        };
  
        const server = await createServer(container);
  
        await server.inject({
          method: 'POST',
          url: '/users',
          payload: {
            username: loginPayload.username,
            password: loginPayload.password,
            fullname: 'Muhamad Saepuloh',
          },
        });
  
        const authentication = await server.inject({
          method: 'POST',
          url: '/authentications',
          payload: loginPayload,
        });
        const responseAuth = JSON.parse(authentication.payload);
  
        const thread = await server.inject({
          method: 'POST',
          url: '/threads',
          payload: {
            title: 'ini sebuah title',
            body: 'ini sebuah body',
          },
          headers: { Authorization: `Bearer ${responseAuth.data.accessToken}` },
        });
        const responseThread = JSON.parse(thread.payload);
        const threadId = responseThread.data.addedThread.id;

        const comment = await server.inject({
          method: 'POST',
          url: `/threads/${threadId}/comments`,
          payload: {
            content: 'Sebuah Comment',
          },
          headers: { Authorization: `Bearer ${responseAuth.data.accessToken}` },
        });
        const responseComment = JSON.parse(comment.payload);
        const commentId = responseComment.data.addedComment.id;
  
        // Action
        const response = await server.inject({
          method: 'DELETE',
          url: `/threads/${threadId}/comments/${commentId}/replies/xxx`,
          headers: { Authorization: `Bearer ${responseAuth.data.accessToken}` },
        });
  
        // Assert
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(404);
        expect(responseJson.status).toEqual('fail');
        expect(responseJson.message).toEqual('reply tidak ditemukan');
      });

    it('should response 200 and return success', async () => {
      // Arrange
      const loginPayload = {
        username: 'saeful',
        password: 'password',
      };

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: loginPayload.username,
          password: loginPayload.password,
          fullname: 'Muhamad Saepuloh',
        },
      });

      const authentication = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: loginPayload,
      });
      const responseAuth = JSON.parse(authentication.payload);

      const thread = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'ini sebuah title',
          body: 'ini sebuah body',
        },
        headers: { Authorization: `Bearer ${responseAuth.data.accessToken}` },
      });
      const responseThread = JSON.parse(thread.payload);
      const threadId = responseThread.data.addedThread.id;

      const comment = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: {
          content: 'Sebuah Comment',
        },
        headers: { Authorization: `Bearer ${responseAuth.data.accessToken}` },
      });
      const responseComment = JSON.parse(comment.payload);
      const commentId = responseComment.data.addedComment.id;

      const reply = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: {
          content: 'Sebuah Comment',
        },
        headers: { Authorization: `Bearer ${responseAuth.data.accessToken}` },
      });
      const responseReply = JSON.parse(reply.payload);
      const replyId = responseReply.data.addedReply.id;

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        headers: { Authorization: `Bearer ${responseAuth.data.accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });
  });
});
