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

    $('.action.import').on('click', function () {
      window.location.href = '/account/import';
    });

  },

};

export default Wallet;
