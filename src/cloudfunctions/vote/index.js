const cloud = require('wx-server-sdk');
cloud.init();

const db = cloud.database();

// 处理选择商家的动作
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();

  const { 
    teamid,
    checkedOptionIndex,
    avatarUrl,
    formId
  } = event;

  console.log('vote: ', teamid, checkedOptionIndex, event.avatarUrl);

  const supporter = wxContext.OPENID;
  const teamsColl = db.collection('teams');
  const teamsDoc = teamsColl.doc(teamid);

  // 取出原记录
  const teamsResult = await teamsDoc.get();
  const team = teamsResult.data;

  team.members.push(supporter);
  team.options[checkedOptionIndex].supporters.push({
    openid: supporter,
    avatarUrl
  });

  let { options } = team;
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
  const teamsUpdate = await teamsDoc.update({
    data: {
      members: team.members,
      options // 排好序的
    }
  });
  console.log('vote update result: ', teamsUpdate.stats.updated);

  const friends = team.members.slice().filter(
    m => m !== supporter // 不给操作者本人发消息了
  );

  // 发消息通知队友
  if (friends.length) {
    const stm = await cloud.callFunction({
      name: 'sendTempMsg',
      data: {
        targets: friends,
        // targets: team.members,
        teamid,
        options
      }
    });
    console.log('vote callFunction success', stm, friends);
  } else {
    console.log('no friends, not send msg');
  }

  return {
    ...team,
    updated: teamsUpdate.stats.updated
  }
}