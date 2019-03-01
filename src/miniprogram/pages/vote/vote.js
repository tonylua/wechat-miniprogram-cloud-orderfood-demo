// miniprogram/pages/share/share.js
// 组队成功后的分享和投票页面
const { $getTeams, $vote } = require('../../utils/requests');

const app = getApp();

function _toResult(id) {
  wx.navigateTo({
    url: '/pages/result/result?team=' + id,
  })
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null,
    logged: false,
    teamid: '',
    options: [],
    hasShared: false, //是否是来自分享后的返回页面
    hasClickedShareMenu: false,
    checkedOptionIndex: 0, // 已选中的商家索引
    btnDisabled: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad (query) {
    const { scene, path, shareTicket } = wx.getLaunchOptionsSync();
    let { team, revote, share } = query;
    
    console.log('vote onLoad', scene, path, shareTicket, revote, share, this.data.hasClickedShareMenu);

    const hasShared = share === '1';

    // if (scene === 1044) { //转发群后进入
      // wx.getShareInfo({
      //   shareTicket,
      //   success(res) {
      //     console.log(res)
      //   }
      // });
    // } ,
    if (revote === '1') {
      this.setData({
        revote: true
      });
    }
    
    if (app.globalData.userInfo) {
      this.loginUserInfo(app.globalData.userInfo);
    } else {
      wx.getSetting({
        success: res => {
          if (res.authSetting['scope.userInfo']) {
            wx.getUserInfo({
              success: res => {
                app.globalData.userInfo = res.userInfo;
                this.loginUserInfo(res.userInfo);
              }
            });
          }
        }
      })
    }

    this.getTeams(team, hasShared);
  },

  // 未授权情况下，点击按钮获取用户信息
  onGetUserInfo(e) {
    if (e.detail.userInfo) {
      this.loginUserInfo(e.detail.userInfo);
    }
  },
  
  loginUserInfo(userInfo) {
    this.setData({
      userInfo,
      logged: true
    });
  },

  getTeams(team, hasShared) {
    $getTeams({
      teamid: team
    }).then(res => {
      const { teams, openid } = res.result;
      const data = teams[0];
      console.log('getTeams from remote', team, teams);

      // 用户已经投过票,暂时不允许重新投票
      console.log('onLoad', res.result, data.members, openid)
      if (this.data.logged && ~data.members.indexOf(openid)) {
        _toResult(team);
        return;
      }

      this.setData({
        teamid: team,
        options: data.options,
        hasShared
      });
    });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage () {
    console.log('点击转发才触发', this.data.teamid)

    wx.showShareMenu({
      withShareTicket: true
    });

    this.setData({
      hasClickedShareMenu: true
    });

    return {
      title: "快来商量吃什么啦！",
      path: '/pages/vote/vote?share=1&team=' + this.data.teamid
    }
  },

  /**
   * 选择了餐馆
   */
  onChecked(e) {
    const { value } = e.detail;
    this.setData({
      checkedOptionIndex: value
    });
  },

  /**
   * 提交选择结果
   */
  onSubmit(e) {
    const { formId } = e.detail;
    const { teamid, checkedOptionIndex, userInfo } = this.data;
    
    this.setData({
      btnDisabled: true
    });

    console.log('vote', teamid, checkedOptionIndex, userInfo)

    $vote({
      teamid,
      checkedOptionIndex,
      avatarUrl: userInfo.avatarUrl,
      formId
    }).then(res => {
      console.log(res)
      _toResult(teamid);
    }).catch(err => {
      console.log(err)
      wx.showToast({
        title: '提交失败' + err.errCode,
        icon: 'none',
        duration: 5000
      });
      this.setData({
        btnDisabled: false
      })
    });
  }
})