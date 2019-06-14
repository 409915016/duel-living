import AV from '../libs/lean'
import { EventEmitter } from 'events'

class Host extends EventEmitter {
  constructor(username = '', nickname = '', password = null) {
    super()

    this.username = username
    this.nickname = nickname

    if (password) { //注册
      const host = new AV.User() //使用 LeanCloud 用户功能
      host.setUsername(username)
      host.setPassword(password)
      host.set('nickname', nickname) //设置 登陆id 密码 和 昵称
      host.signUp() //注册一个用户
        .then(loginedHost => {
          this.object = loginedHost
          this.emit('ready')
        })
        .catch(err => this.emit('error', err))
    }
  }

  plain() {  //返回当前用户名和昵称
    return {
      username: this.username,
      nickname: this.nickname
    }
  }

  static login(username = '', password = '') {  //登录
    return new Promise((resolve, reject) => {
      AV.User.logIn(username, password)
        .then(loginedHost => {
          const host = new Host(username, loginedHost.get('nickname')) //返回 Host 对象
          host.object = loginedHost //给 Host 对象加入 LeanCloud 对象
          resolve(host)
        })
        .catch(reject)
    })
  }

  static wrap(object) { //object 是  LeanCloud 返回的登录对象
    const username = object.get('username') 
    const nickname = object.get('nickname')

    const player = new Host(username, nickname)
    player.id = object.id
    player.object = object
    return player //返回有 id 和 用户对象的对象
  }
}

export default Host