/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const UserCommentLikesTableTestHelper = {
  async addUserCommentLikes({
    id = 'likes-1234', owner = 'user-1234', comment = 'comment-1234',
  }) {
    const query = {
      text: 'INSERT INTO user_comment_likes VALUES($1, $2, $3)',
      values: [id, owner, comment],
    };

    await pool.query(query);
  },

  async findLikesByCommentAndOwner(comment, owner) {
    const query = {
      text: 'SELECT * FROM user_comment_likes WHERE owner = $1 AND comment = $2',
      values: [owner, comment],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async deleteUserCommentLikes(id) {
    const query = {
      text: 'DELETE FROM user_comment_likes WHERE id = $1',
      values: [id],
    };

    await pool.query(query);
  },

  async cleanTable() {
    await pool.query('DELETE FROM user_comment_likes WHERE 1=1');
  },
};

module.exports = UserCommentLikesTableTestHelper;
