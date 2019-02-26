const cloud = require('wx-server-sdk')
cloud.init()

const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();

  const { teamid } = event;
  const revoter = wxContext.OPENID;

  const coll = db.collection('teams');
  const doc = coll.doc(teamid);

  // 取出原记录
  const result = await doc.get();
  const { data } = result;
  let { members, options } = data;  

  // 清理 members 字段
  for (let i = members.length - 1; i >= 0; i--) {
    if (members[i] === revoter) {
      members.splice(i, 1);
    }
  }

  // 清理 options 字段
  options = options.map(opt => {
    const { supporters } = opt;
    for (let j = supporters.length - 1; j >= 0; j--) {
      if (supporters[j].openid === revoter) {
        supporters.splice(j, 1);
      }
    }
    opt.supporters = supporters;
    return opt;
  });

  // 更新记录
  const result2 = await doc.update({
    data: {
      members,
      options
    }
  });
  console.log('reVote update result: ', result2.stats.updated)

  return {
    ...result2.data
  }
}