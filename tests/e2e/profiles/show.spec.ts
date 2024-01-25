import Database from '@ioc:Adonis/Lucid/Database'
import { test } from '@japa/runner'
import { ArticleFactory, FavoriteFactory } from '#database/factories/ArticleFactory'
import { ProfileFactory } from '#database/factories/ProfileFactory'

test.group('profiles/show', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()

    return () => Database.rollbackGlobalTransaction()
  })

  test('displays profile info with authored and favorited articles', async ({ route, visit }) => {
    const profile = await ProfileFactory.merge({
      name: 'TestPerson',
      bio: 'I am a test person',
    })
      .with('user')
      .create()

    await ArticleFactory.merge({ userId: profile.userId }).createMany(5)
    await FavoriteFactory.with('article', 1, (article) =>
      article.with('profile', 1, (profile) => profile.with('user'))
    )
      .merge({ profileId: profile.id })
      .createMany(3)

    const screen = await visit(route('profiles.show', profile))

    await screen.assertExists(screen.getByRole('heading', { name: 'TestPerson' }))
    await screen.assertExists(screen.getByText('I am a test person'))
    await screen.assertExists(screen.getByRole('link', { name: 'My Articles' }))
    await screen.assertExists(screen.getByRole('link', { name: 'Favorited Articles' }))

    await screen.assertElementsCount(screen.getByRole('article'), 5)
    await screen.click('text="Favorited Articles"')

    await screen.assertElementsCount(screen.getByRole('article'), 3)
  })

  test('logged in user does not see follow button on their profile', async ({
    route,
    visit,
    browserContext,
  }) => {
    const profile = await ProfileFactory.merge({
      name: 'TestPerson',
      bio: 'I am a test person',
    })
      .with('user', 1, (user) =>
        user.merge({ email: 'test.person@example.com', password: 'SuperSecret123' })
      )
      .create()

    await browserContext.login('test.person@example.com', 'SuperSecret123')

    const screen = await visit(route('profiles.show', profile))

    await screen.assertNotExists(screen.getByRole('button', { name: /Follow/ }))
  })

  test('logged in user can follow another user from their profile', async ({
    route,
    visit,
    browserContext,
  }) => {
    const following = await ProfileFactory.merge({
      name: 'TestPerson',
      bio: 'I am a test person',
    })
      .with('user')
      .create()
    await ProfileFactory.merge({
      name: 'TestPerson',
      bio: 'I am a test person',
    })
      .with('user', 1, (user) =>
        user.merge({ email: 'test.person@example.com', password: 'SuperSecret123' })
      )
      .create()

    await browserContext.login('test.person@example.com', 'SuperSecret123')

    const screen = await visit(route('profiles.show', following))

    const followButton = screen.getByRole('button', { name: /Follow/ })

    await followButton.click()

    await screen.assertExists(screen.getByRole('button', { name: /Unfollow/ }))
  })
})
