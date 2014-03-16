var shortcuts = {
  types: ['building-permit', 'persons', 'block', 'street'],
  bridges: [
    [
      { type: 'building-permit', column: 'block' },
      { type: 'persons', column: 'block' },
      { type: 'block', column: 'uri'}//,
  //{ type: 'street', column: 'block' }
    ],
    [
      { type: 'building-permit', column: 'givenName' },
      { type: 'persons', column: 'lastName' }
    ],
    [
      { type: 'building-permit', column: 'parish' },
      { type: 'persons', column: 'parish' }
    ],
    [
      { type: 'building-permit', column: 'street' },
      { type: 'street', column: 'street' }
    ]
  ],
  generate: function (type, uri, data) {
    if (!data) {
      data = {};
    }

    var wrapper = $('<div>').addClass('btn-group');

    wrapper.append(
      $('<button>').addClass('btn btn-default btn-xs dropdown-toggle').attr('data-toggle', 'dropdown').text('Shortcuts').append(' <i class="icon-caret-down"></i>')
    );

    var list = $('<ul>').addClass('dropdown-menu').attr('role', 'menu').appendTo(wrapper);

    //shortcuts to own type

    if (type != 'block' && type != 'street') {
      list
      .append(
        $('<li>').attr('role', 'presentation').addClass('dropdown-header').text(window[camelCase(type)].label)
      )
      .append($.map(window[camelCase(type)].columns, function (column) {
        if (!(column.name in data)) {
          return;
        }

        return $('<li>').append(
          $('<a>')
          .attr('href', '#')
          .text('Find with same ' + column.label)
          .click(function () {
            $('ul.nav-tabs a[href="#' + window[camelCase(type)].id + '"]').click();

            $('#' + window[camelCase(type)].id + ' form')
            .find('select').val(column.name).end()
            .find('input').val(data[column.name]).end()
            .find('button').click();
          })
        );
      }));
    }

    //shortcuts to other types

    $.each(shortcuts.types, function (i, shortcutType) {
      if (type == shortcutType) {
        return;
      }

      if (!(type == 'street' && shortcutType == 'persons') && !(type == 'street' && shortcutType == 'block')) {
        list
        .append(
          $('<li>').attr('role', 'presentation').addClass('dropdown-header').text(window[camelCase(shortcutType)].label)
        );
      }

      $.each(shortcuts.bridges, function (i, bridge) {
        var firstType = _.find(bridge, function (mapping) {
          return mapping.type == shortcutType;
        });

        var secondType = _.find(bridge, function (mapping) {
          return mapping.type == type;
        });

        if (!firstType || !secondType) {
          return;
        }

        var secondTypeColumnNames;

        if ($.isArray(secondType.column)) {
          secondTypeColumnNames = secondType.column;
        } else {
          secondTypeColumnNames = [secondType.column];
        }

        $.each(secondTypeColumnNames, function (i, secondTypeColumnName) {
          if (!(secondTypeColumnName in data) && secondTypeColumnName != 'uri') {
            return;
          }

          var column = secondTypeColumnName == 'uri' ? { label: 'URI'} : _.find(window[camelCase(secondType.type)].columns, function (column) { return column.name == secondTypeColumnName });

          var value = secondTypeColumnName == 'uri' ? uri : data[secondTypeColumnName];

          list
          .append($('<li>').append(
            $('<a>')
            .attr('href', '#')
            .text('Find with same ' + column.label)
            .attr('title', firstType.type + ' ' + firstType.column + ' ~= "' + value + '"')
            .click(function () {
              $('ul.nav-tabs a[href="#' + window[camelCase(firstType.type)].id + '"]').click();

              $('#' + window[camelCase(firstType.type)].id + ' form')
              .find('select').val($.isArray(firstType.column) ? '*' : firstType.column).end()
              .find('input').val(value).end()
              .find('button').click();
            })
          ));
        });

      });
    });

    return wrapper;
  }
};

$(document).on('show.bs.dropdown', function (event) {
  var wrapper = $(event.target);

  wrapper.closest('div.media').add(wrapper.closest('div.media-body')).css({ overflow: 'visible' });
});

$(document).on('hidden.bs.dropdown', function (event) {
  var wrapper = $(event.target);

  setTimeout(function(){
    wrapper.closest('div.media').add(wrapper.closest('div.media-body')).css({ overflow: '' });
  }, 1);
});