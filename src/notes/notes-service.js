const NoteService = {
  getAllNotes(db) {
    return db('noteful_notes')
      .select('*');
  },

  insertNote(db, data) {
    return db('noteful_notes')
      .insert(data)
      .returning('*')
      .then(rows => ({
        ...data, id: rows[0].id
      }))
  },

  getById(db, id) {
    return db('noteful_notes')
      .select('*')
      .where({ id })
      .first();
  },
  // .first, select the first item found.

  deleteNote(db, id) {
    return db('noteful_notes')
      .where({ id })
      .delete();
  },

  updateNote(db, id, data) {
    return db('noteful_notes')
      .where({ id })
      .update(data);
  }
};

module.exports = NoteService;



