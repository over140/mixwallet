import './index.scss';
import $ from 'jquery';
import KJUR from 'jsrsasign';

function Wallet(router, api) {
  this.router = router;
  this.api = api;
  this.templateIndex = require('./index.html');
}

Wallet.prototype = {
  newWallet: function () {
    const self = this;
    
    $('#layout-container').html(self.templateIndex());
    $('body').attr('class', 'wallet layout');

    $('.action.create').on('click', function () {
      const pin = $('[name="pin"]').val();

      if (pin.length !== 6) {
        self.api.notify('error', i18n.t('wallet.errors.pin'));
        return;
      }
 
      var keyPair = KJUR.KEYUTIL.generateKeypair("RSA", 1024);
      keyPair.prvKeyObj.isPrivate = true;
      var privateKey = KJUR.KEYUTIL.getPEM(keyPair.prvKeyObj, "PKCS1PRV");
      var publicKey = KJUR.KEYUTIL.getPEM(keyPair.pubKeyObj);
    
      self.api.mixin.createUser(function(resp) {
        if (resp.error) {
          return;
        }
        window.location.href = '/account';
      }, privateKey, publicKey, pin);
    });

    $('.file.import').on('change', function () {
      const files = $(this).prop('files');
      if (files.length !== 1) {
        return;
      }
      var fileReader = new FileReader();
      fileReader.onload = function () {
        const keystore = JSON.parse(fileReader.result);
        if (keystore) {
          window.localStorage.setItem('uid', keystore.client_id);
          window.localStorage.setItem('sid', keystore.session_id);
          window.localStorage.setItem('pintoken', keystore.pin_token);
          window.localStorage.setItem('prvkey', keystore.session_key);
          window.location.href = '/account';
        }
      };
      fileReader.readAsText(files[0], 'utf-8');
    });

    $('.action.import').on('click', function () {
      $('.file.import').click()
    });

  },

};

export default Wallet;
