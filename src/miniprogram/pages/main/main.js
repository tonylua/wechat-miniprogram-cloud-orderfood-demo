// miniprogram/pages/main/main.js
// 主页
const { $login } = require('../../utils/requests');

const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null,
    logged: false,
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad (options) {
    if (!wx.cloud) {
      wx.redirectTo({
        url: '../chooseLib/chooseLib',
      })
      return
    }

    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (!res.authSetting['scope.userInfo']) return;
        // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
        wx.getUserInfo({
          success: res => {
            this._renderUserInfo(res.userInfo);
          }
        });
      }
    })
  },

  _renderUserInfo(userInfo) {
    // 存入全局
    app.globalData.userInfo = userInfo;

    this.setData({
      userInfo,
      logged: true
    });
  },

  // 未授权情况下，点击按钮获取用户信息
  onGetUserInfo (e) {
    if (!this.logged && e.detail.userInfo) {
      this._renderUserInfo(e.detail.userInfo);
    }
  }, 
  
  // 点击组队按钮
  onFormTeam () {
    // 调用云函数，获得 openid
    $login().then(res => {
      const { openid } = res.result;
      
      // 存入全局
      app.globalData.openid = openid;

      console.log('[云函数] [login] user openid: ', openid, res)   
      // wx.navigateTo({
      //   url: '../userConsole/userConsole',
      // })
      return openid;
    }).then(openid => {
      wx.navigateTo({
        url: `../formTeam/formTeam?openid=${openid}`
      })
    }).catch(err => {
      console.error('[云函数] [login] 调用失败', err)
      wx.navigateTo({
        url: '../deployFunctions/deployFunctions',
      })
    })
  },
})