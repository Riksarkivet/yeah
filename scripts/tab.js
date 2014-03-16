var tab = {
  create: function (container, icon, title, id) {
    var contents = $('<div>');

    tab.add(container, icon, title, contents, id);

    return contents;
  },
  add: function (container, icon, title, contents, id) {
    if (!id) {
      id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }
    var tabId = 'tab-' + id;
    var paneId = 'pane-' + id;

    if ($('#' + tabId).length) {
      $('#' + tabId).tab('show');
      return;
    }

    var tab = $('<a>')
      .attr('href', '#' + paneId)
      .attr('id', tabId)
      .append(icon)
      .append(
        $('<span>')
        .addClass('text')
        .append(title)
      )
      .click(function (event) {
        event.preventDefault();
        $(this).tab('show');
      })
      .each(chopUpTab)
      .each(addCloseButton)
      .tooltip({ placement: 'bottom' });

    $('ul.nav-tabs', container).append($('<li>').append(tab));

    $('div.tab-content', container).append(
      $('<div>')
      .addClass('tab-pane')
      .attr('id', paneId)
      .append(contents)
    );

    tab.tab('show');
  }
};

function chopUpTab(){
  var link = $(this);

  if(link.find('.inactive-label').tooltip({ placement: 'bottom' }).length){
    return;
  }

  var icon = link.find('i');
  var text = link.find('.text').text();

  link
  .wrapInner(
    $('<span>')
    .addClass('active-label')
  )
  .append(
    $('<span>')
    .addClass('inactive-label')
    .append(
      icon.clone()
    )
    .attr('title', text)
    .tooltip({ placement: 'bottom' })
  );
}

function addCloseButton(){
  $(this)
  .find('.active-label')
  .append(
    $('<i class="icon-remove" title="Close"></i>')
    .click(function (event) {
      var link = $(this).closest('a');

      $(link.attr('href')).remove();

      var list = link.closest('ul')

      link.closest('li').remove();

      list.children().first().find('a').click();

      event.preventDefault();
    })
  );
}

$('ul.nav-tabs a').each(chopUpTab);
