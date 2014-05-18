$(function () {
  $('nav a.navbar-brand, nav .navbar-nav > li > a').tooltip();
});

function getLastSegmentOfURI(uri){
  return uri.indexOf('#') == -1 ? uri.substr(uri.lastIndexOf('/') + 1) : uri.substr(uri.lastIndexOf('#') + 1);
}

function camelCase(input) {
  return input.toLowerCase().replace(/-(.)/g, function(match, group1) {
    return group1.toUpperCase();
  });
}

function unCamelCase(input) {
  return input.replace(/(.)([A-Z])/g, function(match, group1, group2) {
    return group1 + ' ' + group2.toLowerCase();
  });
}

function capitalize(input) {
  return input.toLowerCase().replace(/(^|\s)(.)/g, function(match, group1, group2) {
    return group1 + group2.toUpperCase();
  });
}

function loadingPlaceholder(callback){
  var contents = $('<div></div>');

  contents.append('<i class="icon icon-spin icon-refresh"></i>');
  
  callback(contents);

  return contents;
}

String.prototype.hashCode = function(){
    var hash = 0, i, char;
    if (this.length == 0) return hash;
    for (i = 0, l = this.length; i < l; i++) {
        char  = this.charCodeAt(i);
        hash  = ((hash<<5)-hash)+char;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};

var table = {
  create: function (data) {
    return $('<table>')
    .addClass('table table-bordered')
    .append(
      $.map(data, function (value, key) {
        if (value) {
          return $('<tr>')
          .append(
            $('<th>').append(key)
          )
          .append(
            $('<td>').append(value)
          );
        } else {
          return; // returns undefined
        }
      })
    );
  }
};

setInterval(function () {
  var body = $(document.body);

  var minHeight = +body.css('min-height');

  if (!minHeight || body.height() > minHeight) {
    body.css({ minHeight: body.height() });
  }
}, 300);

function getConceptButton(uri, icon){
  return $('<button class="btn btn-default btn-xs"><i class="icon-' + icon + '"></i> ' + capitalize(unCamelCase(getLastSegmentOfURI(uri))) + '</button>')
  .click(function () {
    showConcept(uri, icon);
  });
}

function showConcept(uri, icon){
  var id = 'technology-' + uri.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  var contents = tab.create('#block-container', '<i class="icon-refresh icon-spin"></i>', capitalize(unCamelCase(getLastSegmentOfURI(uri))), id);

  function clearLoading() {
    $('ul.nav-tabs a[href="#pane-' + id + '"] i.icon-refresh.icon-spin').removeClass('icon-refresh icon-spin').addClass('icon-' + icon);
  }

  var type = $('<div/>').append('<i class="icon-refresh icon-spin"></i>');
  var prefLabels = $('<div/>').append('<i class="icon-refresh icon-spin"></i>');
  var altLabels = $('<div/>').append('<i class="icon-refresh icon-spin"></i>');
  var definition = $('<div/>').append('<i class="icon-refresh icon-spin"></i>');
  var inScheme = $('<div/>').append('<i class="icon-refresh icon-spin"></i>');

  table.create({
    'Type': type,
    'Preferred label': prefLabels,
    'Alternative label': altLabels,
    'Definiton': definition,
    'Used in scheme': inScheme,
    'Other': $('<button class="btn btn-default btn-xs"><i class="icon-code"></i> Raw data</button>')
      .click(function () {
        rawData.show(uri, 'http://www.ldb-centrum.se/yeah/SwedishConcepts/20140123/', 'Technology', 'file');
      })
  }).appendTo(contents);

  var promise1 = sparql.selectAll({
    prefixes: {
      rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
      skos: 'http://www.w3.org/2004/02/skos/core#'
    },
    columns: ['?type', '?definition', '?inScheme'],
    from: 'http://www.ldb-centrum.se/yeah/SwedishConcepts/20140123/',
    where: [
      '<' + uri + '> rdf:type ?type',
      '<' + uri + '> skos:definition ?definition',
      '<' + uri + '> skos:inScheme ?inScheme'
    ]
  }, function (data) {
    var data = data[0];
    type.empty().append($('<a/>').text(capitalize(unCamelCase(getLastSegmentOfURI(data.type)))).addClass('btn btn-default btn-xs').prepend('<i class="icon icon-link"></i> ').attr({ href: data.type, target: 'blank' }));
    definition.empty().append(data.definition);
    inScheme.empty().append(data.inScheme);
  });

  var promise2 = sparql.selectAll({
    prefixes: {
      rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
      skos: 'http://www.w3.org/2004/02/skos/core#'
    },
    columns: ['lang(?prefLabel) AS ?lang', '?prefLabel'],
    from: 'http://www.ldb-centrum.se/yeah/SwedishConcepts/20140123/',
    where: [
      '<' + uri + '> skos:prefLabel ?prefLabel'
    ]
  }, function (data) {
    prefLabels.empty().append($.map(data, function (data) {
      return $('<div/>').text('"' + data.prefLabel + '"' + ' (' + data.lang + ')');
    }));
  });

  var promise3 = sparql.selectAll({
    prefixes: {
      rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
      skos: 'http://www.w3.org/2004/02/skos/core#'
    },
    columns: ['lang(?altLabel) AS ?lang', '?altLabel'],
    from: 'http://www.ldb-centrum.se/yeah/SwedishConcepts/20140123/',
    where: [
      '<' + uri + '> skos:altLabel ?altLabel'
    ]
  }, function (data) {
    altLabels.empty().append($.map(data, function (data) {
      return $('<div/>').text('"' + data.altLabel + '"' + ' (' + data.lang + ')');
    }));
  });

  $.when(promise1, promise2, promise3).then(clearLoading);
}

function showBuildingPermitPerson(uri, title){
  var id = 'building-permit-person-' + uri.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  var contents = tab.create('#block-container', '<i class="icon-refresh icon-spin"></i>', title, id);

  function clearLoading() {
    $('ul.nav-tabs a[href="#pane-' + id + '"] i.icon-refresh.icon-spin').removeClass('icon-refresh icon-spin').addClass('icon-user');
  }

  sparql.selectOne({
    prefixes: buildingPermit.prefixes,
    columns: ['?type', '?creator', '?title', '?isPartOf', '?givenName'],
    where: [
      '<' + uri + '> rdf:type ?type',
      '<' + uri + '> foaf:givenName ?givenName'
    ],
    optionalColumns: [
      '<' + uri + '> dc:creator ?creator',
      '<' + uri + '> dc:isPartOf ?isPartOf',
      '<' + uri + '> foaf:title ?title'
    ],
    from: buildingPermit.graph
  }, function (row) {
    clearLoading();

    if (row) {
      table.create({
        'Type': row.type,
        'Creator': buildingPermit.getButton(row.creator),
        'Is part of': buildingPermit.getButton(row.isPartOf),
        'Title': row.title,
        'Given name': [
          $('<button class="btn btn-default btn-xs"><i class="icon-search"></i></button>')
          .click(function () {
            persons.searchFor(row.givenName, 'givenName');
          }),
          ' ',
          row.givenName
        ],
        'Other': $('<button class="btn btn-default btn-xs"><i class="icon-code"></i> Raw data</button>')
          .click(function () {
            rawData.show(uri, buildingPermit.graph, title, 'user');
          })
      }).appendTo(contents);
    } else {
      contents.append('<div class="alert alert-warning">Nothing found!</div>');
    }
  });
}

$(document).on('click', 'a.dropdown-toggle', function () {
  $(this).tooltip('hide');
})