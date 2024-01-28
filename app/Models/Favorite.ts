import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import Article from './Article.js'
import Profile from './Profile.js'
import { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class Favorite extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public articleId: number

  @column()
  public profileId: number

  @belongsTo(() => Article)
  public article: BelongsTo<typeof Article>

  @belongsTo(() => Profile)
  public profile: BelongsTo<typeof Profile>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
