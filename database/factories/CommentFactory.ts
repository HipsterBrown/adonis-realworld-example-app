import Comment from '../../app/Models/Comment'
import Factory from '@adonisjs/lucid/factories'
import { ArticleFactory } from './ArticleFactory'
import { ProfileFactory } from './ProfileFactory'

export const CommentFactory = Factory.define(Comment, ({ faker }) => {
  return {
    body: faker.lorem.paragraph(),
  }
})
  .relation('article', () => ArticleFactory)
  .relation('author', () => ProfileFactory)
  .build()
