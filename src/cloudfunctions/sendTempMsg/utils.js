const fetch = require('node-fetch');
const cloud = require('wx-server-sdk');

const {
  ACCESS_TOKEN_URL,
  TEMPLATE_ID,
  getTempMsgURL
} = require('./constants');

cloud.init();
const db = cloud.database();

// 下发模版消息
exports.sendTempMsg = async (
    access_token, targets, team_id, options
  ) => {
  const url = getTempMsgURL(access_token);

  const params = {
    access_token,
    template_id: TEMPLATE_ID,
    page: '/pages/result/result?team=' + team_id,
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
  console.log('send temp msg =1=>', params, targets);

  const results = Promise.all(
    targets.map(async (user) => {
      const form_id = await getFromId(user);
      if (!form_id) 
        return Promise.resolve(null);
      //   return Promise.reject('no formId for ' + user);
      console.log('openid/formId', user, form_id);
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store'
        },
        body: JSON.stringify({
          touser: user,
          form_id,
          ...params
        })
      });
      const json = await res.json();
      return json;
    }) // end of map
  );
  return results;
};

// 从接口请求 access_token
exports.getAccessToken = async () => {
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
exports.insertAccessTokenToEmpty = insertAccessTokenToEmpty;

// 更新数据库中 access_token 记录
exports.updateAccessToken = async (_id, accessTokenJson) => {
  const coll = db.collection('config');
  const result = await coll.doc(_id).remove();
  const newId = await insertAccessTokenToEmpty(accessTokenJson);
  return newId;
};

// 取出数据库中第一条记录
exports.getFirstResult = async () => {
  const coll = db.collection('config');
  const result = await coll.get();
  return result.data[0];
};

// 取得用户对应的 formId
const getFromId = async (openid) => {
  const coll = db.collection('formids');
  const query = coll.where({ openid });
  const countResult = await query.count();
  if (!countResult.total) return null;
  const results = await query.get();
  const { _id, formIds } = results.data[0];
  if (!Array.isArray(formIds)) return null;
  let availables = formIds.filter(
    (item) => item && item.expire && (item.expire > Date.now())
  );
  if (!availables.length) return null;
  const { formId } = availables.shift();
  await coll.where({ openid }).update({
    data: {
      openid,
      formIds: availables
    }
  });
  return formId;
};
