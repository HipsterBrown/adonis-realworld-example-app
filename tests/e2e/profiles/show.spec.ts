import Database from '@ioc:Adonis/Lucid/Database'
import { test } from '@japa/runner'
import { ArticleFactory, FavoriteFactory } from 'Database/factories/ArticleFactory'
import { ProfileFactory } from 'Database/factories/ProfileFactory'

test.group('profiles/show', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()

    return () => Database.rollbackGlobalTransaction()
  })

  test('displays profile info with authored and favorited articles', async ({
    assert,
    page,
    route,
    getScreen,
  }) => {
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

    await page.goto(route('profiles.show', profile))
    let screen = await getScreen()

    assert.exists(await screen.findByRole('heading', { level: 1, name: 'TestPerson' }))
    assert.exists(await screen.findByText('I am a test person'))
    assert.exists(await screen.findByRole('link', { name: 'My Articles' }))
    assert.exists(await screen.findByRole('link', { name: 'Favorited Articles' }))

    assert.lengthOf(await screen.findAllByRole('article'), 5)
    await page.click('text="Favorited Articles"')

    screen = await getScreen()

    assert.lengthOf(await screen.findAllByRole('article'), 3)
  })

  test('logged in user does not see follow button on their profile', async ({
    assert,
    page,
    route,
    login,
    getScreen,
  }) => {
    const profile = await ProfileFactory.merge({
      name: 'TestPerson',
      bio: 'I am a test person',
    })
      .with('user', 1, (user) =>
        user.merge({ email: 'test.person@example.com', password: 'SuperSecret123' })
      )
      .create()

    await login('test.person@example.com', 'SuperSecret123')

    await page.goto(route('profiles.show', profile))
    let screen = await getScreen()

    assert.notExists(await screen.queryByRole('button', { name: /Follow/ }))
  })

  test('logged in user can follow another user from their profile', async ({
    assert,
    page,
    route,
    login,
    getScreen,
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

    await login('test.person@example.com', 'SuperSecret123')

    await page.goto(route('profiles.show', following))
    let screen = await getScreen()

    const followButton = await screen.findByRole('button', { name: /Follow/ })

    await followButton.click()

    screen = await getScreen()

    assert.exists(await screen.findByRole('button', { name: /Unfollow/ }))
  })
})
