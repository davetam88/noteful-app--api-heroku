const path = require('path')
const express = require('express')
const xss = require('xss')
const logger = require('../logger')
const NotesService = require('./notes-service')
const { getNoteValidationError } = require('./notes-validator')

const notesRouter = express.Router()
const jsonParser = express.json()

const serializeNote = note => ({
  id: note.id,
  folder_id: Number(note.folder_id),
  name: xss(note.name),
  content: xss(note.content),
  modified: note.modified,
})

// for / get and post 
notesRouter
  .route('/')
  .get((req, res, next) => {

    NotesService.getAllNotes(
      req.app.get('db')
    )
      .then(notes => {
        res.json(notes.map(serializeNote))
      })
      .catch(next)
  })


  .post(jsonParser, (req, res, next) => {
    const { folder_id, name, content, modified } = req.body
    const newNote = { folder_id, name, content }

    // check for required fields
    for (const [key, value] of Object.entries(newNote))
    {
      if (value == null)
      {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        })
      }
    }

    newNote.modified = modified;

    // const error = getNoteValidationError(newNote)

    NotesService.insertNote(
      req.app.get('db'),
      newNote
    )
      .then(note => {
        // console.log(`note :>> `, note) ||
        res
          .status(201)
          // .location(`/notes/${note.id}`)
          .location(path.posix.join(req.originalUrl, `/${note.id}`))
          .json(note)
      })
      .catch(next)
  })

// for / get with route id : get, delete and patch
notesRouter
  .route('/:note_id')
  .all((req, res, next) => {
    NotesService.getById(
      req.app.get('db'),
      req.params.note_id
    )
      .then(note => {
        if (!note)
        {
          return res.status(404).json({
            error: { message: `Note doesn't exist` }
          })
        }
        res.note = note // save the note for the next middleware
        next() // don't forget to call next so the next middleware happens!
      })
      .catch(next)
  })
  .get((req, res, next) => {
    res.json(serializeNote(res.note))
  })
  .delete((req, res, next) => {
    NotesService.deleteNote(
      req.app.get('db'),
      req.params.note_id
    )
      .then(() => {
        res.status(204).end()
      })
      .catch(next)
  })
  .patch(jsonParser, (req, res, next) => {
    const { name, content } = req.body
    const noteToUpdate = { name, content }

    const numberOfValues = Object.values(noteToUpdate).filter(Boolean).length
    if (numberOfValues === 0)
    {
      return res.status(400).json({
        error: {
          message: `Request body must contain either 'title' or 'url'`
        }
      })
    }
    // const error = getNoteValidationError(noteToUpdate)
    // if (error) return res.status(400).send(error)

    NotesService.updateNote(
      req.app.get('db'),
      req.params.note_id,
      noteToUpdate
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })


module.exports = notesRouter

