const InvariantError = require('../../Commons/exceptions/InvariantError');
const AddedReply = require('../../Domains/replies/entities/AddedReply');
const ReplyRepository = require('../../Domains/replies/ReplyRepository');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply(payload) {
    const { thread, comment, content, owner } = payload;
    const id = `reply-${this._idGenerator()}`;
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: 'INSERT INTO replies VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, content, owner',
      values: [id, thread, comment, content, owner, false, createdAt, updatedAt],
    };

    const result = await this._pool.query(query);

    return new AddedReply(result.rows[0]);
  }

  async checkAvailabilityReply(commentId) {
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1',
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (result.rows.length === 0) {
      throw new NotFoundError('reply tidak ditemukan');
    }
  }

  async verifyReplyOwner(replyId, owner) {
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1 AND owner = $2',
      values: [replyId, owner],
    };

    const result = await this._pool.query(query);

    if (result.rowCount === 0) {
      throw new AuthorizationError('anda tidak bisa menghapus komentar orang lain.');
    }
  }

  async deleteReply(replyId) {
    const query = {
      text: 'UPDATE replies SET is_deleted=TRUE WHERE id = $1',
      values: [replyId],
    };

    await this._pool.query(query);
  }

  async getRepliesByCommentId(commentId) {
    const query = {
      text: 'select replies.id, users.username, replies.created_at as date, replies.content, replies.is_deleted from replies left join users on replies.owner=users.id where comment=$1 ORDER BY replies.created_at ASC',
      values: [commentId],
    };

    const { rows } = await this._pool.query(query);
    return rows;
  }
}

module.exports = ReplyRepositoryPostgres;
