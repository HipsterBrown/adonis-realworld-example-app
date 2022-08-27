import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Profile from '../../Models/Profile'
import UpdateProfileValidator from '../../Validators/UpdateProfileValidator'

export default class ProfilesController {
  public async index({}: HttpContextContract) {}

  public async create({}: HttpContextContract) {}

  public async store({}: HttpContextContract) {}

  public async show({}: HttpContextContract) {}

  public async edit({ auth, view }: HttpContextContract) {
    let profile = await Profile.findBy('userId', auth.user.id)
    await profile?.load('user')
    return view.render('profiles/edit', { profile })
  }

  public async update({ auth, request, response }: HttpContextContract) {
    const { email, password, ...profileValues } = await request.validate(UpdateProfileValidator)
    const profile = await Profile.findBy('userId', auth.user.id)
    await profile?.merge(profileValues).save()

    if (email) {
      await auth.user.merge({ email }).save()
    }

    if (password) {
      await auth.user.merge({ password }).save()
    }

    return response.redirect().toRoute('settings')
  }

  public async destroy({}: HttpContextContract) {}
}
