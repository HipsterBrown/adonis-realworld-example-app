import Database from '@ioc:Adonis/Lucid/Database'
import { test } from '@japa/runner'
import TagFactory from 'Database/factories/TagFactory'
import { ProfileFactory } from 'Database/factories/ProfileFactory'

test.group('articles/index', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()

    return async () => {
      await Database.rollbackGlobalTransaction()
    }
  })

  test('display home page with articles', async ({ visit }) => {
    // create with TagFactory to ensure unique tag values
    await TagFactory.with('articles', 5, (article) =>
      article
        .with('profile', 1, (profile) => profile.with('user'))
        .with('comments', 3, (comment) =>
          comment.with('author', 1, (profile) => profile.with('user'))
        )
    ).createMany(5)

    const screen = await visit(`/`)

    await screen.assertExists(screen.getByRole('link', { name: 'Home' }))
    await screen.assertExists(screen.getByRole('link', { name: 'Sign in' }))
    await screen.assertExists(screen.getByRole('link', { name: 'Sign up' }))
    await screen.assertExists(screen.getByRole('heading', { name: 'conduit' }))
    await screen.assertExists(screen.getByRole('link', { name: 'Global Feed' }))
    await screen.assertExists(screen.getByText('Popular Tags'))
    await screen.assertElementsCount(screen.getByRole('link', { name: /view articles tagged as/ }), 5)
    // pagination
    await screen.assertElementsCount(screen.getByRole('link', { name: /^\d$/ }), 3)
    await screen.assertElementsCount(screen.getByRole('article'), 10)
  })

  test('display home page with empty state', async ({ visit }) => {
    const screen = await visit('/')

    await screen.assertExists(screen.getByText('No articles here...yet.'))
    await screen.assertElementsCount(screen.getByRole('article'), 0)
    await screen.assertElementsCount(screen.getByRole('link', { name: /^\d$/ }), 0)
    await screen.assertElementsCount(screen.getByRole('link', { name: /view articles tagged as/ }), 0)
  })

  test('tag links filter list of posts', async ({ visit }) => {
    await TagFactory.with('articles', 5, (article) =>
      article
        .with('profile', 1, (profile) => profile.with('user'))
        .with('comments', 3, (comment) =>
          comment.with('author', 1, (profile) => profile.with('user'))
        )
    ).createMany(5)

    const screen = await visit('/')

    const [firstTag] = await screen.getByRole('link', { name: /view articles tagged as/ }).all()
    const tagContent = await firstTag.textContent()
    await firstTag.click()

    await screen.assertExists(screen.getByText(`#${tagContent?.trim()}`))
    await screen.assertElementsCount(screen.getByRole('article'), 5)
  })

  test('pagination links show next page of posts', async ({ assert, visit }) => {
    await TagFactory.with('articles', 5, (article) =>
      article
        .with('profile', 1, (profile) => profile.with('user'))
        .with('comments', 3, (comment) =>
          comment.with('author', 1, (profile) => profile.with('user'))
        )
    ).createMany(5)

    const screen = await visit('/')

    const nextPageLink = screen.getByRole('link', { name: '2', exact: true })
    const [firstArticle] = await screen.getByRole('article').all()
    const firstArticleHeading = firstArticle.getByRole('heading', { level: 1 })
    const firstArticleTitle = await firstArticleHeading.textContent()

    await nextPageLink.click()

    const currentPaginationLink = screen.getByRole('link', { name: '2', exact: true })
    assert.equal(await currentPaginationLink.getAttribute('class'), 'active')

    const [firstArticleNextPage] = await screen.getByRole('article').all()
    const heading = firstArticleNextPage.getByRole('heading', { level: 1 })
    assert.notEqual(firstArticleTitle, await heading.textContent())
  })

  test('personal feed displays when logged in', async ({ browserContext, visit }) => {
    await ProfileFactory.with('user', 1, (relation) =>
      relation.merge({ email: 'test.person@example.com', password: 'SuperSecret123' })
    ).create()
    await TagFactory.with('articles', 5, (article) =>
      article
        .with('profile', 1, (profile) => profile.with('user'))
        .with('comments', 3, (comment) =>
          comment.with('author', 1, (profile) => profile.with('user'))
        )
    ).createMany(5)

    await browserContext.login('test.person@example.com', 'SuperSecret123')

    const screen = await visit('/')

    await screen.assertNotExists(screen.getByText('No articles here...yet.'))

    await screen.getByRole('link', { name: 'Your Feed' }).click()

    await screen.assertExists(screen.getByText('No articles here...yet.'))
  })

  test('logged in user can favorite articles', async ({ browserContext, visit }) => {
    await ProfileFactory.with('user', 1, (relation) =>
      relation.merge({ email: 'test.person@example.com', password: 'SuperSecret123' })
    ).create()
    await TagFactory.with('articles', 5, (article) =>
      article
        .with('profile', 1, (profile) => profile.with('user'))
        .with('comments', 3, (comment) =>
          comment.with('author', 1, (profile) => profile.with('user'))
        )
    ).createMany(5)

    await browserContext.login('test.person@example.com', 'SuperSecret123')

    const screen = await visit('/')

    const [article] = await screen.getByRole('article').all()
    const favButton = article.getByRole('button', { name: 'Favorite post' })
    await favButton.click()

    await screen.assertExists(screen.getByRole('button', { name: 'Unfavorite post' }))
  })
})
