<?php
  
  $content = @file_get_contents('http://130.240.234.101:8890/sparql?query=' . urlencode($_REQUEST['query']) . '&format=json');
  
  if (strpos($http_response_header[0], "200")) { 
     echo $content;
  } else { 
     echo "{}";
  }