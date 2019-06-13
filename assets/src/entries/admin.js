import Vue from 'vue'

const swalp = (...args) => {
  return new Promise(resolve => {
    swal(...args, (...argv) => resolve(...argv))
  })
}

new Vue({
  el: '#admin',

  data: {
    page: 'main',
    host: null,

    duels: [], //赛事列表
    duel: null,
    messages: [],

    content: '',

    players: [],
    newPlayers: {
      1: '',
      2: ''
    },
  },

  ready() {
    fetch('/api/host/islogined', { //检测是是否登录
      credentials: 'same-origin'
    })
      .then(res => res.json())
      .then(data => {
        if (!data.logined) {
          swalp({
            title: 'Login',
            type: 'input',
            placeholder: 'username',
            closeOnConfirm: false,
            animation: "slide-from-top"
          })
            .then(username => {
              return swalp({
                title: 'Input password',
                type: 'input',
                inputType: 'password',
                closeOnConfirm: false,
                animation: "slide-from-top",
                showLoaderOnConfirm: true
              })
                .then(password => [ username, password ])
            })
            .then(([ username, password ]) => { //用账号密码登录
              return fetch('/api/host/login', {
                method: 'POST',
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                  username, password
                })
              })
            })
            .then(res => res.json())
            .then(data => {
              if (data.error) {
                return swalp({ //错误处理
                  type: 'error',
                  title: data.error,
                  showCancelButton: false,
                  showConfirmButton: false
                })
              }

              this.host = data.host //返回主持人信息

              return swalp({
                type: 'success',
                title: 'Welcome'
              })
            })
        } else {
          return Promise.resolve()
        }
      })
      .then(() => {
        return fetch('/api/duels', { //获取赛事列表
          credentials: 'same-origin'
        })
      })
      .then(res => res.json())
      .then(data => {
        this.duels = data.duels
      })
  },

  methods: {
    enterDuel(duel) { //当前赛事
      this.page = 'main'
      this.duel = duel 

      fetch(`/api/duel/${duel.id}/messages`, { //获取对应 赛事 的消息
        credentials: 'same-origin'
      })
        .then(res => res.json())
        .then(data => {
          this.messages = data.messages //丢入消息列表
        })
    },

    score(id) { //玩家id 
      return this.duel.scores[id] || 0 //赛事比分对象中 用id 找 比分
    },

    duelClass(duel) {
      switch (duel.status) {
        // Not yet
        case 0:
          return {}

        // Playing
        case 1:
          return {
            'list-group-item-success': true
          }

        // Ended
        case 2: {
          return {
            'list-group-item-info': true
          }
        }
      }
    },

    playerClass(i) {
      switch (i) {
        case 0:
          return { 'player-blue': true }
        case 1:
          return { 'player-red': true }
      }
    },

    plusScore(player) {//增加当前参赛者的 分数
      this.duel.scores[player.id]++
    },

    minusScore(player) { //减去当前参赛者的 分数
      if (this.duel.scores[player.id] === 0) return

      this.duel.scores[player.id]--
    },

    sendMessage() {//发送一条消息
      const content = this.content

      fetch(`/api/duel/${this.duel.id}/message`, { 
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        credentials: 'same-origin',
        body: JSON.stringify({ //顺便更新比分
          content,
          scores: this.duel.scores
        })
      })
        .then(res => res.json())
        .then(data => {
          this.messages.unshift(data.message) //加入最新的消息列表中
          this.content = '' //清空输入框
        })
    },

    updateDuelStatus(status) { //修改赛事状态
      fetch(`/api/duel/${this.duel.id}/status`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          status: status //状态 0 未开始 1 进行中，2 结束
        })
      })
        .then(res => res.json())
        .then(data => {
          this.duel.status = data.status //保存当前赛事的状态
        })
    },

    newDuel() {
      this.page = 'newduel' //显示新建赛事表单

      fetch('/api/players') //读取 player 列表
        .then(res => res.json()) 
        .then(data => {
          this.players = data.players
        })
    },

    newPlayer(pos) { //创建新的 player
      swalp({  //输入框
        title: 'Player title',
        type: 'input',
        closeOnConfirm: false,
        animation: "slide-from-top",
        showLoaderOnConfirm: true
      })
        .then(title => {
          if (title === '') {
            return swal({
              title: 'Title couldn\'t be empty.',
              type: 'error'
            })
          }

          fetch('/api/players/new', { //创建新的player
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            credentials: 'same-origin',
            body: JSON.stringify({
              title: title
            })
          })
            .then(res => res.json())
            .then(data => {
              this.players.push(data.player)
              this.newPlayers[pos] = data.player.id //新增后默认选中

              swal({
                title: 'OK',
                type: 'success'
              })
            })
        })
    },

    submitNewDuel() { //创建新的赛事
      fetch(`/api/duels/new`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          players: this.newPlayers //比赛双方  1: playerid , 2: playerid
        })
      })
        .then(res => res.json())
        .then(data => {
          this.duels.unshift(data.duel) //放到最新赛事列表中
          this.enterDuel(data.duel) //默认选中赛事
        })
    }
  }
})