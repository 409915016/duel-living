import AV from '../libs/lean'
import { EventEmitter } from 'events'

const PlayerObject = AV.Object.extend('Player') //构建 参赛方 数据表

class Player extends EventEmitter {
  constructor(title = '', save = true) {
    super()

    this.title = title

    if (save) {
      const playerObject = new PlayerObject() //实例化
      playerObject.set('title', title) //设置标题
      playerObject.save()
        .then(player => {
          this.object = player
          this.id = player.id //取得 id
          this.emit('ready')
        })
        .catch(err => this.emit('error', err))
    }
  }

  plain() {
    return {
      id: this.id,
      title: this.title
    }
  }

  static fetch(id) {
    return new Promise((resolve, reject) => {
      const query = new AV.Query(PlayerObject)
      query.get(id)
        .then(object => resolve(Player.wrap(object)))
        .catch(reject)
    })
  }

  static fetchAllPlayers() {
    const query = new AV.Query(PlayerObject)

    return query.find()
      .then(results => results.map(Player.wrap))
  }

  static wrap(object) {
    const player = new Player(object.get('title'), false)
    player.id = object.id
    player.object = object
    return player
  }
}

export default Player