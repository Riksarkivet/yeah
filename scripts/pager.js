function pager(size, current, callback){
  var pagination = $('<ul>')
  .addClass('pagination')
  .addClass('pagination-sm');

  $('<li>').addClass(number == 1 ? 'disabled' : '').append(
    $('<a>')
    .attr('href', '#')
    .click(function (event) {
      callback(Math.max(1, current - 1));
      event.preventDefault();
    })
    .append('<i class="icon-angle-left"></i>')
    .attr('title', 'Go to previous page')
  ).appendTo(pagination);

  for (var number = 1; number <= Math.max(current, size); number++) {
    var numberIsAroundCurrentPage = number > current - 2 && number < current + 2;
    var numberIsCloseToFirstPage = number < 2;
    var numberIsCloseToLastPage = (size != 0 && number > size - 1);

    if(!numberIsAroundCurrentPage && !numberIsCloseToFirstPage && !numberIsCloseToLastPage){
      if(pagination.children().last().is('.ellipsis')){
        continue;
      }

      pagination.append(
        $('<li>')
        .addClass('ellipsis')
        .append(
          $('<a>')
          .attr('href', '#')
          .append('&hellip;</i>')
          .click(function (event) {
            var page = prompt(size == 0 ? 'Enter a page number' : 'Enter a page number (1-' + size + ')');

            if (page || page === 0) {
              callback(page);
            }

            event.preventDefault();
          })
          .attr('title', 'Enter a page number')
        )
      );

      continue;
    }

    $('<li>').addClass(number == current ? 'active' : '').append(
      $('<a>')
      .attr('href', '#')
      .click((function(number){return function (event) {
        callback(number);
        event.preventDefault();
      }})(number))
      .append(number)
    ).appendTo(pagination);
  }

  if(size == 0){
    pagination.append(
      $('<li>')
      .addClass('ellipsis')
      .append(
        $('<a>')
        .attr('href', '#')
        .append('&hellip;</i>')
        .click(function (event) {
          var page = prompt(size == 0 ? 'Enter a page number' : 'Enter a page number (1-' + size + ')');

          if(page || page === 0){
            callback(page);
          }

          event.preventDefault();
        })
        .attr('title', 'Enter a page number')
      )
    );
  }

  $('<li>').addClass(number == size && size != 0 ? 'disabled' : '').append(
    $('<a>')
    .attr('href', '#')
    .click(function (event) {
      callback(size != 0 ? Math.min(size, current + 1) : current + 1);
      event.preventDefault();
    })
    .append('<i class="icon-angle-right"></i>')
    .attr('title', 'Go to next page')
  ).appendTo(pagination);

  return pagination;
}