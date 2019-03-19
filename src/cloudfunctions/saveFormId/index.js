const cloud = require('wx-server-sdk')
cloud.init()

const db = cloud.database();

// 收集用户的 formId
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  const { formIds } = event;

  const coll = db.collection('formids');

  // 取出已有的
  const existQuery = coll.where({ openid });
  const existCount = await existQuery.count();
  let exists = [];
  if (existCount.total) {
    const existResult = await existQuery.get();
    exists = existResult.data[0].formIds;
  }

  // 加入新的并清除过期的，按到期时间排序
  const lastests = [].concat(exists, formIds)
    .filter((item) => item && item.expire && (item.expire > Date.now()))
    .sort((a, b) => a.expire - b.expire);

  // 删除旧的
  await coll.where({ openid }).remove();
  
  // 录入 
  const result = await coll.add({
    data: {
      openid,
      formIds: lastests
    }
  });

  return {
    id: result._id
  }
}