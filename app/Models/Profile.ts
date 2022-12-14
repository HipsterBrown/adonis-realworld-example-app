import { DateTime } from 'luxon'
import {
  BaseModel,
  BelongsTo,
  belongsTo,
  column,
  HasManyThrough,
  hasManyThrough,
} from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import Article from './Article'
import Favorite from './Favorite'
import Follow from './Follow'

export default class Profile extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public userId: number

  @column()
  public bio: string | null

  @column()
  public name: string

  @column()
  public avatar: string | null

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>

  @hasManyThrough([() => Article, () => User], {
    foreignKey: 'id',
    localKey: 'userId',
    throughForeignKey: 'userId',
    throughLocalKey: 'id',
  })
  public articles: HasManyThrough<typeof Article>

  @hasManyThrough([() => Article, () => Favorite])
  public favoriteArticles: HasManyThrough<typeof Article>

  @hasManyThrough([() => Profile, () => Follow], {
    foreignKey: 'followingId',
    localKey: 'id',
    throughForeignKey: 'id',
    throughLocalKey: 'followerId',
  })
  public followers: HasManyThrough<typeof Profile>

  @hasManyThrough([() => Profile, () => Follow], {
    foreignKey: 'followerId',
    localKey: 'id',
    throughForeignKey: 'id',
    throughLocalKey: 'followingId',
  })
  public followings: HasManyThrough<typeof Profile>

  public async followedBy(this: Profile, profile: Profile): Promise<boolean> {
    const follower = await this.related('followers')
      .query()
      .where('profiles.id', profile.id)
      .first()
    return follower !== null
  }

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
