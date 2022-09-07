import { getDocument, getQueriesForElement, queries } from 'playwright-testing-library'
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

  test('display home page with articles', async ({ assert, page }) => {
    // create with TagFactory to ensure unique tag values
    await TagFactory.with('articles', 5, (article) =>
      article
        .with('profile', 1, (profile) => profile.with('user'))
        .with('comments', 3, (comment) =>
          comment.with('author', 1, (profile) => profile.with('user'))
        )
    ).createMany(5)

    await page.goto(`/`)
    const $document = await getDocument(page)
    const { findByText, findByRole, findAllByRole } = getQueriesForElement($document)

    assert.exists(await findByRole('link', { name: 'Home' }))
    assert.exists(await findByRole('link', { name: 'Sign in' }))
    assert.exists(await findByRole('link', { name: 'Sign up' }))
    assert.exists(await findByRole('heading', { name: 'conduit' }))
    assert.exists(await findByRole('link', { name: 'Global Feed' }))
    assert.exists(await findByText('Popular Tags'))
    assert.lengthOf(await findAllByRole('link', { name: /view articles tagged as/ }), 5)
    // pagination
    assert.lengthOf(await findAllByRole('link', { name: /^\d$/ }), 3)
    assert.lengthOf(await findAllByRole('article'), 10)
  })

  test('display home page with empty state', async ({ assert, page }) => {
    await page.goto('/')
    const $document = await getDocument(page)
    const { findByText, queryAllByRole } = getQueriesForElement($document)

    assert.exists(await findByText('No articles here...yet.'))
    assert.lengthOf(await queryAllByRole('article'), 0)
    assert.lengthOf(await queryAllByRole('link', { name: /^\d$/ }), 0)
    assert.lengthOf(await queryAllByRole('link', { name: /view articles tagged as/ }), 0)
  })

  test('tag links filter list of posts', async ({ assert, page }) => {
    await TagFactory.with('articles', 5, (article) =>
      article
        .with('profile', 1, (profile) => profile.with('user'))
        .with('comments', 3, (comment) =>
          comment.with('author', 1, (profile) => profile.with('user'))
        )
    ).createMany(5)

    await page.goto('/')
    const $document = await getDocument(page)
    const { findAllByRole } = getQueriesForElement($document)

    const [firstTag] = await findAllByRole('link', { name: /view articles tagged as/ })
    const tagContent = await firstTag.textContent()
    await firstTag.click()

    const taggedDocument = await getDocument(page)
    assert.exists(await queries.findByText(taggedDocument, `#${tagContent?.trim()}`))
    assert.lengthOf(await queries.findAllByRole(taggedDocument, 'article'), 5)
  })

  test('pagination links show next page of posts', async ({ assert, page }) => {
    await TagFactory.with('articles', 5, (article) =>
      article
        .with('profile', 1, (profile) => profile.with('user'))
        .with('comments', 3, (comment) =>
          comment.with('author', 1, (profile) => profile.with('user'))
        )
    ).createMany(5)

    await page.goto('/')
    const $document = await getDocument(page)
    const { findByRole, findAllByRole } = getQueriesForElement($document)
    const nextPageLink = await findByRole('link', { name: '2' })
    const [firstArticle] = await findAllByRole('article')
    const firstArticleHeading = await queries.findByRole(firstArticle, 'heading', { level: 1 })
    const firstArticleTitle = await firstArticleHeading.textContent()

    await nextPageLink.click()

    const nextPageDoc = await getDocument(page)
    const currentPaginationLink = await queries.findByRole(nextPageDoc, 'link', { name: '2' })
    assert.equal(await currentPaginationLink.getAttribute('class'), 'active')

    const [firstArticleNextPage] = await queries.findAllByRole(nextPageDoc, 'article')
    const heading = await queries.findByRole(firstArticleNextPage, 'heading', { level: 1 })
    assert.notEqual(firstArticleTitle, await heading.textContent())
  })

  test('personal feed displays when logged in', async ({ assert, page, login }) => {
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
    const $document = await getDocument(page)
    const { queryByText, findByRole } = getQueriesForElement($document)

    assert.notExists(await queryByText('No articles here...yet.'))

    await (await findByRole('link', { name: 'Your Feed' })).click()

    const personalFeed = await getDocument(page)
    assert.exists(await queries.findByText(personalFeed, 'No articles here...yet.'))
  })

  test('logged in user can favorite articles', async ({ assert, page, login }) => {
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
    const $document = await getDocument(page)
    const { findAllByRole } = getQueriesForElement($document)

    const [article] = await findAllByRole('article')
    const favButton = await queries.findByRole(article, 'button', { name: 'Favorite post' })
    await favButton.click()

    assert.exists(
      await queries.findByRole(await getDocument(page), 'button', { name: 'Unfavorite post' })
    )
  })
})
