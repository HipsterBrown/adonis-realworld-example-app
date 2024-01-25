import User from '../../app/Models/User.js'
import Profile from '../../app/Models/Profile.js'
import Factory from '@adonisjs/lucid/factories'

export const UserFactory = Factory.define(User, ({ faker }) => {
  return {
    email: faker.internet.email(),
    password: faker.internet.password(),
  }
}).build()

export const ProfileFactory = Factory.define(Profile, ({ faker }) => {
  return {
    name: faker.internet.userName(),
    avatar: faker.internet.avatar(),
    bio: faker.lorem.sentence(),
  }
})
  .relation('user', () => UserFactory)
  .build()
