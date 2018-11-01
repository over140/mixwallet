function Asset(api) {
  this.api = api;
}

Asset.prototype = {
  preset: function () {
    return require('./assets.json');
  },

  getById: function (id) {
    var assets = this.preset();
    for (var i = 0; i < assets.length; i++) {
      if (assets[i].asset_id === id) {
        return assets[i];
      }
    }
    return undefined;
  },

  getBySym: function (sym) {
    var assets = this.preset();
    for (var i = 0; i < assets.length; i++) {
      if (assets[i].symbol === sym) {
        return assets[i];
      }
    }
    return undefined;
  }
};

export default Asset;
