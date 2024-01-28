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

import router from '@adonisjs/core/services/router'

router.get('/', 'ArticlesController.index').as('articles.index')

router.get('/register', 'UsersController.new').as('register')
router.post('/users', 'UsersController.create').as('users.create')

router.get('/login', 'SessionsController.new').as('login')
router.post('/sessions', 'SessionsController.create').as('sessions.create')

router.get('/articles/:slug', 'ArticlesController.show').as('articles.show')

router.get('/profiles/:name', 'ProfilesController.show').as('profiles.show')
router.get('/profiles/:name/favorites', 'ProfilesController.show').as('profiles.show.favorites')

router
  .group(() => {
    router.get('/settings', 'ProfilesController.edit').as('settings')
    router.patch('/profile', 'ProfilesController.update').as('profile.update')

    router.delete('/sessions', 'SessionsController.destroy').as('sessions.destroy')

    router.get('/editor', 'ArticlesController.new').as('editor')
    router.get('/editor/:slug', 'ArticlesController.edit').as('articles.edit')

    router.post('/articles', 'ArticlesController.create').as('articles.create')
    router.patch('/articles/:slug', 'ArticlesController.update').as('articles.update')
    router.delete('/articles/:slug', 'ArticlesController.destroy').as('articles.destroy')

    router.post('/articles/:slug/comments', 'CommentsController.create').as('comments.create')
    router.get('/articles/:slug/comments/:id', 'CommentsController.edit').as('comments.edit')
    router.patch('/articles/:slug/comments/:id', 'CommentsController.update').as('comments.update')
    router
      .delete('/articles/:slug/comments/:id', 'CommentsController.destroy')
      .as('comments.destroy')

    router.post('/articles/:slug/favorites', 'FavoritesController.create').as('favorites.create')
    router
      .delete('/articles/:slug/favorites', 'FavoritesController.destroy')
      .as('favorites.destroy')

    router.post('/profiles/:name/follow', 'FollowsController.create').as('profile.follow')
    router.delete('/profiles/:name/follow', 'FollowsController.destroy').as('profile.unfollow')
  })
  .middleware('auth')
