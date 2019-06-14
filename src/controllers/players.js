import Player from '../models/Player'

const router = {
  get: {},
  post: {}
}

router.get.fetchAllPlayers = async function(ctx) {
  const players = await Player.fetchAllPlayers()

  ctx.body = {
    players: players.map(player => player.plain())
  }
}

router.post.createNewPlayer = async function(ctx) {
  if (!ctx.req.currentUser) return ctx.body = {
    error: 'not logined'
  }

  const title = ctx.request.body.title
  const player = new Player(title)

  ctx.body = {
    player: player.plain()
  }
}

export default router