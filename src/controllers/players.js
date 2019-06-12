import Player from '../models/Player'

const router = {
  get: {},
  post: {}
}

router.get.fetchAllPlayers = async function() {
  const players = await Player.fetchAllPlayers()

  this.body = {
    players: players.map(player => player.plain())
  }
}

router.post.createNewPlayer = async function() {
  if (!req.currentUser) return this.body = {
    error: 'not logined'
  }

  const title = this.request.body.title
  const player = new Player(title)

  this.body = {
    player: player.plain()
  }
}

export default router