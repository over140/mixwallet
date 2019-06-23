import './index.scss';
import $ from 'jquery';

function Store(router) {
  this.router = router;
  this.templateAssets = require('./assets.html');
}

Store.prototype = {

  render: function () {
    const data = require('./bots-zh.json');
    $('body').attr('class', 'bot layout');
    $('#layout-container').html(this.templateAssets({
      data: data,
    }));

    for (var i = 0; i < data.length; i++) {
      const currentIdx = i;
      $('.' + i + '.tab').on('click', function (event) {
        for (var j = 0; j < data.length; j++) {
          if (j !== currentIdx) {
            $('.' + j + '.bots.list').hide();
          }
          $('.' + j + '.tab').removeClass('active');
        }
        $('.' + currentIdx + '.bots.list').show();
        $('.' + currentIdx + '.tab').addClass('active');
        $(window).scrollTop(0);
      });
    }
  }

};

export default Store;
