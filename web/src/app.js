import 'simple-line-icons/scss/simple-line-icons.scss';
import './layout.scss';
import $ from 'jquery';
import Navigo from 'navigo';
import Locale from './locale';
import API from './api';
import Wallet from './wallet';
import Asset from './asset';
import Account from './account';

const PartialLoading = require('./loading.html');
const Error404 = require('./404.html');
const router = new Navigo(WEB_ROOT);
const api = new API(router);
const account = new Account(router, api);
const OfflinePlugin = require('offline-plugin/runtime');

window.i18n = new Locale('zh');

router.replace = function(url) {
  this.resolve(url);
  this.pause(true);
  this.navigate(url);
  this.pause(false);
};

router.hooks({
  before: function(done, params) {
    document.title = window.i18n.t('appName');
    $('body').attr('class', 'loading layout');
    $('#layout-container').html(PartialLoading());
    done(true);
  },
  after: function(params) {
    router.updatePageLinks();
  }
});

OfflinePlugin.install({
  onInstalled: function() { },

  onUpdating: function() { },

  onUpdateReady: function() {
    OfflinePlugin.applyUpdate();
  },
  
  onUpdated: function() { }
});

router.on({
  '/': function () {
    if (api.account.loggedIn()) {
      new Asset(router, api).assets();
    } else {
      new Wallet(router, api).newWallet();
    }
  },
  '/account/export': function () {
    account.exportWallet();
  },
  '/account/import': function () {
    account.importWallet();
  },
  '/account/:id/deposit': function (params) {
    new Asset(router, api).asset(params['id'], 'DEPOSIT');
  },
  '/account/:id/withdrawal': function (params) {
    new Asset(router, api).asset(params['id'], 'WITHDRAWAL');
  },
  '/account': function () {
    if (api.account.loggedIn()) {
      new Asset(router, api).assets();
    } else {
      new Wallet(router, api).newWallet();
    }
  }
}).notFound(function () {
  $('#layout-container').html(Error404());
  $('body').attr('class', 'error layout');
  router.updatePageLinks();
}).resolve();