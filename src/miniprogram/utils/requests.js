exports.$login = function() {
  return wx.cloud.callFunction({
    name: 'login',
    data: {}
  })
};

exports.$formTeam = function(data) {
  return wx.cloud.callFunction({
    name: 'formTeam',
    data
  })
};

exports.$getTeams = function(data) {
  return wx.cloud.callFunction({
    name: 'getTeams',
    data
  })
};

exports.$vote = function(data) {
  return wx.cloud.callFunction({
    name: 'vote',
    data
  })
};

exports.$reVote = function(data) {
  return wx.cloud.callFunction({
    name: 'reVote',
    data
  })
};

exports.$reUse = function (data) {
  return wx.cloud.callFunction({
    name: 'reUse',
    data
  })
};