const cloud = require('wx-server-sdk')
cloud.init()

const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  const { teamid } = event;

  const coll = db.collection('teams');
  const doc = coll.doc(teamid);

  // 取出原记录
  const result = await doc.get();
  const { data } = result;
  let { options } = data; 

  // 清理 options 字段
  options = options.map(opt => {
    opt.supporters = [];
    return opt;
  });

  // 更新记录
  const result2 = await doc.update({
    data: {
      members: [],
      options
    }
  });
  console.log('reUse update result: ', result2.stats.updated)

  return {
    id: teamid,
    ...result2.data
  }
}