// miniprogram/pages/formTeam/formTeam.js
// 添加餐厅
const { $formTeam, $reUse } = require('../../utils/requests');

const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    MAX: 5,
    openid: null,
    options: [], // 录入的可选餐厅 [{name, _insertId}, ...]
    insertingValue: '', // 用于清空
    btnDisabled: false,
    lastTeam: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad (query) {
    const { openid } = query;
    this.setData({
      openid
    });
    console.log("进入组队页面， openid: %s", openid);

    try {
      const lastTeam = wx.getStorageSync('teamid');
      if (lastTeam) {
        this.setData({
          lastTeam: JSON.parse(lastTeam)
        });
      }
    } catch(ex) {
      console.log(ex)
    }
  },

  // 插入新的餐馆
  onItemInsert(e) {
    const itemname = e.detail.value.itemname.trim();
    if (!itemname) return;
    const notExist = this.data.options
      && this.data.options.every(opt => opt.name !== itemname);
    if (!notExist) {
      wx.showToast({
        title: '餐厅已存在，请重新输入',
        icon: 'none',
        duration: 2000
      })
      return;
    };
    this.setData({
      [`options[${this.data.options.length}]`]: {
        name: itemname
          .replace(/\,/g, ''),
        _insertId: itemname.toString()
          .padEnd(5, '#').substr(0, 5) + Date.now()
      },
      insertingValue: ''
    })
  },

  // 删除已插入的餐厅
  onItemRemove(e) {
    const { id } = e.target.dataset;
    let { options } = this.data;
    for (let i = 0; i < options.length; i++) {
      if (options[i]._insertId === id) {
        options.splice(i, 1);
        break;
      };
    }
    this.setData({
      options
    });
  },

  // 确定组队
  onFormTeamSubmit() {
    const { options } = this.data;

    if (options.length < 2) {
      const title = !options.length
        ? '还没有录入餐厅哦！'
        : '至少录入两家餐厅吧！';
      wx.showToast({
        title,
        icon: 'none',
        duration: 5000
      });
      return;
    }

    this.setData({
      btnDisabled: true
    })
    
    $formTeam({
      options: options.map(opt => opt.name)
    }).then(res => {
      const { id, options } = res.result;
      console.log(res);
      // 存在本地，便于下次复用
      wx.setStorageSync('teamid', JSON.stringify({
        id,
        options
      }));

      wx.showToast({
        title: '录入成功！',
        icon: 'success',
        duration: 1500,
        complete() {
          setTimeout(() => {
            wx.navigateTo({
              url: '/pages/vote/vote?team=' + id,
            })
          }, 2000);
        }
      });
    }).catch(err => {
      wx.showToast({
        title: '提交失败' + err.errCode, //`${err.errMsg} (${err.errCode})`,
        icon: 'none',
        duration: 5000
      });
      this.setData({
        btnDisabled: false
      })
    });
  },

  // 重新启用上次的队伍
  onUseLastTeam() {
    const { id } = this.data.lastTeam;
    $reUse({
      teamid: id
    }).then(res => {
      wx.navigateTo({
        url: '/pages/vote/vote?team=' + id,
      })
    })
  }
})