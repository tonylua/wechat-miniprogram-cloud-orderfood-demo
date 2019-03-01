const cloud = require('wx-server-sdk')
cloud.init()

const db = cloud.database();

// 收集用户的 formId
// https://developers.weixin.qq.com/community/develop/doc/0006842b410678e5b92866d2254c00?highline=41028
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  const { openid, formId } = event;

  const coll = db.collection('formids');

  // 清楚已存在的
  await coll.where({openid}).remove();
  
  const result = await coll.add({
    data: {
      openid,
      formId
    }
  });

  return {
    id: result._id
  }
}