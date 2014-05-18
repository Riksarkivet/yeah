var buildingPermit = {
  label: 'Building permit',
  icon: 'building',
  id: 'permits',
  prefixes: {
    dc: 'http://purl.org/dc/elements/1.1/',
    foaf: 'http://xmlns.com/foaf/0.1/',
    place: 'http://purl.org/ontology/places#',
    bpc: 'http://www.ldb-centrum.se/yeah/SwedishConcepts/20140123/',
    rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#'
  },
  rdfType: 'bpc:Bygglovstyp',
  graph: 'http://www.ldb-centrum.se/yeah/Bygglov20140311/',
  columns: (function () {
    var columns = [
      { type: 'rdf:type', name: 'rdfType' },
      { type: 'dc:description', multiple: true },
      { type: 'dc:medium' },
      { type: 'dc:type' },
      { type: 'place:parish', multiple: true },
      { type: 'bpc:Arkitekt', name: 'arkitekt', blankNodeWithProperty: 'foaf:givenName' },
      { type: 'foaf:depiction', name: 'image' },
      { type: 'dc:date', label: 'year' },
      { type: 'place:Road', name: 'street', label: 'street name' },
      { type: 'dc:format', multiple: true },
      { type: 'bpc:Teknik', name: 'technology' },
      { type: 'bpc:Kvarter', name: 'block' },
      { type: 'bpc:fastighet', label: 'property' },
      { type: 'bpc:KlientNamn', name: 'klientnamn', label: 'client name(s)', blankNodeWithProperty: 'foaf:givenName' },
      { type: 'bpc:ovriganamn', label: 'other name(s)' }
    ];

    _.each(columns, function (column) {
      if (!('name' in column) && typeof column.type != 'object') {
        column.name = column.type.substr(column.type.indexOf(':') + 1);
      }
      if (!('label' in column)) {
        column.label = column.name;
      }
    });

    return columns;
  })(),
  orderBy: 'date',
  getButton: function (uri, data, title) {
    if (!uri) {
      return; // returns undefined
    }

    var button = $('<button class="btn btn-default btn-xs"><i class="icon-' + buildingPermit.icon + '"></i> ' + (title ? title : buildingPermit.getTitle(data)) + '</button>')
    .click(function () {
      var contents = tab.create('#block-container', '<i class="icon-' + buildingPermit.icon + '"></i>', buildingPermit.getTitle(data), 'detail-' + uri.toLowerCase().replace(/[^a-z0-9]+/g, '-'));

      table.create({
        //'Type': getConceptButton(data.rdfType, 'cogs'),
        'Description': data.description,
        'Year': data.year,
        'Block': (function (contents) {
          sparql.getEntity(block, data.block, function (blockData) {
            contents.empty();

            if (blockData) {
              contents.append(block.getButton(data.block, blockData, data.blockTitle));
            } else {
              contents.append('<div class="alert alert-warning">No such block could be found (<code>' + data.block + '</code>)</div>');
            }
          });

          return contents;
        })($('<div>').append('<i class="icon icon-spin icon-refresh"></i>')),
        'Street': data.street ? street.getButton(data.street) : undefined,
        'Parish': parish.doQuery(data.parish),
        'Property info': data.fastighet,
        'Architect': loadingPlaceholder(function (contents) {
          sparql.selectOne({
            prefixes: buildingPermit.prefixes,
            columns: ['?givenName'],
            where: [
              '<' + data.arkitekt + '> foaf:givenName ?givenName'
            ],
            from: buildingPermit.graph
          }, function (row) {
            contents.empty();

            if (row) {
              contents.append($('<button class="btn btn-default btn-xs"><i class="icon-user"></i> ' + row.givenName + '</button>').click(function () {
                showBuildingPermitPerson(data.arkitekt, 'Architect');
              }));
            }
          });
        }),
        'Client': loadingPlaceholder(function (contents) {
          sparql.selectOne({
            prefixes: buildingPermit.prefixes,
            columns: ['?givenName'],
            where: [
              '<' + data.klientnamn + '> foaf:givenName ?givenName'
            ],
            from: buildingPermit.graph
          }, function (row) {
            contents.empty();

            if (row) {
              contents.append($('<button class="btn btn-default btn-xs"><i class="icon-user"></i> ' + row.givenName + '</button>').click(function () {
                showBuildingPermitPerson(data.klientnamn, 'Client');
              }));
            }
          });
        }),
        'Other names': data.ovriganamn,
        'Image': $('<a class="btn btn-default btn-xs" target="_blank"><i class="icon-picture"></i> Link</a>')
        .attr('href', data.image),
        'Technology': data.technology ? getConceptButton(data.technology, 'cogs') : undefined,
        'Medium': data.technology ? getConceptButton(data.medium, 'cogs') : undefined,
        'Format': data.format.join(', '),
        'Type': data.type,
        'Other': [
          shortcuts.generate('building-permit', uri, data),
          ' ',
          rawData.getButton('building-permit', uri)
        ]
      }).appendTo(contents);
    });

    return button;
  },
  getTitle: function (data) {
    if (!data) {
      return buildingPermit.label;
    }

    var title = '';

    if (data.street) {
      title = data.street;
    }

    if (data.blockTitle) {
      if (title != '') {
        title += ', ';
      }

      title += data.blockTitle;
    }

    if (title == '') {
      title = buildingPermit.label;
    }

    if (data.date) {
      if (data.date.charAt(4) == '-' && data.date.charAt(7) == '-') {
        title += ' (' + data.date.substr(0, 4) + ')';
      } else {
        title += ' (' + data.date + ')';
      }
    }

    return title;
  },
  searchFor: function (text, field) {
    $('ul.nav-tabs a[href="#' + buildingPermit.id + '"]').click();

    $('#' + buildingPermit.id + ' form')
    .find('select').val(field).end()
    .find('input').val(text).end()
    .find('button').click();
  },
  showLoading: function () {
    $('ul.nav-tabs a[href="#' + buildingPermit.id + '"] i').removeClass('icon-building').addClass('icon-refresh icon-spin');
    $('#' + buildingPermit.id).css({ opacity: 0.5 });
  },
  clearLoading: function () {
    $('ul.nav-tabs a[href="#' + buildingPermit.id + '"] i').removeClass('icon-refresh icon-spin').addClass('icon-building');
    $('#' + buildingPermit.id).css({ opacity: 1 });
  },
  list: function () {
    buildingPermit.query();
  },
  search: function (text) {
    if (!text) {
      buildingPermit.list();
      return;
    }

    var select = $('#' + buildingPermit.id + ' select');
    var value = select.val();

    if (value != '*') {
      if (value == 'uri') {
        buildingPermit.queryByUri(text);
        return;
      }

      var column = _.find(buildingPermit.columns, function (column) { return column.name == value; });
      var orderByColumn = _.find(buildingPermit.columns, function (column) { return column.name == buildingPermit.orderBy; });

      buildingPermit.query({
        where: [
          '?uri ' + column.type + ' ' + (column.blankNodeWithProperty ? '[' + column.blankNodeWithProperty + ' ' + '?' + column.name + ']' : '?' + column.name),
          'FILTER(regex(str(' + '?' + column.name + '), "' + text.replace('"', '\\"') + '", "i"))'
        ],
        optionalColumns: [
          value != buildingPermit.orderBy ? '?uri ' + orderByColumn.type + ' ' + (orderByColumn.blankNodeWithProperty ? '[' + orderByColumn.blankNodeWithProperty + ' ' + '?' + orderByColumn.name + ']' : '?' + orderByColumn.name) : undefined,
        ]
      });
    } else {
      buildingPermit.query({
        where: ['FILTER(' + _.map(buildingPermit.columns, function (column) {
          return 'regex(str(' + '?' + column.name + '), "' + text.replace('"', '\\"') + '", "i")';
        }).join(' || ') + ')'],
        optionalColumns: $.map(buildingPermit.columns, function (column) {
          return '?uri ' + column.type + ' ' + (column.blankNodeWithProperty ? '[' + column.blankNodeWithProperty + ' ' + '?' + column.name + ']' : '?' + column.name);
        })
      });
    }
  },
  queryByUri: function (uri) {
    sparql.getEntity(buildingPermit, uri, function (entity) {
      buildingPermit.clearLoading();
      $('#' + buildingPermit.id + '-pager').empty();
      $('#' + buildingPermit.id + '-list').empty();

      if (entity) {
        $('#' + buildingPermit.id + '-list').append(buildingPermit.getListingItem(entity, uri));
      } else {
        $('#' + buildingPermit.id + '-list').html('<div class="alert alert-info">No results!</div>');
      }
    });
  },
  getQueryParameters: function (parameters) {
    return $.extend({
      prefixes: buildingPermit.prefixes,
      rdfType: buildingPermit.rdfType,
      columns: ['?uri'],
      optionalColumns: ['?uri dc:date ?date'],
      from: buildingPermit.graph,
      where: [],
      orderBy: '?' + buildingPermit.orderBy
    }, parameters);
  },
  query: function (parameters) {
    buildingPermit.showLoading();

    sparql.select($.extend(
      buildingPermit.getQueryParameters(parameters),
      {
        columns: ['DISTINCT(?uri)'],
        cursor: '?uri'
      }
    ), function (result) {
      function setPage(page) {
        page = +page; // parseInt

        buildingPermit.showLoading();

        result.page(page, 5, function (uris) {
          if (uris.length && uris[0].uri) {
            uris = _.pluck(uris, 'uri');

            sparql.getEntities(buildingPermit, uris, function (entities) {
              sparql.getEntities(block, _.pluck(entities, 'block'), function (blocks) {
                buildingPermit.clearLoading();

                var elements = [];

                _.each(uris, function (uri) {
                  var entity = entities[uri];

                  if (entity.block in blocks) {
                    entity.blockTitle = blocks[entity.block].label;
                  }

                  elements.push(buildingPermit.getListingItem(entity, uri));
                });

                $('#permits-list').empty().append(elements);
                $('#permits-pager').empty().append(pager(Math.ceil(result.count / 5), page, setPage));
              });
            });
          } else {
            buildingPermit.clearLoading();

            $('#permits-list').empty();
            $('#permits-pager').empty();
            $('#permits-list').html('<div class="alert alert-info">No results!</div>');
          }
        });
      }

      setPage(1);
    });
  },
  getListingItem: function (entity, uri) {
    var media = $('<div>').addClass('media');

    var link = $();

    if (entity.image) {
      link = $(
        '<a class="pull-left" href="' +
        entity.image +
        '"><img class="media-object img-thumbnail" src="' +
        'http://www2.ssa.stockholm.se/Mow/ssa-explorer-bygglov/modules/thumbnail-handler/get-thumbnail.aspx?src=http%3A%2F%2Fwww2.ssa.stockholm.se%2FMow%2Fssa-explorer-bygglov%2F..%2F..%2F..%2FBildarkiv%2FEgenproducerat%2FMOW%2F150dpi-mow%5C' +
        encodeURIComponent(entity.image.substr(entity.image.lastIndexOf('/') + 1)) +
        '" alt="' + buildingPermit.getTitle(entity) + '"></a>'
      )
      .on('click', function (event) {
        var link = $(this);
        var contents = $('<a>')
        .attr('href', link.attr('href'))
        .attr('target', '_blank')
        .append(
          $('<img>')
          .attr('src', link.attr('href'))
          .addClass('img-responsive')
        );

        tab.add('#main-column-tabs', '<i class="icon-picture"></i>', buildingPermit.title, contents, 'original-' + uri.toLowerCase().replace(/[^a-z0-9]+/g, '-'));

        event.preventDefault();
      })
      .attr('data-toggle', 'tooltip')
      .attr('data-placement', 'bottom')
      .attr('title', 'View original image')
      .tooltip()
      .appendTo(media);
    }

    var mediaBody = $('<div>').addClass('media-body').appendTo(media);

    mediaBody.append('<h4 class="media-heading">' + buildingPermit.getTitle(entity) + '</h4>');

    buildingPermit.getButton(uri, entity)
    .attr('data-toggle', 'tooltip')
    .attr('data-placement', 'bottom')
    .attr('title', 'View permit details')
    .tooltip({ container: 'body' })
    .appendTo(mediaBody);

    mediaBody.append(' ');

    shortcuts.generate('building-permit', uri, entity)
    .appendTo(mediaBody)
    .find('button').tooltip({ container: 'body', placement: 'bottom', trigger: 'hover', title: 'View tools for finding similar data' }).end()
    .on('show.bs.dropdown', function (event) {
      var wrapper = $(event.target);
      wrapper.find('button').tooltip('hide').tooltip('disable');
    })
    .on('hide.bs.dropdown', function (event) {
      var wrapper = $(event.target);
      wrapper.find('button').tooltip('enable');
    });

    mediaBody.append(' ');

    rawData.getButton('building-permit', uri)
    .attr('data-toggle', 'tooltip')
    .attr('data-placement', 'bottom')
    .attr('title', 'View tabular RDF data')
    .tooltip()
    .appendTo(mediaBody);

    return media;
  }
};

$(function () {
  $('#permits select').append([$('<option>').val('uri').text('Find by URI')].concat($.map(buildingPermit.columns, function (column) {
    return $('<option>').val(column.name).text('Find by ' + column.label);
  })));

  buildingPermit.list();
});

$(document).on('click', '#permits form button', function (event) {
  buildingPermit.search($('#permits form input').val());
  event.preventDefault();
});

$(document).on('submit', '#permits form', function (event) {
  buildingPermit.search($('#permits form input').val());
  event.preventDefault();
});