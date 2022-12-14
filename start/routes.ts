/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer''
|
*/

import Route from '@ioc:Adonis/Core/Route'

Route.get('/', 'ArticlesController.index').as('articles.index')

Route.get('/register', 'UsersController.new').as('register')
Route.post('/users', 'UsersController.create').as('users.create')

Route.get('/login', 'SessionsController.new').as('login')
Route.post('/sessions', 'SessionsController.create').as('sessions.create')

Route.get('/articles/:slug', 'ArticlesController.show').as('articles.show')

Route.get('/profiles/:name', 'ProfilesController.show').as('profiles.show')
Route.get('/profiles/:name/favorites', 'ProfilesController.show').as('profiles.show.favorites')

Route.group(() => {
  Route.get('/settings', 'ProfilesController.edit').as('settings')
  Route.patch('/profile', 'ProfilesController.update').as('profile.update')

  Route.delete('/sessions', 'SessionsController.destroy').as('sessions.destroy')

  Route.get('/editor', 'ArticlesController.new').as('editor')
  Route.get('/editor/:slug', 'ArticlesController.edit').as('articles.edit')

  Route.post('/articles', 'ArticlesController.create').as('articles.create')
  Route.patch('/articles/:slug', 'ArticlesController.update').as('articles.update')
  Route.delete('/articles/:slug', 'ArticlesController.destroy').as('articles.destroy')

  Route.post('/articles/:slug/comments', 'CommentsController.create').as('comments.create')
  Route.get('/articles/:slug/comments/:id', 'CommentsController.edit').as('comments.edit')
  Route.patch('/articles/:slug/comments/:id', 'CommentsController.update').as('comments.update')
  Route.delete('/articles/:slug/comments/:id', 'CommentsController.destroy').as('comments.destroy')

  Route.post('/articles/:slug/favorites', 'FavoritesController.create').as('favorites.create')
  Route.delete('/articles/:slug/favorites', 'FavoritesController.destroy').as('favorites.destroy')

  Route.post('/profiles/:name/follow', 'FollowsController.create').as('profile.follow')
  Route.delete('/profiles/:name/follow', 'FollowsController.destroy').as('profile.unfollow')
}).middleware('auth')
