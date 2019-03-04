const defaultVlu = {
  // 绝对路径，或相对于所在 pages 的路径
  avatarUrl: '/components/userInfoBox/user-unlogin.png',
  nickName: '',
};

Component({
  properties: {
    userInfo: {
      type: Object,
      value: defaultVlu,
      observer(newVal, oldVal, changedPath) {
        if (!newVal) {
          this.setData({
            userInfo: defaultVlu
          })
        }
      } // end of observer
    }
  }
})
