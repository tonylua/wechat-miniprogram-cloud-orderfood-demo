/**
 * 用户点击右上角分享
 */
exports.shareAppMessage = (teamid) => {
  // console.log('点击转发才触发', teamid)

  wx.showShareMenu({
    withShareTicket: true
  });

  // this.setData({
  //   hasClickedShareMenu: true
  // });

  return {
    title: "快来商量吃什么啦！",
    path: '/pages/vote/vote?share=1&team=' + teamid
  }
};