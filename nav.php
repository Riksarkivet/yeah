  <nav class="navbar navbar-inverse navbar-fixed" role="navigation">
    <div class="container">
      <!-- Brand and toggle get grouped for better mobile display -->
      <div class="navbar-header">
        <button type="button" class="navbar-toggle" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1">
          <span class="sr-only">Toggle navigation</span>
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
        </button>
        <a class="navbar-brand" href="ldb-centrum.se/yeah/yeah-sthlm" data-toggle="tooltip" data-placement="bottom" title="You! Enhance Access to History"><abbr>YEAH!</abbr></a>
      </div>
      
      <ul class="nav navbar-nav">
        <li><a href="http://www.ltu.se/research/subjects/Informatik/forskningsprojekt/YEAH-You-Enhance-Access-to-History-1.86175?l=en"><i class="icon-external-link"></i> About</a></li>
        <li class="dropdown">
          <a href="#" class="dropdown-toggle" data-toggle="dropdown"><span>SPARQL log</span> <b class="icon-caret-down"></b></a>
          <ul class="dropdown-menu" id="sparql-log">
          </ul>
        </li>
        <li><a href="javascript: queryExecuter.add('SPARQL', '# ' + (new Date()).getTime(), {});">New SPARQL Query</a></li>
        <li><a href="http://130.240.234.101:8890/" target="_blank">Open Virtuoso</a></li>
      </ul>
    </div>
  </nav>