var logger = {
  instance: $('#sparql-log'),
  log: function (query, response) {
    if (query.indexOf('(count(') != -1 && query.indexOf(') as ?count)') != -1) {
      //return;
    }

    var link = $('<a>').attr('href', '#');

    link.data('moment', moment());
    link.data('query', query);
    link.data('response', response);
    link.html('SELECT ' + query.match(/SELECT ([^\n]+)\n/)[1] + '<br>&nbsp;&nbsp;FROM ' + query.match(/FROM <([^>]+)>/)[1] + ' (' + response.length + ' results)');
    link.attr('data-toggle', 'tooltip');

    $('<li>').append(link).appendTo(logger.instance);

    logger.updateLabels();
  },
  updateLabels: function () {
    logger.instance.find('a').each(function () {
      var link = $(this);

      var moment = link.data('moment');

      link.tooltip({ placement: 'bottom', title: moment.fromNow() });
    });

    logger.instance.prev('a').children('span').text('SPARQL log (' + logger.instance.children().length + ')');
  }
}

setInterval(logger.updateLabels, 1000 * 10);