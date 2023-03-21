exports.up = pgm => {
  pgm.createTable('user_comment_likes', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    owner: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    comment: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
  });

  pgm.addConstraint('user_comment_likes', 'unique_owner_and_comment', 'UNIQUE(owner, comment)');

  pgm.addConstraint('user_comment_likes', 'fk_user_comment_likes.owner_users.id', 'FOREIGN KEY(owner) REFERENCES users(id) ON DELETE CASCADE');
  pgm.addConstraint('user_comment_likes', 'fk_user_comment_likes.comment_comments.id', 'FOREIGN KEY(comment) REFERENCES comments(id) ON DELETE CASCADE');
};

exports.down = pgm => {
  pgm.dropTable('user_comment_likes');
};
