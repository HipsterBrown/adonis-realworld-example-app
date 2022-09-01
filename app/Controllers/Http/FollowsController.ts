import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Follow from '../../Models/Follow'
import Profile from '../../Models/Profile'

export default class FollowersController {
  public async create({ auth, params, response }: HttpContextContract) {
    if (!auth.user) return response.unauthorized()
    const followerProfile = await auth.user.related('profile').query().firstOrFail()
    const followingProfile = await Profile.findByOrFail('name', params.name)
    await Follow.create({ followerId: followerProfile.id, followingId: followingProfile.id })

    return response.redirect().back()
  }

  public async destroy({ auth, params, response }: HttpContextContract) {
    if (!auth.user) return response.unauthorized()
    const followerProfile = await auth.user.related('profile').query().firstOrFail()
    const followingProfile = await Profile.findByOrFail('name', params.name)
    const follow = await Follow.query()
      .where('followerId', followerProfile.id)
      .where('followingId', followingProfile.id)
      .firstOrFail()
    await follow.delete()

    return response.redirect().back()
  }
}
