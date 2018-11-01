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

      if (resp.data.public_key !== '') {
        $('.address.deposit.container').show();
        new QRious({
          element: $('.deposit.address.code.container canvas')[0],
          value: resp.data.public_key,
          size: 500
        });
      } else if (resp.data.account_name !== '') {
        $('.account.deposit.container').show();
        new QRious({
          element: $('.deposit.account.name.code.container canvas')[0],
          value: resp.data.account_name,
          size: 500
        });
        new QRious({
          element: $('.deposit.account.tag.code.container canvas')[0],
          value: resp.data.account_tag,
          size: 500
        });
      }
    }, id);
  },

  handleWithdrawal: function (me, asset) {
    const self = this;

    if (asset.public_key !== '') {
      $('.address.withdrawal.container').show();
    } else if (asset.account_name !== '') {
      $('.account.withdrawal.container').show();
    }

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
