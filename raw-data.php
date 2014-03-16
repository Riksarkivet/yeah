<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>YEAH! project</title>
    
  <?php
    ini_set('display_errors', 1);

    require dirname(__FILE__) . '/vendor/leafo/lessphp/lessc.inc.php';

    if(!file_exists(dirname(__FILE__) . '/styles/compiled')){
      mkdir(dirname(__FILE__) . '/styles/compiled');
    }

    $less = new lessc;
      
    $less->compileFile(dirname(__FILE__) . '/styles/bootstrap.less', dirname(__FILE__) . '/styles/compiled/style.css');
  ?>
  <link rel="stylesheet" href="styles/compiled/style.css" />
  <link rel="stylesheet" href="vendor/codemirror/codemirror/lib/codemirror.css">
</head>
<body>
  <?php include 'nav.php'; ?>
  <div class="" style="padding: 0 15px">
    <div class="row">
      <div class="col-sm-8">
        <div id="main-column-tabs" class="raw-data-container">
          <ul class="nav nav-tabs">
          </ul>
          <div class="tab-content">
          </div>
        </div>
      </div>
    </div>
  </div>

  <script src="vendor/codemirror/codemirror/lib/codemirror.js"></script>
  <script src="vendor/codemirror/codemirror/addon/edit/matchbrackets.js"></script>
  <script src="vendor/codemirror/codemirror/mode/sparql/sparql.js"></script>
  
  <script src="components/jquery/jquery.min.js"></script>
  <script src="components/underscore/underscore-min.js"></script>
  <script src="https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false"></script>
  <script src="vendor/twitter/bootstrap/js/tab.js"></script>
  <script src="vendor/twitter/bootstrap/js/tooltip.js"></script>
  <script src="vendor/twitter/bootstrap/js/dropdown.js"></script>
  <script src="vendor/moment/moment/min/moment.min.js"></script>
  <script src="scripts/tab.js"></script>
  <script src="scripts/sparql.js"></script>
  <script src="scripts/shortcuts.js"></script>
  <script src="scripts/pager.js"></script>
  <script src="scripts/panel.js"></script>
  <script src="scripts/raw-data.js"></script>
  <script src="scripts/property.js"></script>
  <script src="scripts/logger.js"></script>
  <script src="scripts/query-executer.js"></script>
  <script src="scripts/main.js"></script>

  <script>
    rawData.show('<?php echo $_GET['uri']; ?>', '<?php echo $_GET['graph']; ?>', '<?php echo $_GET['title']; ?>', '<?php echo $_GET['icon']; ?>');
  </script>
</body>
</html>
