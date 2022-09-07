import Database from '@ioc:Adonis/Lucid/Database'
import { test } from '@japa/runner'
import User from 'App/Models/User'

test.group('users/new', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()

    return () => Database.rollbackGlobalTransaction()
  })

  test('user can sign up and be authenticated', async ({ assert, page, getScreen }) => {
    assert.lengthOf(await User.all(), 0)

    await page.goto('/')
    let screen = await getScreen()

    const signupLink = await screen.findByRole('link', { name: /Sign up/ })
    await signupLink.click()

    screen = await getScreen()

    assert.exists(await screen.findByRole('heading', { level: 1, name: 'Sign up' }))
    assert.exists(await screen.findByRole('link', { name: 'Have an account?' }))

    const nameInput = await screen.findByLabelText('name')
    const emailInput = await screen.findByLabelText('email')
    const passwordInput = await screen.findByLabelText('password')

    await nameInput.fill('TestPerson')
    await emailInput.fill('test.person@example.com')
    await passwordInput.fill('SuperSecret123')

    const signUpButton = await screen.findByRole('button', { name: /Sign up/ })
    await signUpButton.click()

    screen = await getScreen()

    assert.exists(await screen.findByRole('link', { name: 'TestPerson' }))
    assert.lengthOf(await User.all(), 1)
  })
})
