const cloud = require('wx-server-sdk');
cloud.init();

// 取得已创建队伍的列表
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const db = cloud.database();

  const { 
    teamid, // 某一具体队伍的 _id
    initiator // 某一创建者的 openid，目前冗余
  } = event;

  const coll = db.collection('teams');
  const result = teamid
    ? await coll.doc(teamid).get() // 某一条记录
    : initiator
      ? await coll.where({ openid: initiator }).get() // 所有记录，目前冗余
      : [];

  const { data } = result;

  return {
    teams: [].concat(data),
    openid: wxContext.OPENID // 当前调用的用户
  }
}