const fetch = require('node-fetch');

const cloud = require('wx-server-sdk')
cloud.init()

const APPID = 'wx68959868c4ea4bcb';
const { APPSECRET } = require('./_secret');

const ACCESS_TOKEN_URL = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${APPID}&secret=${APPSECRET}`;
const TEMPLATE_ID = 'qBDXKiJvge0wFZ7ZAPkCZmpNiS2w1t9DqBwYURQYmF0';
const getTempMsgURL = (access_token) => `https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send?access_token=${access_token}`;

const db = cloud.database();

// 下发模版消息
const sendTempMsg = async (access_token, targets, form_id, team_id, options) => {
  const url = getTempMsgURL(access_token);

  const params = {
    access_token,
    template_id: TEMPLATE_ID,
    page: '/pages/result/result?team=' + team_id,
    form_id,
    data: {
      // 商品名称
      keyword1: {
        value: options[0].key
      },
      // 订单状态
      keyword2: {
        value: '投票结果已更新'
      },
      // 已参加人数
      keyword3: {
        value: targets.length
      }
    }
    // emphasis_keyword: null
  };
  console.log('send temp msg =1=>', params);

  const results = Promise.all(
    targets.map(user => fetch(url, {
      method: 'POST',
      body: {
        touser: user,
        ...params
      }
    }))
  );
  return results;
};

// 从接口请求 access_token
const getAccessToken = async () => {
  const res = await fetch(ACCESS_TOKEN_URL);
  const json = await res.json();
  // const { errcode, errmsg, access_token, expires_in } = atJson;
  return json;
};

// 向空的数据库中插入 access_token 记录
const insertAccessTokenToEmpty = async (accessTokenJson) => {
  const { 
    errcode, errmsg, 
    access_token, expires_in
  } = accessTokenJson;
  const coll = db.collection('config');
  const result = await coll.add({
    data: {
      access_token_obj: {
        value: access_token,
        expires: Date.now() + expires_in * 1000
      }
    }
  });
  return result._id;
};

// 更新数据库中 access_token 记录
const updateAccessToken = async (_id, accessTokenJson) => {
  const coll = db.collection('config');
  const result = await coll.doc(_id).remove();
  const newId = await insertAccessTokenToEmpty(accessTokenJson);
  return newId; 
};

// 取出数据库中第一条记录
const getFirstResult = async () => {
  const coll = db.collection('config');
  const result = await coll.get();
  return result.data[0];
}

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  const {
    friends, formId, teamid, options
  } = event;

  const coll = db.collection('config');
  const countResult = await coll.count();
  console.log("[sendTempMsg]_1", countResult);
  if (countResult.total) { // 已经有过配置
    const result = await getFirstResult();
    const { _id, access_token_obj } = result;
    const { value, expires } = access_token_obj;
    console.log("[sendTempMsg]_2", result);
    // 未过期
    if (typeof expires === 'number'
      && expires - Date.now() > 10) {
      await sendTempMsg(
        value,
        friends, formId, teamid, options
      );
      console.log("[sendTempMsg]_3", value);
    }
    // 已过期
    else {
      const accessTokenJson = await getAccessToken();
      console.log("[sendTempMsg]_4", accessTokenJson);
      await updateAccessToken(_id, accessTokenJson);
      console.log("[sendTempMsg]_5", _id);
      await sendTempMsg(
        accessTokenJson.access_token,
        friends, formId, teamid, options
      );
      console.log("[sendTempMsg]_6", _id);
    }
  } else { // 尚未配置过
    const accessTokenJson = await getAccessToken();
    console.log("[sendTempMsg]_7", accessTokenJson);
    await insertAccessTokenToEmpty(accessTokenJson);
    console.log("[sendTempMsg]_8", accessTokenJson);
    await sendTempMsg(
      accessTokenJson.access_token,
      friends, formId, teamid, options
    );
    console.log("[sendTempMsg]_9", accessTokenJson);
  }

  return {
    event,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  }
}