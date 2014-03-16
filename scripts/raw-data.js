var rawData = {
  getButton: function (type, uri) {
    var button = $('<button class="btn btn-default btn-xs"><i class="icon-code"></i> Raw data</button>')
    .click(function () {
      rawData.show(uri, window[camelCase(type)].graph, window[camelCase(type)].label, window[camelCase(type)].icon);
    });

    return button;
  },
  show: function (uri, graph, title, icon) {
    var id = 'raw-data-' + uri.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    var tableWrapper = $('<div></div>').append('<i class="icon-refresh icon-spin" style="margin-bottom: 20px;"></i>');

    var table = $('<table>').addClass('table table-bordered table-condensed');

    sparql.selectAll({
      columns: ['?p', '?o', 'lang(?o) as ?lang'],
      from: graph,
      where: [
        '<' + uri + '> ?p ?o',
      ]
    }, function (data) {
      if (!data || !('length' in data) || data.length == 0) {
        tableWrapper.empty().append('<div class="alert alert-warning">Nothing found!</div>');

        return;
      }

      tableWrapper.empty().append(table);

      table.wrap('<div class="table-responsive"></div>');

      table.append(
        $.map(data, function (row) {
          var content = [];

          content.push(row.o);

          return $('<tr>')
          .append($('<th>').append(getLastSegmentOfURI(row.p) + (row.lang ? ' (' + row.lang + ')' : ''))).attr('title', row.p)
          .append($('<td>').append(content));
        })
      );
    });

    var contents = $('<div>')
    .css({
      whiteSpace: 'nowrap',
      overflowX: 'auto',
      fontSize: 12
    })
    .append('URI: ')
    .append('<code>' + uri + '</code>')
    .append('<br>')
    .append('<br>')
    .append('Graph: ')
    .append('<code>' + graph + '</code>')
    .append('<br>')
    .append('<br>')
    .append(tableWrapper)
    .append('<a href="http://130.240.234.101:8890/sparql?query=' + encodeURIComponent('CONSTRUCT { <' + uri + '> ?p ?o } WHERE { GRAPH <' + graph + '> { <' + uri + '> ?p ?o } }') + '&format=application%2Frdf%2Bxml&timeout=0&debug=on" class="btn btn-default btn-primary btn-xs"><i class="icon-download-alt"></i> Download RDF</a>');


    tab.add($('.raw-data-container'), '<i class="icon-' + icon + '"></i>', title, contents, id);
  }
};