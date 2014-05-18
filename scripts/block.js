var block = {
  label: 'Block',
  icon: 'map-marker',
  id: 'blocks',
  prefixes: {
    dc: 'http://purl.org/dc/elements/1.1/',
    dcterms: 'http://purl.org/dc/terms/',
    foaf: 'http://xmlns.com/foaf/0.1/',
    place: 'http://purl.org/ontology/places#',
    bpc: 'http://www.ldb-centrum.se/yeah/SwedishConcepts/20140123/',
    rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
    rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
    skos: 'http://www.w3.org/2004/02/skos/core#'
  },
  rdfType: 'bpc:Kvarter',
  graph: 'http://www.ldb-centrum.se/yeah/Kvarter20140321/',
  columns: (function () {
    var columns = [
      { type: 'rdf:type', name: 'rdfType', multiple: true },
      { type: 'rdfs:seeAlso', multiple: true },
      { type: 'dcterms:isPartOf' },
      { type: 'dcterms:hasPart', multiple: true },
      { type: 'rdfs:label' },
      { type: 'skos:altLabel', multiple: true }
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
  orderBy: 'label',
  getButton: function (uri, data, title) {
    var button;

    if (uri && !data && !title) {
      button = loadingPlaceholder(function (contents) {
        sparql.getEntity(block, uri, function (entity) {
          contents.empty();

          if (entity) {
            contents.append(block.getButton(uri, entity));
          } else {
            contents.append(block.getButton(uri, null, block.label));
          }
        });
      });
    } else {
      button = $('<button class="btn btn-default btn-xs"><i class="icon-' + block.icon + '"></i> ' + (title ? title : block.getTitle(data)) + '</button>')
      .click(function () {
        block.showInfo(uri, data);
      });
    }

    return button;
  },
  showInfo: function (uri, data) {
    var contents = tab.create('#block-container', '<i class="icon-' + block.icon + '"></i>', block.getTitle(data));

    var propertiesField = $('<div>').append('<i class="icon icon-refresh icon-spin"></i>');

    table.create({
      'Has part': data.hasPart && data.hasPart.length ? _.map(data.hasPart, function(uri){return block.getButton(uri);}) : undefined,
      'Is part of': data.isPartOf ? block.getButton(data.isPartOf, null, null) : undefined,
      'Alternate names': data.altLabel ? data.altLabel.join(', ') : undefined,
      'Properties': propertiesField,
      'Streets': (function (contents) {
        street.findByBlockName(data.label, function (streets) {
          contents.empty();

          contents.append('<div class="alert alert-warning">This data comes from <a href="http://www.ssa.stockholm.se/en/Forskarsal/Search-Tools/Rotemansarkiv/">Roteman archives</a> (1878-1926).</div>');

          var buttons = _.chain(streets).map(function (streetName) { return street.getButton(streetName); }).map(_.toArray).flatten().value();

          contents.append($('<ul/>').addClass('blocks').append($(buttons).wrap('<li/>').parent().append(' ')));
        });

        return contents;
      })($('<div>').append('<i class="icon icon-spin icon-refresh"></i>')),
      'Wikipedia': (function (contents) {
        var title = 'Kvarteret ' + capitalize(data.label);

        $.getJSON('//sv.wikipedia.org/w/api.php?callback=?', { action: 'query', titles: title, format: 'json' }, function (result) {
          contents.empty();

          if (result && result.query && result.query.pages && !('-1' in result.query.pages)) {
            _.each(result.query.pages, function (page) {
              any = true;
              $('<a href="http://sv.wikipedia.org/wiki/' + encodeURIComponent(page.title) + '" target="_blank" class="btn btn-default btn-xs"><i class="icon icon-link"></i> ' + page.title + ' on Wikipedia (sv)</a>').appendTo(contents);
            });
          } else {
            $('<div class="alert alert-info">This page does not seem to exist on Wikipedia, but you can create it yourself.</div>').appendTo(contents);
            $('<a href="http://sv.wikipedia.org/wiki/' + encodeURIComponent(title) + '" target="_blank" class="btn btn-default btn-xs"><i class="icon icon-link"></i> Create page on Wikipedia (sv)</a>').appendTo(contents);
            contents.append(' ');
            $('<a href="http://google.com/#q=' + encodeURIComponent(title) + '" target="_blank" class="btn btn-default btn-xs"><i class="icon icon-link"></i> ' + title + ' on Google</a>').appendTo(contents);
          }
        });

        return contents;
      })($('<div>').append('<i class="icon icon-spin icon-refresh"></i>')),
      'Other': [shortcuts.generate('block', uri, { block: data.label }), ' ', rawData.getButton('block', uri)]
    }).appendTo(contents);

    property.findByBlock(uri, function (properties) {
      propertiesField.empty();

      if (properties.length) {
        propertiesField.append('<div class="alert alert-warning">This data comes from <a href="http://open.stockholm.se/geodata">Open Stockholm Geodata</a>.</div>');

        var propertyButtons = $.map(properties, function (property) {
          return $('<button class="btn btn-default btn-xs show-block"><i class="icon-map-marker"></i> ' + property.title.substr(property.title.lastIndexOf(' ') + 1) + '</button>')
          .click(function () {
            var button = $(this);
            var property = button.data('property');
            var polygon = button.data('polygon');

            map.pan(property.lat, property.long, 18);
          })
          .hover(function () {
            var button = $(this);
            var property = button.data('property');
            var polygon = button.data('polygon');

            $.each(propertyButtons, function (i, propertyButton) {
              var polygon = propertyButton.data('polygon');

              if (polygon) {
                polygon.setOptions({ fillOpacity: 0.4 });
              }
            })

            if (polygon) {
              polygon.setOptions({ fillOpacity: 1 });

              var points = polygon.getPath().getArray();

              var lat = Math.max.apply(null, $.map(points, function (point) { return point.lat(); }));
              var lon = (Math.min.apply(null, $.map(points, function (point) { return point.lng(); })) + Math.max.apply(null, $.map(points, function (point) { return point.lng(); }))) / 2;

              map.setTooltip(polygon.property.title, new google.maps.LatLng(lat, lon));
            }
          }, function () {
            $.each(propertyButtons, function (i, propertyButton) {
              var polygon = propertyButton.data('polygon');

              if (polygon) {
                polygon.setOptions({ fillOpacity: 0.4 });
              }
            })

            map.clearTooltip();
          })
          .data('property', property);
        });

        propertiesField
        .append(
          $('<ul>').addClass('blocks').append($.map(propertyButtons, function (property) { return $('<li>').append(property); }))
        );

        map.clearPolygons();
        map.clearTooltip();
        map.clearShortcuts();
        map.polygonOwnership = 'block.showInfo';

        $.each(propertyButtons, function (i, propertyButton) {
          var property = propertyButton.data('property');

          var points = $.parseJSON(property.location);
          var coordinates = $.map(points, function (point, i) {
            return new google.maps.LatLng(point[0], point[1]);
          });

          var polygon = map.addPolygon(coordinates, {}, {
            mouseover: function () {
              this.setOptions({ fillOpacity: 1 });

              var highestPoint;

              $.each(this.getPath().getArray(), function (i, point) {
                if (!highestPoint || point.lat() > highestPoint.lat()) {
                  highestPoint = point;
                }
              });

              map.setTooltip(this.property.title, highestPoint);
            },
            mouseout: function () {
              this.setOptions({ fillOpacity: 0.4 });

              map.clearTooltip();
            }
          });

          polygon.property = property;

          var currentBlockPolygons = contents.data('current-block-polygons');

          if (!currentBlockPolygons) {
            currentBlockPolygons = [];
            contents.data('current-block-polygons', currentBlockPolygons);
          }

          propertyButton.data('polygon', polygon);

          currentBlockPolygons.push(polygon);
        });

        var lat = 0;

        $.each(properties, function (i, property) {
          lat += +property.lat;
        });

        lat /= properties.length;

        var lon = 0;

        $.each(properties, function (i, property) {
          lon += +property.long;
        });

        lon /= properties.length;

        map.pan(lat, lon);

        if (map.instance.getZoom() < 16) {
          map.instance.setZoom(16);
        }
      } else {
        var title = 'Kvarteret ' + capitalize(data.label);
        propertiesField.append('<div class="alert alert-warning">This block doesn\'t seem to exist (today). Try looking for <a href="http://google.com/#q=' + encodeURIComponent(title) + '" target="_blank"> on Google</a> or Wikipedia (see below).</div>')
      }
    });
  },
  getTitle: function (data) {
    if (!data || !data.label) {
      return block.label;
    }
    return data.label;
  },
  showLoading: function () {
    $('ul.nav-tabs a[href="#' + block.id + '"] i').removeClass('icon-map-marker').addClass('icon-refresh icon-spin');
    $('#' + block.id).css({ opacity: 0.5 });
  },
  clearLoading: function () {
    $('ul.nav-tabs a[href="#' + block.id + '"] i').removeClass('icon-refresh icon-spin').addClass('icon-map-marker');
    $('#' + block.id).css({ opacity: 1 });
  },
  list: function () {
    block.query();
  },
  search: function (text) {
    if (!text) {
      block.list();
      return;
    }

    var select = $('#' + block.id + ' select');
    var value = select.val();

    if (value != '*') {
      if (value == 'uri') {
        block.queryByUri(text);
        return;
      }

      var column = _.find(block.columns, function (column) { return column.name == value; });
      var orderByColumn = _.find(block.columns, function (column) { return column.name == block.orderBy; });

      block.query({
        where: [
          '?uri ' + column.type + ' ' + (column.blankNodeWithProperty ? '[' + column.blankNodeWithProperty + ' ' + '?' + column.name + ']' : '?' + column.name),
          'FILTER(regex(str(' + '?' + column.name + '), "' + text.replace('"', '\\"') + '", "i"))'
        ],
        optionalColumns: [
          value != block.orderBy ? '?uri ' + orderByColumn.type + ' ' + (orderByColumn.blankNodeWithProperty ? '[' + orderByColumn.blankNodeWithProperty + ' ' + '?' + orderByColumn.name + ']' : '?' + orderByColumn.name) : undefined,
        ]
      });
    } else {
      block.query({
        where: ['FILTER(' + _.map(block.columns, function (column) {
          return 'regex(str(' + '?' + column.name + '), "' + text.replace('"', '\\"') + '", "i")';
        }).join(' || ') + ')'],
        optionalColumns: $.map(block.columns, function (column) {
          return '?uri ' + column.type + ' ' + (column.blankNodeWithProperty ? '[' + column.blankNodeWithProperty + ' ' + '?' + column.name + ']' : '?' + column.name);
        })
      });
    }
  },
  getQueryParameters: function (parameters) {
    return $.extend({
      prefixes: block.prefixes,
      rdfType: block.rdfType,
      columns: ['?uri'],
      optionalColumns: ['?uri rdf:label ?label'],
      from: block.graph,
      where: [],
      orderBy: '?' + block.orderBy
    }, parameters);
  },
  queryByUri: function (uri) {
    sparql.getEntity(block, uri, function (entity) {
      block.clearLoading();
      $('#blocks-pager').empty();
      $('#blocks-list').empty()

      if (entity) {
        $('#blocks-list').append(block.getListingItem(entity, uri));
      }
    });
  },
  query: function (parameters) {
    block.showLoading();

    sparql.select($.extend(
      block.getQueryParameters(parameters),
      {
        columns: ['DISTINCT(?uri)'],
        cursor: '?uri'
      }
    ), function (result) {
      function setPage(page) {
        page = +page; // parseInt

        block.showLoading();

        result.page(page, 10, function (uris) {
          if (uris.length && uris[0].uri) {
            uris = _.pluck(uris, 'uri');

            sparql.getEntities(block, uris, function (entities) {
              block.clearLoading();

              var elements = [];

              _.each(uris, function (uri) {
                elements.push(block.getListingItem(entities[uri], uri));
              });

              $('#blocks-list').empty().append(elements);
              $('#blocks-pager').empty().append(pager(Math.ceil(result.count / 10), page, setPage));
            });
          } else {
            block.clearLoading();

            $('#blocks-list').empty();
            $('#blocks-pager').empty();
            $('#blocks-list').html('<div class="alert alert-info">No results!</div>');
          }
        });
      }

      setPage(1);
    });
  },
  //query: function (parameters) {
  //  block.showLoading();

  //  sparql.select($.extend({
  //    prefixes: block.prefixes,
  //    columns: ['DISTINCT(?block)'],
  //    from: block.graph,
  //    where: block.whereClause,
  //    orderBy: '?block'
  //  }, parameters), function (result) {
  //    function setPage(page) {
  //      page = +page; // parseInt

  //      block.showLoading();

  //      result.page(page, 10, function (rows) {
  //        block.clearLoading();

  //        $('#blocks-list').empty();
  //        $('#blocks-pager').empty();

  //        if (rows.length) {
  //          var elements = $.map(rows, function (row, i) {
  //            var media = $('<div>').addClass('media');

  //            media.data('block', row);

  //            //media.append('<a class="pull-left" href="http://www2.ssa.stockholm.se/Bildarkiv/Egenproducerat/MOW/150dpi-mow/' + row.img + '"><img class="media-object img-thumbnail" src="http://www2.ssa.stockholm.se/Mow/ssa-explorer-bygglov/modules/thumbnail-handler/get-thumbnail.aspx?src=http%3A%2F%2Fwww2.ssa.stockholm.se%2FMow%2Fssa-explorer-bygglov%2F..%2F..%2F..%2FBildarkiv%2FEgenproducerat%2FMOW%2F150dpi-mow%5C' + encodeURIComponent(row.img) + '" alt="..."></a>');

  //            var mediaBody = $('<div>').addClass('media-body').appendTo(media);

  //            mediaBody.append('<h4 class="media-heading">' + block.getTitle(row.block) + '</h4>');

  //            block.getButton(row.block).appendTo(mediaBody);

  //            mediaBody.append(' ');

  //            mediaBody.append(shortcuts.generate('block', null, row));

  //            return media;
  //          });

  //          $('#blocks-list').append(elements);
  //          $('#blocks-pager').append(pager(Math.ceil(result.count / 10), page, setPage));
  //        } else {
  //          $('#blocks-list').html('<div class="alert alert-info">No results!</div>');
  //        }
  //      });
  //    }

  //    setPage(1);
  //  });
  //},
  getListingItem: function (entity, uri) {
    var media = $('<div>').addClass('media');

    var mediaBody = $('<div>').addClass('media-body').appendTo(media);

    mediaBody.append('<h4 class="media-heading">' + block.getTitle(entity) + '</h4>');

    block.getButton(uri, entity).appendTo(mediaBody);

    mediaBody.append(' ');

    mediaBody.append(shortcuts.generate('block', uri, entity));
    mediaBody.append(' ');
    mediaBody.append(rawData.getButton('block', uri));

    return media;
  }
};

$(function () {
  $('#blocks select').append([$('<option>').val('uri').text('Find by URI')].concat($.map(block.columns, function(column){
    return $('<option>').val(column.name).text('Find by ' + column.label);
  })));

  block.list();
});

$(document).on('click', '#blocks form button', function (event) {
  block.search($('#blocks form input').val());
  event.preventDefault();
});

$(document).on('submit', '#blocks form', function (event) {
  block.search($('#blocks form input').val());
  event.preventDefault();
});