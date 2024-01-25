import type { HttpContext } from '@adonisjs/core/http'
import Article from '../../Models/Article.js'
import Follow from '../../Models/Follow.js'
import Profile from '../../Models/Profile.js'
import Tag from '../../Models/Tag.js'
import CreateArticleValidator from '../../Validators/CreateArticleValidator.js'

export default class ArticlesController {
  public async index({ view, request, auth }: HttpContext) {
    const { filterBy, tag } = request.qs()
    const page = request.input('page', 1)
    const limit = 10
    const currentProfile = await Profile.findBy('user_id', auth.user?.id ?? '')

    const articles = await Article.query()
      .if(filterBy === 'tag' && !!tag, (query) =>
        query.whereHas('tags', (tagsQuery) => tagsQuery.where('value', tag))
      )
      .if(filterBy === 'following' && currentProfile, (query) =>
        query.whereHas('profile', async (profileQuery) => {
          const following = Follow.query().where('followerId', currentProfile!.id)
          profileQuery.whereIn('id', following.select('followingId'))
        })
      )
      .preload('profile')
      .withCount('favorites')
      .orderBy('createdAt', 'desc')
      .paginate(page, limit)
    const tags = await Tag.all()

    if (filterBy) articles.queryString({ filterBy })
    if (tag) articles.queryString({ filterBy, tag })

    return view.render('articles/index', {
      articles,
      tags,
      selectedTag: tag,
      followFeed: filterBy === 'following',
    })
  }

  public async new({ view }: HttpContext) {
    return view.render('articles/new')
  }

  public async create({ auth, request, response }: HttpContext) {
    const { tags, ...values } = await request.validate(CreateArticleValidator)
    const article = await auth.user?.related('articles').create(values)

    if (tags) {
      const relatedTags = await Tag.fetchOrCreateMany(
        'value',
        tags.split(',').map((value) => ({ value: value.trim() }))
      )
      await article?.related('tags').sync(relatedTags.map(({ id }) => id))
    }

    return response.redirect().toRoute('articles.show', article)
  }

  public async show({ request, view }: HttpContext) {
    const article = await Article.findByOrFail('slug', request.param('slug'))
    await article.load((loader) => {
      loader
        .load('user', (userLoader) =>
          userLoader.preload('profile', (profileLoader) => profileLoader.withCount('followers'))
        )
        .load('comments', (commentLoader) =>
          commentLoader.preload('author').orderBy('createdAt', 'desc')
        )
    })
    await article.loadCount('favorites')

    return view.render('articles/show', { article })
  }

  public async edit({ auth, request, view, session, response }: HttpContext) {
    const article = await auth.user
      ?.related('articles')
      .query()
      .where('slug', request.param('slug'))
      .first()

    if (!article) {
      session.flashMessages.set('error', 'Unauthorized access of editor')
      return response.redirect().toRoute('articles.show', { slug: request.param('slug') })
    }
    await article.load('tags')

    return view.render('articles/edit', { article })
  }

  public async update({ auth, request, session, response }: HttpContext) {
    const article = await auth.user
      ?.related('articles')
      .query()
      .where('slug', request.param('slug'))
      .first()

    if (!article) {
      session.flashMessages.set('error', 'Unauthorized update of article')
    } else {
      const { tags, ...values } = await request.validate(CreateArticleValidator)
      await article.merge(values).save()
      if (tags) {
        const relatedTags = await Tag.fetchOrCreateMany(
          'value',
          tags.split(',').map((value) => ({ value: value.trim() }))
        )
        await article.related('tags').sync(relatedTags.map(({ id }) => id))
      }
    }

    return response.redirect().toRoute('articles.show', { slug: request.param('slug') })
  }

  public async destroy({ auth, request, session, response }: HttpContext) {
    const article = await auth.user
      ?.related('articles')
      .query()
      .where('slug', request.param('slug'))
      .first()

    if (!article) {
      session.flashMessages.set('error', 'Unauthorized delete of article')
    } else {
      await article.delete()
      session.flashMessages.set('success', 'Successfully removed article')
    }

    return response.redirect().toPath('/')
  }
}
