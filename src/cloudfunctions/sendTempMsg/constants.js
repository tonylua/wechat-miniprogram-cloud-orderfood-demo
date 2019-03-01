const APPID = 'wx68959868c4ea4bcb';
const { APPSECRET } = require('./_secret');

exports.ACCESS_TOKEN_URL = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${APPID}&secret=${APPSECRET}`;
exports.TEMPLATE_ID = 'qBDXKiJvge0wFZ7ZAPkCZmpNiS2w1t9DqBwYURQYmF0';
exports.getTempMsgURL = (access_token) => `https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send?access_token=${access_token}`;
