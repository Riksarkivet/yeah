var persons = {
  label: 'Person',
  id: 'persons',
  icon: 'group',
  prefixes: {
    dc: 'http://purl.org/dc/elements/1.1/',
    foaf: 'http://xmlns.com/foaf/0.1/',
    place: 'http://purl.org/ontology/places#',
    bpc: 'http://www.ldb-centrum.se/yeah/SwedishConcepts/20140123/',
    rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#'
  },
  rdfType: 'foaf:Person',
  graph: 'http://ldb-centrum.se/yeah/Mantalslangder20140320/',
  columns: (function () {
    var columns = [
      { type: 'rdf:type', name: 'rdfType' },
      { type: 'foaf:title' },
      { type: 'foaf:givenName' },
      { type: 'foaf:firstName' },
      { type: 'dc:description' },
      { type: 'foaf:lastName' },
      { type: 'bpc:Kvarter', name: 'block' },
      { type: 'bpc:Fastighet', name: 'property' },
      { type: 'place:Parish', name: 'parish', multiple: true },
      { type: 'dc:source', multiple: true }
    ];

    $.each(columns, function (i, column) {
      if (!('name' in column)) {
        column.name = column.type.substr(column.type.indexOf(':') + 1);
      }
      if (!('label' in column)) {
        column.label = column.name;
      }
    });

    return columns;
  })(),
  orderBy: 'givenName',
  getButton: function () {
    var button;

    if (arguments.length == 3 || arguments.length == 2) {
      var uri = arguments[0];
      var data = arguments[1];
      var title = arguments[2];

      button = $('<button class="btn btn-default btn-xs"><i class="icon-' + persons.icon + '"></i> ' + (title ? title : persons.getTitle(data)) + '</button>')
      .click(function () {
        var contents = tab.create('#block-container', '<i class="icon-' + persons.icon + '"></i>', persons.getTitle(data), 'detail-' + uri.toLowerCase().replace(/[^a-z0-9]+/g, '-'));

        table.create({
          'First name': data.firstName,
          'Last name': data.lastName,
          'Title': data.title,
          'Description': data.description,
          'Property info': data.property,
          'Block': loadingPlaceholder(function (contents) {
            sparql.getEntity(block, data.block, function (entity) {
              contents.empty().append(block.getButton(data.block, entity));
            });
          }),
          'Parish': data.parish && data.parish.length ? parish.doQuery(data.parish) : undefined,
          'Source': _.map(data.source, function (source) {
            var button = $('<button class="btn btn-default btn-xs"><i class="icon-book"></i> Census data</button>')
            .click(function () {
              var id = 'original-' + uri.toLowerCase().replace(/[^a-z0-9]+/g, '-');
              var contents = tab.create('#block-container', '<i class="icon-refresh icon-spin"></i>', 'Census data', id);

              function clearLoading() {
                $('ul.nav-tabs a[href="#pane-' + id + '"] i.icon-refresh.icon-spin').removeClass('icon-refresh icon-spin').addClass('icon-book');
              }

              sparql.selectAll({
                prefixes: {
                  foaf: 'http://xmlns.com/foaf/0.1/',
                  place: 'http://purl.org/ontology/places#',
                  bpc: 'http://www.ldb-centrum.se/yeah/SwedishConcepts/20140123/',
                  rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#'
                },
                columns: ['?parish', '?block', '?depiction'],
                from: persons.graph,
                where: [
                  '<' + source + '> place:Parish ?parish',
                  '<' + source + '> bpc:Kvarter ?block',
                  '<' + source + '> foaf:depiction ?depiction'
                ]
              }, function (data) {
                contents.empty();

                clearLoading();

                var census = data[0];

                table.create({
                  'Parish': census.parish,
                  'Block': census.block,
                  'Persons': (function (contents) {
                    sparql.selectAll(persons.getQueryParameters({
                      where: [
                        '?uri dc:source [foaf:depiction <' + census.depiction + '>]'
                      ]
                    }), function (uris) {
                      if (uris.length && uris[0].uri) {
                        uris = _.pluck(uris, 'uri');

                        sparql.getEntities(persons, uris, function (entities) {


                          var elements = [];

                          _.each(uris, function (uri) {
                            elements.push(persons.getButton(uri, entities[uri]));
                          });

                          contents.empty().append(elements);
                        });
                      } else {
                        contents.html('<div class="alert alert-info">No results!</div>');
                      }
                    });

                    return contents;
                  })($('<div>').append('<i class="icon icon-refresh icon-spin"></i>')),
                  'Image': $('<a class="btn btn-default btn-xs" href="' + census.depiction + '"><i class="icon-picture"></i> ' + census.depiction.substr(census.depiction.lastIndexOf('/') + 1) + '</a>')
                  .click(function (event) {
                    var link = $(this);
                    var title = link.closest('.media').find('h4').text();
                    var uri = link.attr('href').toLowerCase().replace(/[^a-z0-9]+/g, '-');
                    var contents = $('<a>')
                    .attr('href', link.attr('href'))
                    .append(
                      $('<img>')
                      .attr('src', link.attr('href'))
                      .addClass('img-responsive')
                    );

                    tab.add('#main-column-tabs', '<i class="icon-book"></i>', title, contents, 'original-' + uri);

                    event.preventDefault();
                  }),
                  'Other': $('<button class="btn btn-default btn-xs"><i class="icon-code"></i> Raw data</button>')
                    .click(function () {
                      rawData.show(source, persons.graph, 'Census data', 'book');
                    })
                }).appendTo(contents);
              });
            });

            return button;
          }),
          'Other': [
            shortcuts.generate('persons', uri, data),
            ' ',
            rawData.getButton('persons', uri)
          ]
        }).appendTo(contents);
      });
    }

    if (arguments.length == 1) {
      var givenName = arguments[0];

      button = $('<button class="btn btn-default btn-xs"><i class="icon-' + persons.icon + '"></i> ' + (title ? title : givenName) + '</button>')
      .click(function () {
        $('ul.nav-tabs a[href="#' + persons.id + '"]').click();

        $('#' + persons.id + ' form')
        .find('select').val('givenName').end()
        .find('input').val(givenName).end()
        .find('button').click().end();
      });
    }

    return button;
  },
  getTitle: function (data) {
    if (!data) {
      return persons.label;
    }
    if (!data.givenName && !data.firstName && !data.givenName && !data.title) {
      return persons.label;
    }

    var name;

    if (data.givenName) {
      name = data.givenName;
    } else {
      name = '';

      if (data.firstName) {
        name += data.firstName;
      }

      if (data.lastName) {
        if (name != '') {
          name += ' ' + data.lastName;
        } else {
          name = data.lastName;
        }
      }
    }

    if (data.title) {
      if (name != '') {
        name += ' (' + data.title + ')';
      } else {
        name = data.title;
      }
    }

    if (!name) {
      name = persons.label;
    }

    return name;
  },
  searchFor: function (text, field) {
    $('ul.nav-tabs a[href="#' + persons.id + '"]').click();

    $('#' + persons.id + ' form')
    .find('select').val(field).end()
    .find('input').val(text).end()
    .find('button').click();
  },
  showLoading: function () {
    $('ul.nav-tabs a[href="#' + persons.id + '"] i').removeClass('icon-group').addClass('icon-refresh icon-spin');
    $('#' + persons.id).css({ opacity: 0.5 });
  },
  clearLoading: function () {
    $('ul.nav-tabs a[href="#' + persons.id + '"] i').removeClass('icon-refresh icon-spin').addClass('icon-group');
    $('#' + persons.id).css({ opacity: 1 });
  },
  list: function () {
    persons.query();
  },
  search: function (text) {
    if (!text) {
      persons.list();
      return;
    }

    var select = $('#' + persons.id + ' select');
    var value = select.val();

    if (value != '*') {
      if (value == 'uri') {
        persons.queryByUri(text);
        return;
      }

      var column = _.find(persons.columns, function (column) { return column.name == value; });
      var orderByColumn = _.find(persons.columns, function (column) { return column.name == persons.orderBy; });

      persons.query({
        where: [
          '?uri ' + column.type + ' ' + (column.blankNodeWithProperty ? '[' + column.blankNodeWithProperty + ' ' + '?' + column.name + ']' : '?' + column.name),
          'FILTER(regex(str(' + '?' + column.name + '), "' + text.replace('"', '\\"') + '", "i"))'
        ],
        optionalColumns: [
          value != persons.orderBy ? '?uri ' + orderByColumn.type + ' ' + (orderByColumn.blankNodeWithProperty ? '[' + orderByColumn.blankNodeWithProperty + ' ' + '?' + orderByColumn.name + ']' : '?' + orderByColumn.name) : undefined,
        ]
      });
    } else {
      persons.query({
        where: ['FILTER(' + _.map(persons.columns, function (column) {
          return 'regex(str(' + '?' + column.name + '), "' + text.replace('"', '\\"') + '", "i")';
        }).join(' || ') + ')'],
        optionalColumns: $.map(persons.columns, function (column) {
          return '?uri ' + column.type + ' ' + (column.blankNodeWithProperty ? '[' + column.blankNodeWithProperty + ' ' + '?' + column.name + ']' : '?' + column.name);
        })
      });
    }
  },
  getQueryParameters: function (parameters) {
    return $.extend({
      prefixes: persons.prefixes,
      rdfType: persons.rdfType,
      columns: ['?uri'],
      optionalColumns: ['?uri foaf:givenName ?givenName'],
      //optionalColumns: $.map(persons.columns, function (column) {
      //  return '?uri ' + column.type + ' ' + (column.blankNodeWithProperty ? '[' + column.blankNodeWithProperty + ' ' + '?' + column.name + ']' : '?' + column.name);
      //}),
      from: persons.graph,
      where: [],
      orderBy: '?' + persons.orderBy
    }, parameters);
  },
  queryByUri: function (uri) {
    sparql.getEntity(persons, uri, function (entity) {
      persons.clearLoading();
      $('#persons-pager').empty();
      $('#persons-list').empty()

      if (entity) {
        $('#persons-list').append(persons.getListingItem(entity, uri));
      }
    });
  },
  query: function (parameters) {
    persons.showLoading();

    sparql.select($.extend(
      persons.getQueryParameters(parameters),
      {
        columns: ['DISTINCT(?uri)'],
        cursor: '?uri'
      }
    ), function (result) {
      function setPage(page) {
        page = +page; // parseInt

        persons.showLoading();

        result.page(page, 10, function (uris) {
          if (uris.length && uris[0].uri) {
            uris = _.pluck(uris, 'uri');

            sparql.getEntities(persons, uris, function (entities) {
              persons.clearLoading();

              var elements = [];

              _.each(uris, function (uri) {
                elements.push(persons.getListingItem(entities[uri], uri));
              });

              $('#persons-list').empty().append(elements);
              $('#persons-pager').empty().append(pager(Math.ceil(result.count / 10), page, setPage));
            });
          } else {
            persons.clearLoading();

            $('#persons-list').empty();
            $('#persons-pager').empty();
            $('#persons-list').html('<div class="alert alert-info">No results!</div>');
          }
        });
      }

      setPage(1);
    });
  },
  getListingItem: function (row, uri) {
    var media = $('<div>').addClass('media');

    media.data('person', row);

    var mediaBody = $('<div>').addClass('media-body').appendTo(media);

    mediaBody.append('<h4 class="media-heading">' + persons.getTitle(row) + '</h4>');

    persons.getButton(uri, row).appendTo(mediaBody);

    mediaBody.append(' ');
    mediaBody.append(shortcuts.generate('persons', uri, row));
    mediaBody.append(' ');

    rawData.getButton('persons', uri).appendTo(mediaBody);

    return media;
  }
}

$(function () {
  $('#persons select').append([$('<option>').val('uri').text('Find by URI')].concat($.map(persons.columns, function(column){
    return $('<option>').val(column.name).text('Find by ' + column.label);
  })));

  persons.list();
});

$(document).on('click', '#persons form button', function (event) {
  persons.search($('#persons form input').val());
  event.preventDefault();
});

$(document).on('submit', '#persons form', function (event) {
  persons.search($('#persons form input').val());
  event.preventDefault();
});