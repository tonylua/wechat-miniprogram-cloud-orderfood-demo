const cloud = require('wx-server-sdk')
cloud.init()

// 创建一个包含了备选餐厅的队伍
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const db = cloud.database();

  const { options } = event;

  const coll = db.collection('teams');
  const data = {
    initiator: wxContext.OPENID, // 创建者
    timestamp: Date.now(),
    options: options.map(opt => ({
      key: opt,
      supporters: [] // 该项的支持者，是 members 列表的子集
    })),
    members: [] // 队伍的成员的 openid 
  };
  const result = await coll.add({
    data
  });

  return {
    id: result._id,
    ...data
  }
}
