import Comment from '../../app/Models/Comment.js'
import Factory from '@adonisjs/lucid/factories'
import { ArticleFactory } from './ArticleFactory.js'
import { ProfileFactory } from './ProfileFactory.js'

export const CommentFactory = Factory.define(Comment, ({ faker }) => {
  return {
    body: faker.lorem.paragraph(),
  }
})
  .relation('article', () => ArticleFactory)
  .relation('author', () => ProfileFactory)
  .build()
