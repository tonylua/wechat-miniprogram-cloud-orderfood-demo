const { $saveFormIds } = require('./utils/requests');

App({
  onLaunch () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'prod-407cc5',
        traceUser: true,
      })
    }
    this.globalData = {
      // formIds: [],
      // userInfo: {},
      // openid: ''
    }
  },
  onHide () {
    $saveFormIds();
  }
})
