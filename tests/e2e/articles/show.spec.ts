import Database from '@ioc:Adonis/Lucid/Database'
import { test } from '@japa/runner'
import { ArticleFactory } from 'Database/factories/ArticleFactory'
import { ProfileFactory } from 'Database/factories/ProfileFactory'
import { CommentFactory } from 'Database/factories/CommentFactory'
import Article from 'App/Models/Article'

test.group('articles/show', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()

    return async () => {
      await Database.rollbackGlobalTransaction()
    }
  })

  test('displays article content', async ({ assert, page, route, getScreen }) => {
    const profile = await ProfileFactory.with('user').create()
    const article = await ArticleFactory.merge({ userId: profile.userId }).create()

    await page.goto(route('articles.show', article))
    let screen = await getScreen()

    assert.exists(await screen.findByRole('heading', { level: 1, name: article.title }))
    assert.lengthOf(await screen.findAllByRole('link', { name: profile.name }), 2)
    assert.lengthOf(await screen.findAllByRole('button', { name: /Follow / }), 2)
    assert.lengthOf(await screen.findAllByRole('button', { name: /Favorite post/ }), 2)
    assert.exists(await screen.findByText(/to add comments on this article/))
  })

  test('article authors can delete', async ({ assert, page, route, login, getScreen }) => {
    const profile = await ProfileFactory.with('user', 1, (user) =>
      user.merge({ email: 'test.person@example.com', password: 'SuperSecret123' })
    ).create()
    const article = await ArticleFactory.merge({ userId: profile.userId }).create()

    await page.goto(route('articles.show', article))
    let screen = await getScreen()

    assert.notExists(await screen.queryByRole('button', { name: /Delete Article/ }))

    await login('test.person@example.com', 'SuperSecret123')

    await page.goto(route('articles.show', article))
    screen = await getScreen()

    const [deleteButton] = await screen.findAllByRole('button', { name: /Delete Article/ })
    await deleteButton.click()

    assert.notExists(await Article.find(article.id))
  })

  test('displays article comments', async ({ assert, page, route, login, getScreen }) => {
    const commenter = await ProfileFactory.with('user', 1, (user) =>
      user.merge({ email: 'test.person@example.com', password: 'SuperSecret123' })
    ).create()
    const article = await ArticleFactory.with('profile', 1, (profile) =>
      profile.with('user')
    ).create()
    const comment = await CommentFactory.merge({
      articleId: article.id,
      authorId: commenter.id,
    }).create()

    await page.goto(route('articles.show', article))
    let screen = await getScreen()

    assert.exists(await screen.findByRole('link', { name: commenter.name }))
    assert.lengthOf(await screen.findAllByRole('article'), 1)
    assert.exists(await screen.findByText(comment.body))
    assert.notExists(await screen.queryByRole('link', { name: 'Edit your comment' }))
    assert.notExists(await screen.queryByRole('button', { name: 'Delete your comment' }))

    await login('test.person@example.com', 'SuperSecret123')

    await page.goto(route('articles.show', article))
    screen = await getScreen()

    assert.exists(
      await screen.findByRole('link', {
        name: 'Edit your comment',
      })
    )
    assert.exists(
      await screen.findByRole('button', {
        name: 'Delete your comment',
      })
    )

    const commentBodyInput = await screen.findByLabelText('Comment body')
    await commentBodyInput.fill('This is a new comment!')
    await screen.findByRole('button', { name: 'Post Comment' }).then((el) => el.click())

    screen = await getScreen()
    assert.exists(await screen.findByText('This is a new comment!'))

    const [deleteButton] = await screen.findAllByRole('button', {
      name: 'Delete your comment',
    })
    await deleteButton.click()

    screen = await getScreen()
    assert.notExists(await screen.queryByText('This is a new comment!'))
  }).debug()

  test('logged in users can favorite articles', async ({
    assert,
    page,
    login,
    route,
    getScreen,
  }) => {
    await ProfileFactory.with('user', 1, (user) =>
      user.merge({ email: 'test.person@example.com', password: 'SuperSecret123' })
    ).create()
    const article = await ArticleFactory.with('profile', 1, (profile) =>
      profile.with('user')
    ).create()

    await page.goto(route('articles.show', article))
    let screen = await getScreen()

    const [favoriteButton] = await screen.findAllByRole('button', { name: 'Favorite post' })
    await favoriteButton.click()

    screen = await getScreen()
    assert.exists(await screen.findByRole('heading', { level: 1, name: 'Sign in' }))

    await login('test.person@example.com', 'SuperSecret123')

    await page.goto(route('articles.show', article))
    screen = await getScreen()

    const [favButton] = await screen.findAllByRole('button', {
      name: 'Favorite post',
    })
    await favButton.click()

    screen = await getScreen()
    assert.lengthOf(await screen.findAllByRole('button', { name: 'Unfavorite post' }), 2)
  })

  test('logged in users can follow article authors', async ({
    assert,
    page,
    login,
    route,
    getScreen,
  }) => {
    await ProfileFactory.with('user', 1, (user) =>
      user.merge({ email: 'test.person@example.com', password: 'SuperSecret123' })
    ).create()
    const article = await ArticleFactory.with('profile', 1, (profile) =>
      profile.with('user')
    ).create()

    await page.goto(route('articles.show', article))
    let screen = await getScreen()

    const [followButton] = await screen.findAllByRole('button', { name: /Follow/ })
    await followButton.click()

    screen = await getScreen()
    assert.exists(await screen.findByRole('heading', { level: 1, name: 'Sign in' }))

    await login('test.person@example.com', 'SuperSecret123')

    await page.goto(route('articles.show', article))
    screen = await getScreen()

    const [folButton] = await screen.findAllByRole('button', {
      name: /Follow/,
    })
    await folButton.click()

    screen = await getScreen()
    assert.lengthOf(await screen.findAllByRole('button', { name: /Unfollow/ }), 2)
  })
})
