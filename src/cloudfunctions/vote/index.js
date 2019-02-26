const cloud = require('wx-server-sdk');
cloud.init();

const db = cloud.database();
const _ = db.command;

// 处理选择商家的动作
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();

  const { 
    teamid,
    checkedOptionIndex,
    avatarUrl
  } = event;

  console.log('vote: ', teamid, checkedOptionIndex, event.avatarUrl);

  const supporter = wxContext.OPENID;
  const coll = db.collection('teams');
  const doc = coll.doc(teamid);

  // 取出原记录
  const result = await doc.get();
  const { data } = result;

  if (!~data.members.indexOf(supporter)) { // 已投票的跳过
    data.members.push(supporter);
    data.options[checkedOptionIndex].supporters.push({
      openid: supporter,
      avatarUrl
    });

    let { options } = data;
    // 排序
    options.sort((a, b) => {
      return b.supporters.length - a.supporters.length;
    });
    // 筛选第一名及检查是否有同票
    let sameVotes = options.filter(
      opt => (opt.supporters.length === options[0].supporters.length)
    );
    if (sameVotes.length > 1) {
      sameVotes.sort(() => (Math.random() > .5 ? 1 : -1));
      options = sameVotes.concat(
        options.slice(sameVotes.length)
      );
    }

    // 更新记录
    const result2 = await doc.update({
      data: {
        members: data.members,
        options // 排好序的
      }
    });
    console.log('vote update result: ', result2.stats.updated)
  }

  return {
    ...data
  }
}