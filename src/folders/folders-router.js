const path = require('path')
const express = require('express')
const xss = require('xss')
const logger = require('../logger')
const FoldersService = require('./folders-service')
const foldersRouter = express.Router()
const jsonParser = express.json()

const serializeFolder = folder => ({
  id: folder.id,
  name: xss(folder.name),
})

// for / get and post 
foldersRouter
  .route('/')
  .get((req, res, next) => {
    FoldersService.getAllFolders(
      req.app.get('db')
    )
      .then(folders => {
        res.json(folders.map(serializeFolder))
      })
      .catch(next)
  })

  .post(jsonParser, (req, res, next) => {
    const { name } = req.body
    const newFolder = { name }

    // check for required fields
    for (const [key, value] of Object.entries(newFolder))
    {
      if (value == null)
      {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        })
      }
    }


    FoldersService.insertFolder(
      req.app.get('db'),
      newFolder
    )
      .then(folder => {
        // console.log(`folder :>> `, folder) ||
        res
          .status(201)
          // .location(`/ folders / ${ folder.id }`)
          .location(path.posix.join(req.originalUrl, `/ ${folder.id}`))
          .json(folder)
      })
      .catch(next)
  })

// for path / id :  get, delete and patch
foldersRouter
  .route('/:folder_id')
  .all((req, res, next) => {
    console.log(`2 folder :>> `, folder) ||
      FoldersService.getById(
        req.app.get('db'),
        req.params.folder_id
      )
        .then(folder => {
          if (!folder)
          {
            return res.status(404).json({
              error: { message: `Folder doesn't exist` }
            })
          }
          res.folder = folder // save the folder for the next middleware
          next() // don't forget to call next so the next middleware happens!
        })
        .catch(next)
  })
  .get((req, res, next) => {
    res.json({
      id: res.folder.id,
      title: xss(res.folder.title), // sanitize title
      url: xss(res.folder.url), // sanitize url
      description: xss(res.folder.description), // sanitize description
      rating: res.folder.rating,
    })
  })

  .delete((req, res, next) => {
    FoldersService.deleteFolder(
      req.app.get('db'),
      req.params.folder_id
    )
      .then(() => {
        res.status(204).end()
      })
      .catch(next)
  })
  .patch(jsonParser, (req, res, next) => {
    const { title, url } = req.body
    const folderToUpdate = { title, url }

    const numberOfValues = Object.values(folderToUpdate).filter(Boolean).length
    if (numberOfValues === 0)
    {
      return res.status(400).json({
        error: {
          message: `Request body must contain either 'title' or 'url'`
        }
      })
    }
    const error = getFolderValidationError(folderToUpdate)
    if (error) return res.status(400).send(error)

    FoldersService.updateFolder(
      req.app.get('db'),
      req.params.folder_id,
      folderToUpdate
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })


module.exports = foldersRouter

