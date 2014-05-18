var sparql = {
  proxy: 'proxy.php',
  withProxy: function (proxy, callback) {
    var oldProxy = sparql.proxy;

    sparql.proxy = proxy;

    callback();

    sparql.proxy = oldProxy;
  },
  buildQuery: function (parameters) {
    var query = [].concat(
      (parameters.prefixes ? $.map(parameters.prefixes, function (uri, prefix) {
        return 'PREFIX ' + prefix + ': <' + uri + '>';
      }) : ''),
      parameters.cursor ? 'SELECT ' + parameters.cursor + ' WHERE' : '',
      parameters.cursor ? '{' : '',
      parameters.cursor ? '{' : '',
      'SELECT ' + parameters.columns.join(' '),
      'FROM <' + parameters.from + '>',
      'WHERE {',
      parameters.rdfType ? '?uri a ' + parameters.rdfType + '.\n' : '',
      parameters.where.join('.\n'),
      parameters.filter ? 'FILTER ( ' + parameters.filter + ' )' : '',
      (
        parameters.optionalColumns ?
          _.map(parameters.optionalColumns, function (optionalColumn) { return optionalColumn ? 'OPTIONAL {' + optionalColumn + '}' : undefined; }).join('\n')
        : ''
      ),
      '}',
      (parameters.orderBy ? 'ORDER BY ' + parameters.orderBy : ''),
      parameters.cursor ? '}' : '',
      parameters.cursor ? '}' : '',
      (parameters.limit ? 'LIMIT ' + parameters.limit : ''),
      (parameters.offset ? 'OFFSET ' + parameters.offset : '')
    );

    return query;
  },
  getEntity: function (type, uri, callback) {
    sparql.getEntities(type, [uri], function (response) {
      if (typeof response == 'object' && uri in response) {
        callback(response[uri]);
      } else {
        callback();
      }
    });
  },
  getEntities: function (type, uris, callback) {
    sparql.selectAll({
      columns: ['?uri', '?p', '?o'],
      from: type.graph,
      where: ['?uri ?p ?o'],
      filter: '?uri IN (' + _.map(uris, function (uri) { return '<' + uri + '>'; }).join(', ') + ')'
    },
    function (triples) {
      var propertyTypes = {};

      _.each(type.columns, function (column) {
        var prefix = type.prefixes[column.type.substr(0, column.type.indexOf(':'))];

        if (!prefix) {
          throw 'No namespace registered for the prefix "' + column.type.substr(0, column.type.indexOf(':')) + '"';
        }

        var suffix = column.type.substr(column.type.indexOf(':') + 1);

        propertyTypes[prefix.toLowerCase() + suffix.toLowerCase()] = {
          name: column.name ? column.name : suffix,
          multiple: !!column.multiple
        };
      });

      var entities = {};

      _.each(triples, function (triple) {
        var entity;

        if (!(triple.uri in entities)) {
          entities[triple.uri] = {};
        }

        entity = entities[triple.uri];

        var predicateLowerCase = triple.p.toLowerCase();

        var propertyType = predicateLowerCase in propertyTypes ? propertyTypes[predicateLowerCase] : {
          name: predicateLowerCase,
          multiple: false
        };
        var propertyName = propertyType.name;

        if (propertyName in entity) {
          if (propertyType.multiple) {
            entity[propertyName].push(triple.o);
          } else {
            entity[propertyName] = triple.o;
          }
        } else {
          if (propertyType.multiple) {
            entity[propertyName] = [triple.o];
          } else {
            entity[propertyName] = triple.o;
          }
        }
        
        _.each(type.columns, function (column) {
          if (column.multiple && !entity[column.name]) {
            entity[column.name] = [];
          }
        });
      });

      callback(entities);
    });
  },
  selectAll: function (parameters, callback) {
    return sparql.ajax(sparql.buildQuery(parameters), callback);
  },
  selectOne: function (parameters, callback) {
    sparql.ajax(
      sparql.buildQuery(
        $.extend(
          {},
          parameters, {
            limit: 1
          }
        )
      ),
      function (result) {
        callback(result.pop());
      }
    );
  },
  select: function (parameters, callback) {
    sparql.count(parameters, function (count) {
      callback({
        page: function (pageNumber, pageSize, callback) {
          sparql.ajax(
              sparql.buildQuery(
                $.extend(
                  {},
                  parameters, {
                    limit: pageSize,
                    offset: (pageNumber - 1) * pageSize
                  }
                )
              ),
              callback
            );
        },
        count: count
      });
    });
  },
  count: function (parameters, callback) {
    sparql.ajax(sparql.buildQuery($.extend({}, parameters, {
      columns: ['(count(' + parameters.columns[0] + ') as ?count)'],
      orderBy: null,
      cursor: null
    })), function (rows) {
      callback(rows[0] ? rows[0].count : 0);
    });
  },
  ajax: function (query, callback) {
    var proxyUsed = sparql.proxy;

    query = query.join('\n');

    return $.ajax(sparql.proxy, {
      method: 'post',
      data: {
        query: query
      },
      success: function (response) {
        if (!response.results) {
          callback([]);
          return;
        }

        var result = $.map(response.results.bindings, function (binding) {
          var row = {};

          $.map(binding, function (item, key) {
            row[key] = item.value;
          });

          return row;
        });

        if (proxyUsed == 'proxy.php') {
          logger.log(query, result);
        }

        callback(result);
      },
      dataType: 'json'
    });
  }
};