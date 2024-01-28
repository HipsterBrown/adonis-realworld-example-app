import type { HttpContext } from '@adonisjs/core/http'
import CreateSessionValidator from '../../Validators/CreateSessionValidator.js'

export default class SessionsController {
  public async index({}: HttpContext) {}

  public async new({ view }: HttpContext) {
    return view.render('sessions/new')
  }

  public async create({ auth, request, response }: HttpContext) {
    const { email, password } = await request.validate(CreateSessionValidator)

    await auth.attempt(email, password)

    return response.redirect().toPath('/')
  }

  public async show({}: HttpContext) {}

  public async edit({}: HttpContext) {}

  public async update({}: HttpContext) {}

  public async destroy({ auth, response }: HttpContext) {
    await auth.logout()

    return response.redirect().toPath('/')
  }
}
