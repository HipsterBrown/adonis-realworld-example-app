import User from '../../app/Models/User'
import Profile from '../../app/Models/Profile'
import Factory from '@ioc:Adonis/Lucid/Factory'

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
