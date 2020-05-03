import './index.scss';
import $ from 'jquery';
import uuid from 'uuid/v4';
import QRious from 'qrious';
import FormUtils from '../utils/form.js';

function Asset(router, api) {
  this.router = router;
  this.api = api;
  this.templateAssets = require('./assets.html');
  this.templateAsset = require('./asset.html');
}

Asset.prototype = {
  
  assets: function () {
    const self = this;
    const preset = self.api.asset.preset();
    self.api.mixin.assets(function (resp) {
      if (resp.error) {
        return;
      }

      var filter = {};
      for (var i = 0; i < resp.data.length; i++) {
        var a = resp.data[i];
        filter[a.asset_id] = true;
        a.depositEnabled = true;
      }

      for (var i = 0; i < preset.length; i++) {
        if (filter[preset[i].asset_id]) {
          continue;
        }
        preset[i].price_usd = '0';
        preset[i].balance = '0';
        preset[i].depositEnabled = true;
        resp.data.push(preset[i]);
      }

      for (var i = 0; i < resp.data.length; i++) {
        resp.data[i].chain_icon_url = self.api.asset.getById(resp.data[i].chain_id).icon_url;
      }
      
      if (resp.data.length != preset.length) {
        resp.data.sort(function (a, b) {
          var at = parseFloat(a.price_usd) * parseFloat(a.balance);
          var bt = parseFloat(b.price_usd) * parseFloat(b.balance);
          if (at > bt) {
            return -1;
          }
          if (at < bt) {
            return 1;
          }
  
          if (a.symbol < b.symbol) {
            return -1;
          }
          if (a.symbol > b.symbol) {
            return 1;
          }
          return 0;
        });
      }

      $('body').attr('class', 'account layout');
      $('#layout-container').html(self.templateAssets({
        assets: resp.data,
      }));

      self.router.updatePageLinks();
    });
  },

  assetDo: function (id, action, me) {
    const self = this;
    self.api.mixin.asset(function (resp) {
      if (resp.error) {
        return;
      }
      resp.data.me = me;
      resp.data.trace_id = uuid().toLowerCase();

      const chainId = resp.data.chain_id
      const confirmations = i18n.t('deposit.confirmations', { confirmations: resp.data.confirmations })
      if (chainId === 'c6d0c728-2624-429b-8e0d-d9d19b6592fa') {
        resp.data.tips = i18n.t('deposit.support_btc') + confirmations
      } else if (chainId === '6cfe566e-4aad-470b-8c9a-2fd35b49c68d') {
        resp.data.tips = i18n.t('deposit.support_eos') + confirmations
      } else if (chainId === '43d61dcd-e413-450d-80b8-101d5e903357') {
        resp.data.tips = i18n.t('deposit.support_eth') + confirmations
      } else if (chainId === '25dabac5-056a-48ff-b9f9-f67395dc407c') {
        resp.data.tips = i18n.t('deposit.support_trx') + confirmations
      } else {
        resp.data.tips = i18n.t('deposit.support_other', { symbol: resp.data.symbol }) + confirmations
      }
      resp.data.memoLabel = chainId === '23dfb5a5-5d7b-48b6-905f-3970e3176e27' ? i18n.t('deposit.tag') : i18n.t('deposit.memo')
      
      $('body').attr('class', 'account layout');
      $('#layout-container').html(self.templateAsset(resp.data));
      self.router.updatePageLinks();
      $('.tab').removeClass('active');
      $('.tab.' + action.toLowerCase()).addClass('active');
      $('.action.container').hide();
      $('.action.container.' + action.toLowerCase()).show();

      if (action === 'WITHDRAWAL') {
        return self.handleWithdrawal(me, resp.data);
      }

      $('.deposit.container').show();
      new QRious({
        element: $('.deposit.destination.code.container canvas')[0],
        value: resp.data.destination,
        size: 500
      });

      if (resp.data.tag !== '') {
        new QRious({
          element: $('.deposit.tag.code.container canvas')[0],
          value: resp.data.tag,
          size: 500
        });
      }
    }, id);
  },

  handleWithdrawal: function (me, asset) {
    const self = this;

    $('.withdrawal.form').submit(function (event) {
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

      self.api.mixin.withdrawal(function (resp) {
        $('.submit-loader', form).hide();
        $(':submit', form).show();

        if (resp.error) {
          return;
        }

        $('.withdrawal.form input[name="pin"]').val('');
        $('.withdrawal.form input[name="memo"]').val('');
        $('.withdrawal.form input[name="amount"]').val('');
        $('.withdrawal.form input[name="trace_id"]').val(uuid().toLowerCase());

        self.api.notify('success', i18n.t('withdrawal.success'));
      }, asset, params);
    });
    $('.withdrawal.form :submit').click(function (event) {
      event.preventDefault();
      var form = $(this).parents('form');
      $('.submit-loader', form).show();
      $(this).hide();
      form.submit();
    });
  },

  asset: function (id, action) {
    const self = this;
    if (action === "DEPOSIT") {
      return self.assetDo(id, action);
    }
    self.api.mixin.info(function (resp) {
      if (resp.error) {
        return;
      }
      return self.assetDo(id, action, resp.data);
    });
  }

};

export default Asset;
