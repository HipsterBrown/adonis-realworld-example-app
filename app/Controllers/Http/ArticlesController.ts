import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Article from '../../Models/Article'
import Tag from '../../Models/Tag'
import CreateArticleValidator from '../../Validators/CreateArticleValidator'

export default class ArticlesController {
  public async index({ view, request }: HttpContextContract) {
    const { filterBy, tag } = request.qs()
    const articles = await Article.query()
      .if(filterBy === 'tag' && !!tag, (query) =>
        query.whereHas('tags', (tagsQuery) => tagsQuery.where('value', tag))
      )
      .preload('user', (userQuery) => userQuery.preload('profile'))
    const tags = await Tag.all()
    return view.render('articles/index', { articles, tags })
  }

  public async new({ view }: HttpContextContract) {
    return view.render('articles/new')
  }

  public async create({ auth, request, response }: HttpContextContract) {
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

  public async show({ request, view }: HttpContextContract) {
    const article = await Article.findByOrFail('slug', request.param('slug'))
    await article.load('user', (loader) => loader.preload('profile'))
    await article.load('comments', (loader) =>
      loader.preload('author').orderBy('createdAt', 'desc')
    )

    return view.render('articles/show', { article })
  }

  public async edit({ auth, request, view, session, response }: HttpContextContract) {
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

  public async update({ auth, request, session, response }: HttpContextContract) {
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

  public async destroy({ auth, request, session, response }: HttpContextContract) {
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
