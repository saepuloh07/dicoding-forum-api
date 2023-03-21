const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AddedThread = require('../../Domains/threads/entities/AddedThread');
const UserCommentLikesRepository = require('../../Domains/userCommentLikes/UserCommentLikesRepository');

class UserCommentLikesRepositoryPostgres extends UserCommentLikesRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addUserCommentLikes({ owner, comment }) {
    try {
      const id = `likes-${this._idGenerator()}`;

      const query = {
        text: 'INSERT INTO user_comment_likes VALUES($1, $2, $3) RETURNING id, owner, comment',
        values: [id, owner, comment],
      };

      await this._pool.query(query);
    } catch (error) {
      await this.deleteUserCommentLikes({ owner, comment });
    }
  }

  async deleteUserCommentLikes({ owner, comment }) {
    const query = {
      text: 'DELETE FROM user_comment_likes WHERE owner = $1 AND comment = $2',
      values: [owner, comment],
    };

    await this._pool.query(query);
  }

  async getCommentLikes(comment) {
    const query = {
      text: 'SELECT owner FROM user_comment_likes WHERE comment = $1',
      values: [comment],
    };

    const result = await this._pool.query(query);
    return result.rowCount;
  }
}

module.exports = UserCommentLikesRepositoryPostgres;
