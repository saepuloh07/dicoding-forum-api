/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const ReplisTableTestHelper = {
  async addReply({
    id = 'replies-1234', thread = 'thread-1234', comment = 'comment-1234', content = 'Ini Sebuah Content', owner = 'user-1234', createdAt = new Date().toISOString(),
  }) {
    const updatedAt = createdAt;
    const query = {
      text: 'INSERT INTO replies VALUES($1, $2, $3, $4, $5, $6, $7, $8)',
      values: [id, thread, comment, content, owner, false, createdAt, updatedAt],
    };

    await pool.query(query);
  },

  async findRepliesById(id) {
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async checkIsDeletedRepliesById(id) {
    const query = {
      text: 'SELECT is_deleted FROM replies WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    const isDeleted = result.rows[0].is_deleted;
    return isDeleted;
  },

  async cleanTable() {
    await pool.query('DELETE FROM replies WHERE 1=1');
  },
};

module.exports = ReplisTableTestHelper;
