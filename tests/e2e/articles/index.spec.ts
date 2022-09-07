import { queries } from 'playwright-testing-library'
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

  test('display home page with articles', async ({ assert, page, getScreen }) => {
    // create with TagFactory to ensure unique tag values
    await TagFactory.with('articles', 5, (article) =>
      article
        .with('profile', 1, (profile) => profile.with('user'))
        .with('comments', 3, (comment) =>
          comment.with('author', 1, (profile) => profile.with('user'))
        )
    ).createMany(5)

    await page.goto(`/`)
    let screen = await getScreen()

    assert.exists(await screen.findByRole('link', { name: 'Home' }))
    assert.exists(await screen.findByRole('link', { name: 'Sign in' }))
    assert.exists(await screen.findByRole('link', { name: 'Sign up' }))
    assert.exists(await screen.findByRole('heading', { name: 'conduit' }))
    assert.exists(await screen.findByRole('link', { name: 'Global Feed' }))
    assert.exists(await screen.findByText('Popular Tags'))
    assert.lengthOf(await screen.findAllByRole('link', { name: /view articles tagged as/ }), 5)
    // pagination
    assert.lengthOf(await screen.findAllByRole('link', { name: /^\d$/ }), 3)
    assert.lengthOf(await screen.findAllByRole('article'), 10)
  })

  test('display home page with empty state', async ({ assert, page, getScreen }) => {
    await page.goto('/')
    let screen = await getScreen()

    assert.exists(await screen.findByText('No articles here...yet.'))
    assert.lengthOf(await screen.queryAllByRole('article'), 0)
    assert.lengthOf(await screen.queryAllByRole('link', { name: /^\d$/ }), 0)
    assert.lengthOf(await screen.queryAllByRole('link', { name: /view articles tagged as/ }), 0)
  })

  test('tag links filter list of posts', async ({ assert, page, getScreen }) => {
    await TagFactory.with('articles', 5, (article) =>
      article
        .with('profile', 1, (profile) => profile.with('user'))
        .with('comments', 3, (comment) =>
          comment.with('author', 1, (profile) => profile.with('user'))
        )
    ).createMany(5)

    await page.goto('/')
    let screen = await getScreen()

    const [firstTag] = await screen.findAllByRole('link', { name: /view articles tagged as/ })
    const tagContent = await firstTag.textContent()
    await firstTag.click()

    screen = await getScreen()
    assert.exists(await screen.findByText(`#${tagContent?.trim()}`))
    assert.lengthOf(await screen.findAllByRole('article'), 5)
  })

  test('pagination links show next page of posts', async ({ assert, page, getScreen }) => {
    await TagFactory.with('articles', 5, (article) =>
      article
        .with('profile', 1, (profile) => profile.with('user'))
        .with('comments', 3, (comment) =>
          comment.with('author', 1, (profile) => profile.with('user'))
        )
    ).createMany(5)

    await page.goto('/')
    let screen = await getScreen()

    const nextPageLink = await screen.findByRole('link', { name: '2' })
    const [firstArticle] = await screen.findAllByRole('article')
    const firstArticleHeading = await queries.findByRole(firstArticle, 'heading', { level: 1 })
    const firstArticleTitle = await firstArticleHeading.textContent()

    await nextPageLink.click()

    screen = await getScreen()
    const currentPaginationLink = await screen.findByRole('link', { name: '2' })
    assert.equal(await currentPaginationLink.getAttribute('class'), 'active')

    const [firstArticleNextPage] = await screen.findAllByRole('article')
    const heading = await queries.findByRole(firstArticleNextPage, 'heading', { level: 1 })
    assert.notEqual(firstArticleTitle, await heading.textContent())
  })

  test('personal feed displays when logged in', async ({ assert, page, login, getScreen }) => {
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

    await login('test.person@example.com', 'SuperSecret123')

    await page.goto('/')
    let screen = await getScreen()

    assert.notExists(await screen.queryByText('No articles here...yet.'))

    await (await screen.findByRole('link', { name: 'Your Feed' })).click()

    screen = await getScreen()
    assert.exists(await screen.findByText('No articles here...yet.'))
  })

  test('logged in user can favorite articles', async ({ assert, page, login, getScreen }) => {
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

    await login('test.person@example.com', 'SuperSecret123')

    await page.goto('/')
    let screen = await getScreen()

    const [article] = await screen.findAllByRole('article')
    const favButton = await queries.findByRole(article, 'button', { name: 'Favorite post' })
    await favButton.click()

    screen = await getScreen()
    assert.exists(await screen.findByRole('button', { name: 'Unfavorite post' }))
  })
})
