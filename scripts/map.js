var map = {
  instance: null,
  polygons: [],
  polygonOwnership: null,
  shortcutContainer: $('<div>').addClass('shortcut-container'),
  isDragging: false,
  pan: function (lat, lon, zoom) {
    map.instance.panTo(new google.maps.LatLng(+lat, +lon));
    if (zoom) {
      map.instance.setZoom(zoom);
    }
  },
  addPolygon: function (coordinates, properties, events) {
    var polygon = new google.maps.Polygon($.extend({
      path: coordinates,
      geodesic: true,
      strokeWeight: 0,
      fillColor: "#428bca",
      fillOpacity: 0.4
    }, properties));

    if (events) {
      $.each(events, function (eventName, callback) {
        google.maps.event.addListener(polygon, eventName, callback);
      });
    }

    map.polygons.push(polygon);

    polygon.setMap(map.instance);

    return polygon;
  },
  clearPolygons: function () {
    $.each(map.polygons, function (i, polygon) {
      polygon.setMap(null);
    });
    while (map.polygons.pop()) { }
  },
  getPixelsFromLatLng: function (latLng) {
    var map = window.map.instance;
    var projection = map.getProjection();
    var bounds = map.getBounds();
    var topRight = projection.fromLatLngToPoint(bounds.getNorthEast());
    var bottomLeft = projection.fromLatLngToPoint(bounds.getSouthWest());
    var scale = Math.pow(2, map.getZoom());
    var worldPoint = projection.fromLatLngToPoint(latLng);
    return [Math.floor((worldPoint.x - bottomLeft.x) * scale), Math.floor((worldPoint.y - topRight.y) * scale)];
  },
  tooltip: $('<div class="tooltip top in">' +
  '  <div class="tooltip-inner">' +
  '  </div>' +
  '  <div class="tooltip-arrow"></div>' +
  '</div>').css({ marginTop: 5 }),
  setTooltip: function (text, point) {
    var coordinates = map.getPixelsFromLatLng(point);

    map
    .tooltip
    .find('.tooltip-inner').text(text).end()
    .css({
      left: -9999
    })
    .show()
    .appendTo('#map');

    map
    .tooltip
    .css({
      top: coordinates[1] - map.tooltip.height() - 5,
      left: coordinates[0] - (map.tooltip.width() / 2) - 1
    });
  },
  clearTooltip: function () {
    map.tooltip.hide();
  },
  showLoading: function () {
    $('ul.nav-tabs a[href="#map"] i').removeClass('icon-th').addClass('icon-refresh icon-spin');
  },
  clearLoading: function () {
    $('ul.nav-tabs a[href="#map"] i').removeClass('icon-refresh icon-spin').addClass('icon-th');
  },
  showShortcuts: function (contents, point) {
    map
    .shortcutContainer
    .empty()
    .append(contents)
    .css({
      left: -9999
    })
    .appendTo('#map');

    var coordinates = map.getPixelsFromLatLng(point);

    map.shortcutContainer.css({
      top: coordinates[1] - map.shortcutContainer.height() - 5,
      left: coordinates[0] - (map.shortcutContainer.width() / 2) - 1
    });
  },
  clearShortcuts: function () {
    map.shortcutContainer.empty();
  },
  loadPropertiesInView: function () {
    map.showLoading();
    map.clearTooltip();
    map.clearShortcuts();

    _.each(map.polygons, function (polygon) {
      polygon.setOptions({ fillOpacity: 0.4 });
    });

    var bounds = map.instance.getBounds();

    var ne = bounds.getNorthEast();
    var sw = bounds.getSouthWest();

    property.findInBoundary(sw.lat(), ne.lat(), sw.lng(), ne.lng(), function (properties) {
      map.clearLoading();
      map.clearPolygons();
      map.polygonOwnership = 'property.findInBoundary';

      map.clearLoading();

      $.each(properties, function (i, property) {
        if (location.href.indexOf('skipcolons') == -1 && property.title.indexOf(':') != -1) {
          return;
        }

        var coordinates = $.map($.parseJSON(property.description), function (point, i) {
          return new google.maps.LatLng(point[0], point[1]);
        });

        var blockName = property.title.substr(0, property.title.lastIndexOf(' '));
        var blockUri = property.block;

        function loadCount(type, button, blockUri) {
          sparql.count({
            prefixes: type.prefixes,
            columns: ['?uri'],
            where: ['?uri bpc:Kvarter <' + blockUri + '>'],
            from: type.graph
          }, function (count) { button.addClass('has-count').append('<span class="count">' + count + '</span>') });
        }

        var loadBuildingPermitCount = _.throttle(function (button, blockUri) {
          loadCount(buildingPermit, button, blockUri);
        }, 1000);

        var loadPersonCount = _.throttle(function (button, blockUri) {
          loadCount(persons, button, blockUri);
        }, 1000);

        var polygon = map.addPolygon(coordinates, {
          fillColor: '#' + (blockName.hashCode().toString(16) + '000000').slice(2, 8)
        }, {
          mouseover: function () {
            if (map.isDragging) {
              return;
            }

            var myPolygon = this;

            $.each(map.polygons, function (i, polygon) {
              if (myPolygon.blockName == polygon.blockName) {
                this.setOptions({ fillOpacity: 1 });
              } else {
                this.setOptions({ fillOpacity: 0.4 });
              }
            });

            var blockPolygons = _.filter(map.polygons, function (polygon) { return myPolygon.blockName == polygon.blockName; });
            var points = _.flatten(_.map(blockPolygons, function (polygon) { return polygon.getPath().getArray(); }), true);

            var bounds = {
              top: _.max(points, function (point) { return point.lat(); }),
              bottom: _.min(points, function (point) { return point.lat(); }),
              left: _.min(points, function (point) { return point.lng(); }),
              right: _.max(points, function (point) { return point.lng(); })
            }

            var center = new google.maps.LatLng((bounds.top.lat() + bounds.bottom.lat()) / 2, (bounds.left.lng() + bounds.right.lng()) / 2);

            map.setTooltip(polygon.blockName, center);

            var buildingPermitButton = $('<span class="btn btn-default btn-s"><i class="icon-' + buildingPermit.icon + '"></i></span>')
              .attr('data-toggle', 'tooltip')
              .attr('data-placement', 'bottom')
              .attr('title', 'Building permits on this block')
              .click(function () {
                buildingPermit.searchFor(polygon.blockUri, 'block');
              })
              .tooltip({ container: 'body' });

            loadBuildingPermitCount(buildingPermitButton, polygon.blockUri);

            var personButton = $('<span class="btn btn-default btn-s"><i class="icon-' + persons.icon + '"></i></span>')
              .attr('data-toggle', 'tooltip')
              .attr('data-placement', 'bottom')
              .attr('title', 'Persons on this block (in 1760)')
              .click(function () {
                persons.searchFor(polygon.blockUri, 'block');
              })
              .tooltip({ container: 'body' });

            loadPersonCount(personButton, polygon.blockUri);

            map.showShortcuts([
              buildingPermitButton,
              ' ',
              personButton,
              ' ',
              $('<span class="btn btn-default btn-s"><i class="icon-' + block.icon + '"></i></span>')
              .attr('data-toggle', 'tooltip')
              .attr('data-placement', 'bottom')
              .attr('title', 'Open block tab')
              .click(function () {
                $(this).tooltip('hide');
                block.showInfo(polygon.blockUri, { label: polygon.blockName });
              })
              .tooltip({ container: 'body' })
            ], center);

            //map.showShortcuts(shortcuts.generate('block', polygon.blockUri), center);
          }
        });

        polygon.blockName = blockName;
        polygon.blockUri = blockUri;
      });
    });
  }
};

map.showLoading();

$(function () {
  var mapOptions = {
    zoom: 16,
    center: new google.maps.LatLng(59.3328689, 18.0624099),
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    tilt: 0,
    styles: [
      {
        featureType: "poi",
        stylers: [
          { visibility: "off" }
        ]
      },
      {
        "featureType": "landscape",
        "stylers": [
          { "visibility": "simplified" }
        ]
      }
    ]
  };

  map.instance = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

  google.maps.event.addListener(map.instance, 'tilesloaded', _.once(function () {
    map.loadPropertiesInView();
  }));

  google.maps.event.addListener(map.instance, 'dragstart', function () {
    map.isDragging = true;
  });

  google.maps.event.addListener(map.instance, 'dragend', function () {
    map.isDragging = false;
  });

  google.maps.event.addListener(map.instance, 'dragstart', function () {
    map.clearTooltip();
    map.clearShortcuts();

    _.each(map.polygons, function (polygon) {
      polygon.setOptions({ fillOpacity: 0.4 });
    });
  });

  google.maps.event.addListener(map.instance, 'dragend', function () {
    if (map.instance.getZoom() < 16) {
      //return;
    }

    if (map.polygonOwnership == 'block.showInfo' && $('#block-container ul.nav-tabs li.active').length > 0) {
      return;
    }

    map.showLoading();

    map.loadPropertiesInView();
  });

  google.maps.event.addListener(map.instance, 'zoom_changed', function () {
    if (map.instance.getZoom() < 16) {
      //return;
    }

    if (map.polygonOwnership == 'block.showInfo' && $('#block-container ul.nav-tabs li.active').length > 0) {
      return;
    }

    map.showLoading();

    map.loadPropertiesInView();
  });
});

$(document).on('mouseout', function (event) {
  if ($(event.relatedTarget).parents('#map').length == 0) {
    map.clearShortcuts();
    map.clearTooltip();

    $.each(map.polygons, function (i, polygon) {
      this.setOptions({ fillOpacity: 0.4 });
    });
  }
});