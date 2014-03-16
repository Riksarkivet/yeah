var parish = {
  doQuery: function (parishes) {
    return (function (contents) {
      if (!parishes) {
        return;
      }

      var uris = _.filter(parishes, function (parish) {
        return parish.indexOf('http://') === 0;
      });

      _.each(uris, function (uri) {
        sparql.withProxy('dbpedia-proxy.php', function () {
          sparql.selectAll({
            prefixes: {
              owl: 'http://www.w3.org/2002/07/owl#',
              rdf: 'http://www.w3.org/2000/01/rdf-schema#'
            },
            columns: ['?sameAsUri', 'SAMPLE(?label) as ?label'],
            from: 'http://dbpedia.org',
            where: [
            '<' + uri + '> owl:sameAs ?sameAsUri',
            '<' + uri + '> rdf:label ?label'
          ]
          }, function (result) {
            contents.empty();

            if (result.length > 0) {
              contents.append('<div class="alert alert-warning">This data comes from <a href="http://dbpedia.org/">DBPedia</a>.</div>');

              _.each(result, function (row) {
                if (row.sameAsUri.indexOf('wikidata') != -1) {
                  contents.append('<a href="' + row.sameAsUri + '" target="_blank" class="btn btn-default btn-xs"><i class="icon icon-link"></i> ' + row.label + ' on Wikidata</a> ');

                  $.getJSON('//www.wikidata.org/w/api.php?callback=?', { action: 'wbgetentities', ids: row.sameAsUri.substr(row.sameAsUri.indexOf('/Q') + '/'.length), format: 'json' }, function (result) {
                    if (result && result.entities) {
                      _.each(result.entities, function (entity) {
                        _.each(entity.sitelinks, function (sitelink) {
                          if (sitelink.site.indexOf('wiki') == 2) {
                            var lang = sitelink.site.substr(0, 2);
                            $('<a href="http://' + lang + '.wikipedia.org/wiki/' + encodeURIComponent(sitelink.title) + '" target="_blank" class="btn btn-default btn-xs"><i class="icon icon-link"></i> ' + sitelink.title + ' on Wikipedia (' + lang + ')</a> ').appendTo(contents);
                          }
                        });
                      });
                    }
                  });
                }
              });
            } else {
              contents.append('<div class="alert alert-warning">Nothing found on <a href="http://dbpedia.org/">DBPedia</a> for parish: <code>' + uris[0] + '</code>.</div>');
            }
          });
        });
      });

      return contents;
    })($('<div>').append('<i class="icon icon-refresh icon-spin"></i>'))
  }
}