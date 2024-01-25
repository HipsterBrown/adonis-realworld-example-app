import Database from '@ioc:Adonis/Lucid/Database'
import { test } from '@japa/runner'
import { ArticleFactory } from '#database/factories/ArticleFactory'
import { ProfileFactory } from '#database/factories/ProfileFactory'
import { CommentFactory } from '#database/factories/CommentFactory'
import Article from '#app/Models/Article'

test.group('articles/show', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()

    return async () => {
      await Database.rollbackGlobalTransaction()
    }
  })

  test('displays article content', async ({ route, visit }) => {
    const profile = await ProfileFactory.with('user').create()
    const article = await ArticleFactory.merge({ userId: profile.userId }).create()

    const screen = await visit(route('articles.show', article))

    await screen.assertExists(screen.getByRole('heading', { level: 1, name: article.title }))
    await screen.assertElementsCount(screen.getByRole('link', { name: profile.name }), 2)
    await screen.assertElementsCount(screen.getByRole('button', { name: /Follow / }), 2)
    await screen.assertElementsCount(screen.getByRole('button', { name: /Favorite post/ }), 2)
    await screen.assertExists(screen.getByText(/to add comments on this article/))
  })

  test('article authors can delete', async ({ assert, browserContext, route, visit }) => {
    const profile = await ProfileFactory.with('user', 1, (user) =>
      user.merge({ email: 'test.person@example.com', password: 'SuperSecret123' })
    ).create()
    const article = await ArticleFactory.merge({ userId: profile.userId }).create()

    let screen = await visit(route('articles.show', article))

    await screen.assertNotExists(screen.getByRole('button', { name: /Delete Article/ }))

    await browserContext.login('test.person@example.com', 'SuperSecret123')

    screen = await visit(route('articles.show', article))

    const [deleteButton] = await screen.getByRole('button', { name: /Delete Article/ }).all()
    await deleteButton.click()

    assert.notExists(await Article.find(article.id))
  })

  test('displays article comments', async ({ browserContext, route, visit }) => {
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

    let screen = await visit(route('articles.show', article))

    await screen.assertExists(screen.getByRole('link', { name: commenter.name }))
    await screen.assertElementsCount(screen.getByRole('article'), 1)
    await screen.assertExists(screen.getByText(comment.body))
    await screen.assertNotExists(screen.getByRole('link', { name: 'Edit your comment' }))
    await screen.assertNotExists(screen.getByRole('button', { name: 'Delete your comment' }))

    await browserContext.login('test.person@example.com', 'SuperSecret123')

    screen = await visit(route('articles.show', article))

    await screen.assertExists(
      screen.getByRole('link', {
        name: 'Edit your comment',
      })
    )
    await screen.assertExists(
      screen.getByRole('button', {
        name: 'Delete your comment',
      })
    )

    const commentBodyInput = screen.getByLabel('Comment body')
    await commentBodyInput.fill('This is a new comment!')
    await screen.getByRole('button', { name: 'Post Comment' }).click()

    await screen.assertExists(screen.getByText('This is a new comment!'))

    const [deleteButton] = await screen
      .getByRole('button', {
        name: 'Delete your comment',
      })
      .all()
    await deleteButton.click()

    await screen.assertNotExists(screen.getByText('This is a new comment!'))
  })

  test('logged in users can favorite articles', async ({ browserContext, route, visit }) => {
    await ProfileFactory.with('user', 1, (user) =>
      user.merge({ email: 'test.person@example.com', password: 'SuperSecret123' })
    ).create()
    const article = await ArticleFactory.with('profile', 1, (profile) =>
      profile.with('user')
    ).create()

    let screen = await visit(route('articles.show', article))

    const [favoriteButton] = await screen.getByRole('button', { name: 'Favorite post' }).all()
    await favoriteButton.click()

    await screen.assertExists(screen.getByRole('heading', { level: 1, name: 'Sign in' }))

    await browserContext.login('test.person@example.com', 'SuperSecret123')

    screen = await visit(route('articles.show', article))

    const [favButton] = await screen
      .getByRole('button', {
        name: 'Favorite post',
      })
      .all()
    await favButton.click()

    await screen.assertElementsCount(screen.getByRole('button', { name: 'Unfavorite post' }), 2)
  })

  test('logged in users can follow article authors', async ({ browserContext, route, visit }) => {
    await ProfileFactory.with('user', 1, (user) =>
      user.merge({ email: 'test.person@example.com', password: 'SuperSecret123' })
    ).create()
    const article = await ArticleFactory.with('profile', 1, (profile) =>
      profile.with('user')
    ).create()

    let screen = await visit(route('articles.show', article))

    const [followButton] = await screen.getByRole('button', { name: /Follow/ }).all()
    await followButton.click()

    await screen.assertExists(screen.getByRole('heading', { level: 1, name: 'Sign in' }))

    await browserContext.login('test.person@example.com', 'SuperSecret123')

    screen = await visit(route('articles.show', article))

    const [folButton] = await screen
      .getByRole('button', {
        name: /Follow/,
      })
      .all()
    await folButton.click()

    await screen.assertElementsCount(screen.getByRole('button', { name: /Unfollow/ }), 2)
  })
})
