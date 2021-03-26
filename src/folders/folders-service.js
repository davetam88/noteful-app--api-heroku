const FolderService = {
  getAllFolders(db) {
    return db('noteful_folders')
      .select('*');
  },

  insertFolder(db, data) {
    return db('noteful_folders')
      .insert(data)
      .returning('*')
      .then(rows => ({
        ...data, id: rows[0].id
      }))
  },

  getById(db, id) {
    return db('noteful_folders')
      .select('*')
      .where({ id })
      .first();
  },
  // .first, select the first item found.

  deleteFolder(db, id) {
    return db('noteful_folders')
      .where({ id })
      .delete();
  },

  updateFolder(db, id, data) {
    return db('noteful_folders')
      .where({ id })
      .update(data);
  }
};

module.exports = FolderService;


