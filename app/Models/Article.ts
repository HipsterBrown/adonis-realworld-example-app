import { DateTime } from 'luxon'
import {
  BaseModel,
  belongsTo,
  column,
  hasMany,
  manyToMany,
} from '@adonisjs/lucid/orm'
import User from './User'
import { slugify } from '@ioc:Adonis/Addons/LucidSlugify'
import Tag from './Tag'
import Profile from './Profile'
import Comment from './Comment'
import Favorite from './Favorite'
import { BelongsTo } from "@adonisjs/lucid/types/relations";
import { HasMany } from "@adonisjs/lucid/types/relations";
import { ManyToMany } from "@adonisjs/lucid/types/relations";

export default class Article extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public userId: number

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>

  @manyToMany(() => Tag)
  public tags: ManyToMany<typeof Tag>

  @belongsTo(() => Profile, { localKey: 'userId', foreignKey: 'userId' })
  public profile: BelongsTo<typeof Profile>

  @hasMany(() => Comment)
  public comments: HasMany<typeof Comment>

  @hasMany(() => Favorite)
  public favorites: HasMany<typeof Favorite>

  public async favoritedBy(this: Article, profile: Profile): Promise<boolean> {
    return (await this.related('favorites').query().where('profileId', profile.id).first()) !== null
  }

  @column()
  public body: string

  @column()
  public title: string

  @column()
  public description: string

  @column()
  @slugify({
    strategy: 'shortId',
    fields: ['title'],
  })
  public slug: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
