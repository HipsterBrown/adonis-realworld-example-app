import Database from '@ioc:Adonis/Lucid/Database'
import { test } from '@japa/runner'
import { ProfileFactory } from 'Database/factories/ProfileFactory'

test.group('profiles/edit', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()

    return () => Database.rollbackGlobalTransaction()
  })

  test('logged in user can edit their profile', async ({ assert, page, login, getScreen }) => {
    const profile = await ProfileFactory.merge({
      name: 'TestPerson',
      bio: 'I am a test person',
    })
      .with('user', 1, (user) =>
        user.merge({ email: 'test.person@example.com', password: 'SuperSecret123' })
      )
      .create()

    await login('test.person@example.com', 'SuperSecret123')

    await page.goto('/')
    let screen = await getScreen()
    const settingsLink = await screen.findByRole('link', { name: /Settings/ })

    await settingsLink.click()

    screen = await getScreen()

    assert.exists(await screen.findByRole('heading', { level: 1, name: 'Your Settings' }))

    const nameInput = await screen.findByLabelText('your name')
    const bioInput = await screen.findByLabelText('short bio about you')
    const emailInput = await screen.findByLabelText('email')
    const passwordInput = await screen.findByLabelText('new password')
    const updateButton = await screen.findByRole('button', { name: 'Update Settings' })

    assert.equal(await nameInput.inputValue(), 'TestPerson')
    assert.equal(await bioInput.inputValue(), 'I am a test person')
    assert.equal(await emailInput.inputValue(), 'test.person@example.com')
    assert.empty(await passwordInput.inputValue())

    await nameInput.fill('NewName')
    await bioInput.fill('I am a brand new me!')
    await emailInput.fill('new.person@example.com')
    await passwordInput.fill('SuperDuperSecret123')

    await updateButton.click()

    screen = await getScreen()

    await profile.refresh()
    assert.equal(profile.name, 'NewName')
    assert.equal(profile.bio, 'I am a brand new me!')
    assert.equal(
      (await profile.related('user').query().firstOrFail()).email,
      'new.person@example.com'
    )

    assert.exists(await screen.findByDisplayValue('NewName'))
    assert.exists(await screen.findByDisplayValue('I am a brand new me!'))
    assert.exists(await screen.findByDisplayValue('new.person@example.com'))

    const logoutButton = await screen.findByRole('button', { name: /click here to logout/ })
    await logoutButton.click()

    screen = await getScreen()

    assert.notExists(await screen.queryByRole('link', { name: /Settings/ }))

    await login('new.person@example.com', 'SuperDuperSecret123')

    screen = await getScreen()

    assert.exists(await screen.findByRole('link', { name: /NewName/ }))
  })
})
