function _saveFormIds() {
  const app = getApp();
  const { formIds } = app.globalData;
  console.log('_saveFormIds', formIds);
  if (formIds) {
    app.globalData.formIds = [];
    return wx.cloud.callFunction({
      name: 'saveFormId',
      data: {
        formIds
      }
    });
  }
  return Promise.resolve();
}

function _send(name, data = {}) {
  console.log(name, data);
  return _saveFormIds()
    .then(
      () => wx.cloud.callFunction({
        name,
        data
      })
    );
}

exports.$login = () => _send('login');
exports.$formTeam = (data) => _send('formTeam', data);
exports.$getTeams = (data) => _send('getTeams', data);
exports.$vote = (data) => _send('vote', data);
exports.$reVote = (data) => _send('reVote', data);
exports.$reUse = (data) => _send('reUse', data);