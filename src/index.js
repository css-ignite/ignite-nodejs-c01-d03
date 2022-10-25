const express = require('express')

const { v4: uuid } = require('uuid')

const app = express()

app.use(express.json())

const repositories = []

function middlewareFindRepositoryByIndex (request, response, next) {
  const { id } = request.params

  const repositoryIndex = repositories.findIndex(
    (repository) => repository.id === id
  )

  if (repositoryIndex < 0) {
    return response.status(404).json({
      error: 'Repository not found.'
    })
  }

  request.repositoryIndex = repositoryIndex

  return next()
}

/*
  (GET) /repositories
*/

app.get('/repositories', (request, response) => {
  return response.json(repositories)
})

/*
  (POST) /repositories
*/

app.post('/repositories', (request, response) => {
  const { title, url, techs } = request.body

  const repository = {
    id: uuid(),
    title,
    url,
    techs,
    likes: 0
  }

  repositories.push(repository)

  return response.json(repository)
})

/*
  (PUT) /repositories/:id
*/

app.put(
  '/repositories/:id',
  middlewareFindRepositoryByIndex,
  (request, response) => {
    const { id } = request.params
    const { title, url, techs } = request.body
    const { repositoryIndex } = request

    const repository = {
      id,
      title,
      url,
      techs,
      likes: repositories[repositoryIndex].likes
    }

    repositories[repositoryIndex] = repository

    return response.json(repository)
  }
)

/*
  (DELETE) /repositories/:id
*/

app.delete(
  '/repositories/:id',
  middlewareFindRepositoryByIndex,
  (request, response) => {
    const { repositoryIndex } = request

    repositories.splice(repositoryIndex, 1)

    return response.status(204).send()
  }
)

/*
  (PATCH) /repositories/:id/like
*/

app.post(
  '/repositories/:id/like',
  middlewareFindRepositoryByIndex,
  (request, response) => {
    const { repositoryIndex } = request

    const likes = ++repositories[repositoryIndex].likes

    return response.json({ likes })
  }
)

module.exports = app
