import './index.scss';
import $ from 'jquery';
import Clipboard from 'clipboard';
import FormUtils from '../utils/form.js';

function Account(router, api) {
  this.router = router;
  this.api = api;
  this.templateExport = require('./export.html');
  this.templateImport = require('./import.html');
}

Account.prototype = {
  
  importWallet: function () {
    const self = this;
    $('body').attr('class', 'account layout');
    $('#layout-container').html(self.templateImport());

    $('.import.form').submit(function (event) {
      event.preventDefault();
      var form = $(this);
      var params = FormUtils.serialize(form);

      var pin = params['pin'].trim();
      if (pin.length !== 6) {
        $('.submit-loader', form).hide();
        $(':submit', form).show();
        self.api.notify('error', 'Pin Format Error');
        return;
      }

      var data = JSON.parse(Buffer.from(params['key'].trim(), 'base64').toString())
      data.pin = pin;

      self.api.mixin.importWallet(function (resp) {
        if (resp.error) {
          return;
        }

        window.localStorage.setItem('uid', data.uid);
        window.localStorage.setItem('sid', data.sid);
        window.localStorage.setItem('pintoken', data.pintoken);
        window.localStorage.setItem('prvkey', data.key);
        window.location.href = '/account';
      }, data);
    });
    $('.import.form :submit').click(function (event) {
      event.preventDefault();
      var form = $(this).parents('form');
      $('.submit-loader', form).show();
      $(this).hide();
      form.submit();
    });
  }, 

  exportWallet: function () {
    const self = this;
    const base64 = Buffer.from(JSON.stringify({
      key: self.api.account.privateKey(),
      uid: self.api.account.userId(),
      pintoken: self.api.account.pinToken(),
      sid: self.api.account.sessionId()
    })).toString('base64');

    $('body').attr('class', 'account layout');
    $('#layout-container').html(self.templateExport({
      privateKey: base64,
    }));

    var clipboard = new Clipboard('.copy', {
      text: function() {
        return base64;
      }
    });
    clipboard.on('success', function(e) {
      self.api.notify('success', i18n.t('wallet.export.success'));
    });
  },

};

export default Account;
