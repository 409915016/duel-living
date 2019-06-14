import Host from '../models/Host'

const router = {
  get: {},
  post: {}
}

router.get.checkIsLogined = async (ctx)=> {
  ctx.body = {
    logined: !!ctx.req.currentUser 
  }
}

router.post.login = async (ctx, next)=> {
  const username = ctx.request.body.username
  const password = ctx.request.body.password

  try {
    const host = await Host.login(username, password)
    ctx.res.saveCurrentUser(host.object)

    ctx.body = {
      host: host
    }
  } catch(err) {
    ctx.body = {
      error: err.rawMessage
    }
  }
  next();
}

export default router