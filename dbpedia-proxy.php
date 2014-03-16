<?php
  
  $content = @file_get_contents('http://dbpedia.org/sparql?query=' . urlencode($_REQUEST['query']) . '&format=json');
  
  if (strpos($http_response_header[0], "200")) { 
     echo $content;
  } else { 
     echo "{}";
  }