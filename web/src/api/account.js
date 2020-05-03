function Account(api) {
  this.api = api;
}

Account.prototype = {

  cacheUser: function (user, privateKey) {
    window.localStorage.setItem('uid', user.user_id);
    window.localStorage.setItem('sid', user.session_id);
    window.localStorage.setItem('pintoken', user.pin_token);
    window.localStorage.setItem('prvkey', privateKey);
  },

  pinToken: function () {
    return window.localStorage.getItem('pintoken');
  },

  userId: function () {
    return window.localStorage.getItem('uid');
  },

  sessionId: function () {
    return window.localStorage.getItem('sid');
  },

  privateKey: function () {
    return window.localStorage.getItem('prvkey');
  },

  loggedIn: function() {
    if (this.privateKey()) {
      return true
    }
    return false;
  },

  keystore: function() {
    const json = {
      version: "1.0.0",
      client_id: window.localStorage.getItem('uid'),
      session_id: window.localStorage.getItem('sid'),
      pin_token: window.localStorage.getItem('pintoken'),
      session_key: window.localStorage.getItem('prvkey')
    }
    return json
  },

  clear: function (callback) {
    window.localStorage.clear();
    if (typeof callback === 'function') {
      callback();
    }
  }

};

export default Account;
