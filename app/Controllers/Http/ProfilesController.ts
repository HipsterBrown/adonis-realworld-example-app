import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Article from '../../Models/Article'
import Profile from '../../Models/Profile'
import UpdateProfileValidator from '../../Validators/UpdateProfileValidator'

export default class ProfilesController {
  public async show({ view, params, request }: HttpContextContract) {
    const profile = await Profile.findByOrFail('name', decodeURIComponent(params.name))
    const showFavorites = request.matchesRoute('profiles.show.favorites')
    let articles: Article[]

    if (showFavorites) {
      articles = await Article.query()
        .whereHas('favorites', (query) => query.where('profileId', profile.id))
        .preload('profile')
        .withCount('favorites')
        .orderBy('createdAt', 'desc')
    } else {
      await profile.load('articles', (articleLoader) => {
        articleLoader.preload('profile').withCount('favorites').orderBy('createdAt', 'desc')
      })
      articles = profile.articles
    }

    await profile.loadCount('followers')

    return view.render('profiles/show', { profile, articles, showFavorites })
  }

  public async edit({ auth, view }: HttpContextContract) {
    let profile = await Profile.findBy('userId', auth.user?.id)
    await profile?.load('user')
    return view.render('profiles/edit', { profile })
  }

  public async update({ auth, request, response }: HttpContextContract) {
    const { email, password, ...profileValues } = await request.validate(UpdateProfileValidator)
    const profile = await Profile.findBy('userId', auth.user?.id)
    await profile?.merge(profileValues).save()

    if (email) {
      await auth.user?.merge({ email }).save()
    }

    if (password) {
      await auth.user?.merge({ password }).save()
    }

    return response.redirect().toRoute('settings')
  }
}
