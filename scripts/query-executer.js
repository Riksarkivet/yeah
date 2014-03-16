var queryExecuter = {
  add: function (title, query, result) {
    var id = query.hashCode();

    var contents = $('<div class="row">')
    .append(
      $('<div class="col-sm-6">')
      .append(
        queryExecuter.createForm(query)
      )
    )
    .append(
      $('<div class="col-sm-6">')
      .append(
        queryExecuter.createResult(result)
      )
    );

    tab.add('#main-column-tabs', '<i class="icon-rocket"></i>', title, contents, id);


    var textarea = contents.find('textarea');
    var editor = CodeMirror.fromTextArea(textarea[0]);
    textarea.data('editor', editor);
  },
  createForm: function (query) {
    var textarea = $('<textarea class="form-control"></textarea>').val(query);

    return $('<form>')
    .append(
      $('<div class="form-group">')
      .append('<label for="">Query:</label>')
      .append(textarea)
    )
    .append('<a class="btn btn-primary do-sparql-query"><i class="icon-bolt"></i> Run</a>')
    .append(' <a class="btn btn-default" href="http://130.240.234.101:8890/sparql" target="_blank"><i class="icon-external-link"></i> Open Virtuoso</a>');
  },
  createResult: function (result) {
    var element = $('<div>')
    .addClass('result')
    .css({
      whiteSpace: 'nowrap',
      overflowX: 'auto',
      overflowY: 'auto',
      height: 325,
      fontSize: 12
    });

    if (result.length > 0) {
      element.append(
        $('<table>')
        .addClass('table table-bordered table-condensed')
        .append(
          $('<thead>')
          .append(
            $('<tr>')
            .append(
              $.map(result[0], function (value, name) {
                return $('<th>').text(name);
              })
            )
          )
        )
        .append(
          $('<tbody>')
          .append(
            $.map(result, function (instance) {
              return $('<tr>')
              .append(
                $.map(instance, function (value, name) {
                  return $('<td>').text(value);
                })
              );
            })
          )
        )
      );
    } else {
      element.text('Empty result!')
    }

    return element;
  }
};

$(document).on('click', '#sparql-log a', function (event) {
  var link = $(this);

  queryExecuter.add('SPARQL', link.data('query'), link.data('response'));

  event.preventDefault();
});

$(document).on('click', 'a.do-sparql-query', function (event) {
  var link = $(this);

  var container = link.closest('div.row');
  var query = container.find('textarea').data('editor').getValue().split('\n');

  var resultContainer = container.find('div.result').parent();

  resultContainer.html('<i class="icon-refresh icon-spin"></i>')

  sparql.ajax(query, function (result) {
    resultContainer
    .empty()
    .append(
      queryExecuter.createResult(result)
    );
  });

  event.preventDefault();
});