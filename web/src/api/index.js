import $ from 'jquery';
import Noty from 'noty';
import forge from 'node-forge';
import moment from 'moment';
import KJUR from 'jsrsasign';
import uuid from 'uuid/v4';
import Mixin from './mixin.js';
import Account from './account.js';
import Asset from './asset.js';

function API(router) {
  this.router = router;
  this.mixin = new Mixin(this);
  this.account = new Account(this);
  this.asset = new Asset(this);
  this.Error404 = require('../404.html');
  this.ErrorGeneral = require('../error.html');
}

API.prototype = {

  getAuthenticationToken: function (uid, sid, privateKey, method, uri, body) {
    if (typeof body !== 'string') { body = ""; }

    let expire = moment.utc().add(1, 'minutes').unix();
    let md = forge.md.sha256.create();
    md.update(method + uri + body);

    var oHeader = {alg: 'RS512', typ: 'JWT'};
    var oPayload = {
      uid: uid,
      sid: sid,
      exp: expire,
      jti: uuid(),
      sig: md.digest().toHex()
    };
    var sHeader = JSON.stringify(oHeader);
    var sPayload = JSON.stringify(oPayload);
    return KJUR.jws.JWS.sign('RS512', sHeader, sPayload, privateKey);
  },

  request: function (method, path, params, callback) {
    var body = JSON.stringify(params);
    var url = 'https://api.mixin.one' + path;
    var token = '';
    if ('/users' === path) {
      token = this.getAuthenticationToken(APP_CLIENT_ID, APP_SESSION_ID, APP_PRIVATE_KEY, method, path, body);
    } else {
      token = this.getAuthenticationToken(this.account.userId(), this.account.sessionId(), this.account.privateKey(), method, path, body);
    }
    return this.send(token, method, url, body, callback);
  },

  send: function (token, method, url, body, callback) {
    const self = this;
    $.ajax({
      type: method,
      url: url,
      contentType: "application/json",
      data: body,
      beforeSend: function(xhr) {
        xhr.setRequestHeader("Authorization", "Bearer " + token);
      },
      success: function(resp) {
        var consumed = false;
        if (typeof callback === 'function') {
          consumed = callback(resp);
        }
        if (!consumed && resp.error !== null && resp.error !== undefined) {
          self.error(resp);
        }
      },
      error: function(event) {
        self.error(event.responseJSON, callback);
      }
    });
  }, 

  error: function(resp, callback) {
    if (resp == null || resp == undefined || resp.error === null || resp.error === undefined) {
      resp = {error: { code: 0, description: 'unknown error' }};
    }

    var consumed = false;
    if (typeof callback === 'function') {
      consumed = callback(resp);
    }
    if (!consumed) {
      switch (resp.error.code) {
        case 404:
          $('#layout-container').html(this.Error404());
          $('body').attr('class', 'error layout');
          this.router.updatePageLinks();
          break;
        default:
          if ($('#layout-container > .spinner-container').length === 1) {
            $('#layout-container').html(this.ErrorGeneral());
            $('body').attr('class', 'error layout');
            this.router.updatePageLinks();
          }
          this.notify('error', i18n.t('general.errors.' + resp.error.code));
          break;
      }
    }
  },

  notify: function(type, text) {
    new Noty({
      type: type,
      layout: 'top',
      theme: 'nest',
      text: text,
      timeout: 3000,
      progressBar: false,
      queue: 'api',
      killer: 'api',
      force: true,
      animation: {
        open: 'animated bounceInDown',
        close: 'animated slideOutUp noty'
      }
    }).show();
  }
};

export default API;
