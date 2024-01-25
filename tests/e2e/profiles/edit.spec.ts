import Database from '@ioc:Adonis/Lucid/Database'
import { test } from '@japa/runner'
import { ProfileFactory } from '#database/factories/ProfileFactory'

test.group('profiles/edit', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()

    return () => Database.rollbackGlobalTransaction()
  })

  test('logged in user can edit their profile', async ({ assert, visit, browserContext }) => {
    const profile = await ProfileFactory.merge({
      name: 'TestPerson',
      bio: 'I am a test person',
    })
      .with('user', 1, (user) =>
        user.merge({ email: 'test.person@example.com', password: 'SuperSecret123' })
      )
      .create()

    await browserContext.login('test.person@example.com', 'SuperSecret123')

    let screen = await visit('/')
    const settingsLink = screen.getByRole('link', { name: /Settings/ })

    await settingsLink.click()

    await screen.assertExists(screen.getByRole('heading', { level: 1, name: 'Your Settings' }))

    const nameInput = screen.getByLabel('your name')
    const bioInput = screen.getByLabel('short bio about you')
    const emailInput = screen.getByLabel('email')
    const passwordInput = screen.getByLabel('new password')
    const updateButton = screen.getByRole('button', { name: 'Update Settings' })

    assert.equal(await nameInput.inputValue(), 'TestPerson')
    assert.equal(await bioInput.inputValue(), 'I am a test person')
    assert.equal(await emailInput.inputValue(), 'test.person@example.com')
    assert.empty(await passwordInput.inputValue())

    await nameInput.fill('NewName')
    await bioInput.fill('I am a brand new me!')
    await emailInput.fill('new.person@example.com')
    await passwordInput.fill('SuperDuperSecret123')

    await updateButton.click()

    await profile.refresh()
    assert.equal(profile.name, 'NewName')
    assert.equal(profile.bio, 'I am a brand new me!')
    assert.equal(
      (await profile.related('user').query().firstOrFail()).email,
      'new.person@example.com'
    )

    assert.equal(await nameInput.inputValue(), 'NewName')
    assert.equal(await bioInput.inputValue(), 'I am a brand new me!')
    assert.equal(await emailInput.inputValue(), 'new.person@example.com')

    const logoutButton = screen.getByRole('button', { name: /click here to logout/ })
    await logoutButton.click()

    await screen.assertNotExists(screen.getByRole('link', { name: /Settings/ }))

    await browserContext.login('new.person@example.com', 'SuperDuperSecret123')

    screen = await visit('/')
    await screen.assertExists(screen.getByRole('link', { name: 'NewName' }))
  })
})
