import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import {
  column,
  beforeSave,
  BaseModel,
  hasOne,
  hasMany
} from '@adonisjs/lucid/orm'
import Profile from './Profile'
import Article from './Article'
import { HasOne } from "@adonisjs/lucid/types/relations";
import { HasMany } from "@adonisjs/lucid/types/relations";

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public email: string

  @column({ serializeAs: null })
  public password: string

  @column()
  public rememberMeToken?: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @hasOne(() => Profile)
  public profile: HasOne<typeof Profile>

  @hasMany(() => Article)
  public articles: HasMany<typeof Article>

  @beforeSave()
  public static async hashPassword(User: User) {
    if (User.$dirty.password) {
      User.password = await hash.make(User.password)
    }
  }
}
