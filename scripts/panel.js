var panel = {
  create: function (title, contents) {
    var panel = $('<div>').addClass('panel panel-default');

    panel.append('<div class="panel-heading"><h3 class="panel-title">' + title + '</h3></div>');

    var panelBody = $('<div>').addClass('panel-body').appendTo(panel);

    panelBody.append(contents);

    return panel;
  }
};