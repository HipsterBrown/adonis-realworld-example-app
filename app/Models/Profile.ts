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

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
