const app = getApp();

Component({
  
  properties: {

  },

  data: {

  },

  methods: {
    onSubmit(e) {
      const { formId } = e.detail;

      // 便于外部监听，可选
      this.triggerEvent('formid', { formId });

      // 放入全局变量，等待下一次请求时送出
      this._saveFormIdToGlobal(formId);
    },

    _saveFormIdToGlobal(id) {
      const obj = {
        formId: id,
        expire: Date.now() + 1000 * 3600 * 24 * 7
      };
      if (Array.isArray(app.globalData.formIds)) {
        app.globalData.formIds.push(obj);
      } else {
        app.globalData.formIds = [obj];
      }
      // console.log(app.globalData.formIds)
    }
  }
})
