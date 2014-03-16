<?php
  
  ini_set('display_errors', 1);
  
  $contents = file_get_contents('http://openmap.stockholm.se/bios/webquery/app/baggis/web/web_query?_dc=1381959771625&1=' . urlencode($_REQUEST['block']) . '&section=locate*property&outcoordsys=EPSG%3A5850');

  include_once(".system/vendor/jsor/proj4php/src/proj4php/proj4php.php");
  
  $proj4 = new Proj4php();
  
  Proj4php::$defs["EPSG:5850"] = "+proj=tmerc +lat_0=0 +lon_0=18 +k=1 +x_0=150000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs";
  
  $projSthlm = new Proj4phpProj('EPSG:5850',$proj4);
  $projWGS84 = new Proj4phpProj('EPSG:4326',$proj4);

  $response = array();
  
  foreach(simplexml_load_string($contents) as $row){
    $row = $row->attributes();

    
    $pointSrc = new proj4phpPoint($row->X,$row->Y);
    $point = $proj4->transform($projSthlm,$projWGS84,$pointSrc);

    $point = $point->toShortString();
    $point = explode(' ', $point);

    $response[] = (object) array(
      'block' => (string) $row->TRAKT,
      'lat' => $point[1],
      'lon' => $point[0],
      'fnr' => (string) $row->FNR,
      'fbetnr' => (string) $row->FBETNR,
    );
  }

  echo json_encode($response);