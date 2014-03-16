var street = {
  label: 'Street',
  icon: 'road',
  id: 'streets',
  prefixes: {
    dc: 'http://purl.org/dc/elements/1.1/',
    foaf: 'http://xmlns.com/foaf/0.1/',
    place: 'http://purl.org/ontology/places#',
    bp: 'http://www.ldb-centrum.se/yeah/SwedishConcepts/20131129/'
  },
  columns: [
    { type: 'place:Path', name: 'street', label: 'street' },
    { type: 'bp:Kvarter', name: 'block', label: 'block' }
  ],
  getButton: function (name, title) {
    var button = $('<button class="btn btn-default btn-xs"><i class="icon-' + street.icon + '"></i> ' + (title ? title : street.getTitle(name)) + '</button>')
    .click(function () {
      var contents = tab.create('#block-container', '<i class="icon-' + street.icon + '"></i>', street.getTitle(name));

      table.create({
        'Blocks': (function (contents) {
          sparql.selectAll({
            prefixes: street.prefixes,
            columns: ['DISTINCT(?blockName)'],
            from: 'http://www.ldb-centrum.se/yeah/Roteman-kvarter/',
            where: [
              '?uri place:Path "' + name + '"',
              '?uri place:ArbitraryRegion ?blockName'
            ],
            orderBy: '?blockName'
          }, function (result) {
            contents.empty();

            contents.append('<div class="alert alert-warning">This data comes from <a href="http://www.ssa.stockholm.se/en/Forskarsal/Search-Tools/Rotemansarkiv/">Roteman archives</a> (1878-1926).</div>');

            _.chain(result).pluck('blockName').each(function (blockName) {
              $('<button class="btn btn-default btn-xs"><i class="icon-search"></i> ' + blockName + '</button>')
              .click(function () {
                $('ul.nav-tabs a[href="#' + block.id + '"]').click();

                $('#' + block.id + ' form')
                .find('select').val('label').end()
                .find('input').val(blockName).end()
                .find('button').click();
              })
              .appendTo(contents);

              contents.append(' ');
            });
          });

          return contents;
        })($('<div>').append('<i class="icon icon-refresh icon-spin"></i>'))
      }).appendTo(contents);
    });

    return button;
  },
  getTitle: function (name) {
    return name ? name : street.label;
  },
  showLoading: function () {
    $('ul.nav-tabs a[href="#' + street.id + '"] i').removeClass('icon-road').addClass('icon-refresh icon-spin');
    $('#' + street.id).css({ opacity: 0.5 });
  },
  clearLoading: function () {
    $('ul.nav-tabs a[href="#' + street.id + '"] i').removeClass('icon-refresh icon-spin').addClass('icon-road');
    $('#' + street.id).css({ opacity: 1 });
  },
  list: function () {
    street.query();
  },
  search: function (text) {
    if (!text) {
      street.list();
      return;
    }
    
    var select = $('#streets select');

    if (select.val() != '*') {
      street.query({
        where: street.whereClause.concat([
          'FILTER(regex(str(' + '?' + select.val() + '), "' + text + '", "i"))'
        ])
      });
    } else {
      street.query({
        where: street.whereClause.concat([
          'FILTER(' + _.map(buildingPermit.columns, function (column) {
            return 'regex(str(' + '?' + column.name + '), "' + text.replace('"', '\\"') + '", "i")';
          }).join(' || ') + ')'
        ])
      });
    }
  },
  query: function (parameters) {
    street.showLoading();

    sparql.select($.extend({
      prefixes: street.prefixes,
      columns: ['DISTINCT(?street)'],
      from: 'http://www.ldb-centrum.se/yeah/Roteman-kvarter/',
      where: street.whereClause,
      orderBy: '?street'
    }, parameters), function (result) {
      function setPage(page) {
        page = +page; // parseInt

        street.showLoading();

        result.page(page, 10, function (rows) {
          street.clearLoading();

          $('#streets-list').empty();
          $('#streets-pager').empty();

          if (rows.length > 0) {
            var elements = _.map(rows, function (row, i) {
              var media = $('<div>').addClass('media');
              var mediaBody = $('<div>').addClass('media-body').appendTo(media);

              mediaBody.append('<h4 class="media-heading">' + street.getTitle(row.street) + '</h4>');
              mediaBody.append(' ');
              street.getButton(row.street).appendTo(mediaBody);
              mediaBody.append(' ');
              shortcuts.generate('street', row.uri, row).appendTo(mediaBody);

              return media;
            });

            $('#streets-list').append(elements);
            $('#streets-pager').append(pager(Math.ceil(result.count / 10), page, setPage));
          } else {
            $('#streets-list').html('<div class="alert alert-info">No results!</div>');
          }
        });
      }

      setPage(parameters ? 1 : 10);
    });
  },
  whereClause: [
    '?uri place:Path ?street',
    '?uri place:ArbitraryRegion ?block',
    'FILTER(!regex(str(?street), "^nodeID"))'
  ],
  //showInfo: function (name) {
  //  var contents = $('<div>');

  //  tab.add('#block-container', '<i class="icon-road"></i>', 'Street "' + name + '"', contents);

  //  contents.append(table.create({
  //    'Blocks': (function () {
  //      var div = $('<div>');

  //      div.append('<i class="icon icon-spin icon-refresh"></i>');

  //      sparql.selectAll({
  //        prefixes: street.prefixes,
  //        columns: ['DISTINCT(?blockName)'],
  //        from: 'http://www.ldb-centrum.se/yeah/Roteman-kvarter/',
  //        where: [
  //          '?uri place:Path "' + name + '"',
  //          '?uri place:ArbitraryRegion ?blockName'
  //        ],
  //        orderBy: '?blockName'
  //      }, function (result) {
  //        div.empty();

  //        div.append($.map(_.pluck(result, 'blockName'), function (blockName) {
  //          return $('<button class="btn btn-default btn-xs"><i class="icon-map-marker"></i> ' + blockName + '</button>').click(function () {
  //            block.showInfo(blockName);
  //          });
  //        }));
  //      });

  //      return div;
  //    })()
  //  }));
  //},
  findByBlockName: function (blockName, callback) {
    sparql.selectAll({
      prefixes: street.prefixes,
      columns: ['?path'],
      from: 'http://www.ldb-centrum.se/yeah/Roteman-kvarter/',
      where: [
        '?s place:Path ?path',
        '?s place:ArbitraryRegion ?region',
        'FILTER(regex(str(?region), "' + blockName.replace('"', '\"') + '", "i"))'
      ]
    }, function (result) {
      callback(unique($.map(result, function (item) {
        if (item.path.indexOf('nodeID') != -1) {
          return;
        }

        return item.path.replace(/[ ,0-9].*/, '');
      })));

      function unique(array) {
        return $.grep(array, function (el, index) {
          return index == $.inArray(el, array);
        });
      }
    });
  }
};

$(function () {
  street.list();
});

$(document).on('click', '#streets form button', function (event) {
  street.search($('#streets form input').val());
  event.preventDefault();
});

$(document).on('submit', '#streets form', function (event) {
  street.search($('#streets form input').val());
  event.preventDefault();
});