var property = {
  prefixes: {
    dc: 'http://purl.org/dc/elements/1.1/',
    dcterms: 'http://purl.org/dc/terms/',
    bpc: 'http://www.ldb-centrum.se/yeah/SwedishConcepts/20140123/',
    geo: 'http://www.w3.org/2003/01/geo/wgs84_pos#'
  },
  graph: 'http://www.ldb-centrum.se/yeah/SthlmProperties20140320/',
  findInBoundary: function (a, b, c, d, callback) {
    sparql.selectAll({
      prefixes: property.prefixes,
      columns: ['?title', '?description', '?block'],
      from: property.graph,
      where: [
        '?s dcterms:title ?title',
        '?s bpc:Kvarter ?block',
        '?s geo:lat ?lat',
        '?s geo:long ?long',
        '?s geo:location ?description',
        'FILTER(xsd:float(?lat) > ' + a + ')',
        'FILTER(xsd:float(?lat) < ' + b + ')',
        'FILTER(xsd:float(?long) > ' + c + ')',
        'FILTER(xsd:float(?long) < ' + d + ')'
      ]
    }, callback);
  },
  getShape: function (fnr, callback) {
    sparql.selectAll({
      prefixes: property.prefixes,
      columns: ['?description'],
      from: property.graph,
      where: [
        '?s dc:identifier "' + fnr + '"',
        '?s geo:location ?description'
      ]
    }, function (properties) {
      var property = properties.pop();

      callback($.parseJSON(property.description));
    });
  },
  findByBlock: function(uri, callback){
    sparql.selectAll({
      prefixes: property.prefixes,
      columns: ['?title', '?lat', '?long', '?location'],
      from: property.graph,
      where: [
        '?s dcterms:title ?title',
        '?s bpc:Kvarter <' + uri + '>',
        '?s geo:lat ?lat',
        '?s geo:long ?long',
        '?s geo:location ?location'
      ]
    }, callback);
  }
}
