const cloud = require('wx-server-sdk');

const {
  getFirstResult,
  updateAccessToken,
  insertAccessTokenToEmpty,
  getAccessToken,
  sendTempMsg
} = require('./utils');

cloud.init();

const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  const {
    targets,
    teamid,
    options
  } = event;

  const coll = db.collection('config');
  const countResult = await coll.count();
  // console.log("[sendTempMsg]_1", countResult);

  let access_token;

  if (countResult.total) { // 已经有过配置
    const result = await getFirstResult();
    const { _id, access_token_obj } = result;
    const { value, expires } = access_token_obj;
    // console.log("[sendTempMsg]_2", result);
    // 未过期
    if (typeof expires === 'number'
      && expires - Date.now() > 10) {
      access_token = value;
      // console.log("[sendTempMsg]_3", value);
    }
    // 已过期
    else {
      const accessTokenJson = await getAccessToken();
      // console.log("[sendTempMsg]_4", accessTokenJson);
      await updateAccessToken(_id, accessTokenJson);
      // console.log("[sendTempMsg]_5", _id);
      access_token = accessTokenJson.access_token;
      // console.log("[sendTempMsg]_6", access_token);
    }
  } else { // 尚未配置过
    const accessTokenJson = await getAccessToken();
    // console.log("[sendTempMsg]_7", accessTokenJson);
    await insertAccessTokenToEmpty(accessTokenJson);
    // console.log("[sendTempMsg]_8", accessTokenJson);
    access_token = accessTokenJson.access_token;
    // console.log("[sendTempMsg]_9", access_token);
  }

  const send_result = await sendTempMsg(
    access_token,
    targets,
    teamid, 
    options
  );
  // console.log("[sendTempMsg]_10", send_result);

  return {
    access_token,
    send_result
  }
}