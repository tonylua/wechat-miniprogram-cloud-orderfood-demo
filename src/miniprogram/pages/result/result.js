// miniprogram/pages/result/result.js
// 查看结果页
const { $reVote } = require('../../utils/requests');
const { shareAppMessage } = require('../../utils/share');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    teamid: '',
    options: [],
    revote: false,
    drawByLot: false, // 是否存在多个第一名同票数，需要抽签决定
    champion: '' // 得票第一的店名
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad (query) {
    let { team } = query;

    wx.cloud.callFunction({
      name: 'getTeams',
      data: {
        teamid: team
      }
    }).then(res => {
      const { teams, openid } = res.result;
      console.log('getTeams from remote', teams);

      const data = teams[0];
      const { options } = data;

      // 第一名及检查是否有同票
      let champion = options[0];
      let sameVotes = options.filter(
        opt => (opt.supporters.length === champion.supporters.length)
      );

      this.setData({
        teamid: team,
        options,
        champion,
        drawByLot: sameVotes.length > 1
      });
    });
  },

  // 重新投票
  onReVote() {
    $reVote({
      teamid: this.data.teamid
    }).then(res => {
      console.log(res);
      wx.navigateTo({
        url: '/pages/vote/vote?revote=1&team=' + this.data.teamid,
      })
    });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    // console.log('点击转发才触发', this.data.teamid);
    return shareAppMessage(this.data.teamid);
  },

})