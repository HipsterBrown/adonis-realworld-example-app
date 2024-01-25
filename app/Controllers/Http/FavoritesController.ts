import type { HttpContext } from '@adonisjs/core/http'
import Article from '../../Models/Article'
import Favorite from '../../Models/Favorite'

export default class FavoritesController {
  public async create({ params, response, auth }: HttpContext) {
    if (!auth.user) return response.unauthorized()
    const profile = await auth.user.related('profile').query().firstOrFail()
    const article = await Article.findByOrFail('slug', params.slug)

    await Favorite.create({ profileId: profile.id, articleId: article.id })

    return response.redirect().back()
  }

  public async destroy({ params, response, auth }: HttpContext) {
    if (!auth.user) return response.unauthorized()
    const profile = await auth.user.related('profile').query().firstOrFail()
    const article = await Article.findByOrFail('slug', params.slug)

    const favorite = await article
      .related('favorites')
      .query()
      .where('profileId', profile.id)
      .firstOrFail()
    await favorite.delete()

    return response.redirect().back()
  }
}
