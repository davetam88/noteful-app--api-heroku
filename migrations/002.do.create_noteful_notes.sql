CREATE TABLE noteful_notes (
  id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  folder_id INTEGER REFERENCES noteful_folders(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  content TEXT,
  modified TIMESTAMPTZ DEFAULT now() NOT NULL
);