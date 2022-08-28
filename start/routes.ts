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

Route.get('/', 'ArticlesController.index')

Route.get('/register', 'UsersController.new').as('register')
Route.post('/users', 'UsersController.create').as('users.create')

Route.get('/login', 'SessionsController.new').as('login')
Route.post('/sessions', 'SessionsController.create').as('sessions.create')

Route.get('/articles/:slug', 'ArticlesController.show').as('articles.show')

Route.group(() => {
  Route.get('/settings', 'ProfilesController.edit').as('settings')
  Route.patch('/profile', 'ProfilesController.update').as('profile.update')

  Route.delete('/sessions', 'SessionsController.destroy').as('sessions.destroy')

  Route.get('/editor', 'ArticlesController.new').as('editor')
  Route.get('/editor/:slug', 'ArticlesController.edit').as('articles.edit')

  Route.post('/articles', 'ArticlesController.create').as('articles.create')
  Route.patch('/articles/:slug', 'ArticlesController.update').as('articles.update')
  Route.delete('/articles/:slug', 'ArticlesController.destroy').as('articles.destroy')
}).middleware('auth')
