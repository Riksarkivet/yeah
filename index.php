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
        <div id="main-column-tabs">
          <ul class="nav nav-tabs">
            <li class="active"><a href="#map" data-toggle="tab">
              <i class="icon-th"></i><span class="text">Map</span>
            </a></li>
          </ul>
          <div class="tab-content">
            <div class="tab-pane active" id="map">
              <div id="map-canvas"></div>
            </div>
          </div>
        </div>
        
        <div class="row">
          <div class="col-sm-6">
            <div id="block-container">
              <ul class="nav nav-tabs"></ul>
              <div class="tab-content"></div>
            </div>
          </div>
          <div class="col-sm-6">
            <div class="raw-data-container">
              <ul class="nav nav-tabs"></ul>
              <div class="tab-content"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-sm-4">
        <ul class="nav nav-tabs">
          <li class="active">
            <a href="#permits" data-toggle="tab">
              <span class="active-label">
                <i class="icon-building"></i>
                <span class="text">Building permits</span>
              </span>
              <span class="inactive-label" title="Building permits"><i class="icon-building"></i></span>
            </a>
          </li>
          <li>
            <a href="#persons" data-toggle="tab">
              <span class="active-label">
                <i class="icon-group"></i>
                <span class="text">Persons</span>
              </span>
              <span class="inactive-label" title="Persons"><i class="icon-group"></i></span>
            </a>
          </li>
          <li>
            <a href="#blocks" data-toggle="tab">
              <span class="active-label">
                <i class="icon-map-marker"></i>
                <span class="text">Blocks</span>
              </span>
              <span class="inactive-label" title="Blocks"><i class="icon-map-marker"></i></span>
            </a>
          </li>
          <li>
            <a href="#streets" data-toggle="tab">
              <span class="active-label">
                <i class="icon-road"></i>
                <span class="text">Streets</span>
              </span>
              <span class="inactive-label" title="Streets"><i class="icon-road"></i></span>
            </a>
          </li>
        </ul>

        <div class="tab-content">
          <div class="tab-pane active" id="permits">
            <form>
              <div class="input-group">
                <span class="input-group-btn">
                  <select style="width: 70px;">
                    <option value="*">Find</option>
                  </select>
                </span>
                <input type="text" class="form-control">
                <span class="input-group-btn">
                  <button class="btn btn-default" type="button"><i class="icon-search"></i></button>
                </span>
              </div>
            </form>
            <div id="permits-list"></div>
            <div id="permits-pager"></div>
          </div>
          <div class="tab-pane" id="persons">
            <div class="alert alert-warning">This data comes from <a href="http://en.wikipedia.org/wiki/Census_in_Sweden" target="_blank">census data</a> (1760).</div>
            <form>
              <div class="input-group">
                <span class="input-group-btn">
                  <select style="width: 70px;">
                    <option value="*">Find</option>
                  </select>
                </span>
                <input type="text" class="form-control">
                <span class="input-group-btn">
                  <button class="btn btn-default" type="button"><i class="icon-search"></i></button>
                </span>
              </div>
            </form>
            <div id="persons-list"></div>
            <div id="persons-pager"></div>
          </div>
          <div class="tab-pane" id="blocks">
            <!--<div class="alert alert-warning">This data comes from <a href="http://www.unesco.org/new/en/communication-and-information/flagship-project-activities/memory-of-the-world/register/full-list-of-registered-heritage/registered-heritage-page-8/stockholm-city-planning-committee-archives/#c200831">building permits</a>.</div>-->
            <div class="alert alert-warning">This data is aggregated/normalized from <a href="http://www.unesco.org/new/en/communication-and-information/flagship-project-activities/memory-of-the-world/register/full-list-of-registered-heritage/registered-heritage-page-8/stockholm-city-planning-committee-archives/#c200831" target="_blank">building permits</a> and <a href="http://en.wikipedia.org/wiki/Census_in_Sweden" target="_blank">census data</a> (1760).</div>
            <form>
              <div class="input-group">
                <span class="input-group-btn">
                  <select style="width: 70px;">
                    <option value="*">Find</option>
                  </select>
                </span>
                <input type="text" class="form-control">
                <span class="input-group-btn">
                  <button class="btn btn-default" type="button"><i class="icon-search"></i></button>
                </span>
              </div>
            </form>
            <div id="blocks-list"></div>
            <div id="blocks-pager"></div>
          </div>
          <div class="tab-pane" id="streets">
            <div class="alert alert-warning">This data comes from <a href="http://www.ssa.stockholm.se/en/Forskarsal/Search-Tools/Rotemansarkiv/" target="_blank">Roteman archives</a> (1878-1926).</div>
            <form>
              <div class="input-group">
                <span class="input-group-btn">
                  <select style="width: 70px;">
                    <option value="*">Find</option>
                    <option value="street">Find by street name</option>
                    <option value="block">Find by block name</option>
                  </select>
                </span>
                <input type="text" class="form-control">
                <span class="input-group-btn">
                  <button class="btn btn-default" type="button"><i class="icon-search"></i></button>
                </span>
              </div>
            </form>
            <div id="streets-list"></div>
            <div id="streets-pager"></div>
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
  <script src="scripts/building-permit.js"></script>
  <script src="scripts/persons.js"></script>
  <script src="scripts/parish.js"></script>
  <script src="scripts/street.js"></script>
  <script src="scripts/raw-data.js"></script>
  <script src="scripts/property.js"></script>
  <script src="scripts/map.js"></script>
  <script src="scripts/logger.js"></script>
  <script src="scripts/block.js"></script>
  <script src="scripts/query-executer.js"></script>
  <script src="scripts/main.js"></script>
</body>
</html>
