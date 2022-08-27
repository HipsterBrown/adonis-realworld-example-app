import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import CreateSessionValidator from '../../Validators/CreateSessionValidator'

export default class SessionsController {
  public async index({}: HttpContextContract) {}

  public async new({ view }: HttpContextContract) {
    return view.render('sessions/new')
  }

  public async create({ auth, request, response }: HttpContextContract) {
    const { email, password } = await request.validate(CreateSessionValidator)

    await auth.attempt(email, password)

    return response.redirect().toPath('/')
  }

  public async show({}: HttpContextContract) {}

  public async edit({}: HttpContextContract) {}

  public async update({}: HttpContextContract) {}

  public async destroy({ auth, response }: HttpContextContract) {
    await auth.logout()

    return response.redirect().toPath('/')
  }
}
