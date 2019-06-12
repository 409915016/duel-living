import Host from '../models/Host'

const router = {
  get: {},
  post: {}
}

router.get.checkIsLogined = async ()=> {
  this.body = {
    logined: !!this.req.currentUser
  }
}

router.post.login = async (ctx, next)=> {
  const username = ctx.request.body.username
  const password = ctx.request.body.password

  try {
    const host = await Host.login(username, password)
    this.res.saveCurrentUser(host.object)

    this.body = {
      host: host
    }
  } catch(err) {
    this.body = {
      error: err.message
    }
  }
  await next();
}

export default router