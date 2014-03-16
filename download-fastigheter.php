<?php
  
  ini_set('display_errors', 1);
  
  function get_char($value){
    if($value >= 0 && $value <= 25){
      return chr(97 + $value);
    }
    if($value == 26){
      return 'å';
    }
    if($value == 27){
      return 'ä';
    }
    if($value == 28){
      return 'ö';
    }
    
    die('unknown char: ' . $value);
  }



  /* DOWNLOAD OVERFLOWED QUERIES AGAIN */

  if(1){
    $dir_handle = opendir('output/fastigheter-long-names/');

    while($dir = readdir($dir_handle)){
      if(strpos($dir, '.xml') !== FALSE){
        $letters_prefix = substr($dir, 0, -4);

        // no aux or con files!...

        
        for($i = 0; $i <= 28; $i++){
          $letters = $letters_prefix . get_char($i);

          $file_path = 'output/fastigheter-long-names/output/' . $letters . '.xml';
          
          if(file_exists($file_path)){
            continue;
          }
          
          $contents = file_get_contents('http://openmap.stockholm.se/bios/webquery/app/baggis/web/web_query?_dc=1381945879834&1=' . $letters . '&section=property_suggest&resulttype=elements&filterCol=RESULT');
          
          if($contents == "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?>\r\n<dbresult rows=\"0\"/>\r\n"){
            file_put_contents($file_path, '');
            
            continue;
          }

          if(strpos($contents, '<dbresult rows="100">') !== FALSE){
            file_put_contents($file_path, $contents);
            continue;
          }


          for($j = 0; $j <= 28; $j++){
            $letters = $letters_prefix . get_char($i) . get_char($j);

            $file_path = 'output/fastigheter-long-names/output/' . $letters . '.xml';
          
            if(file_exists($file_path)){
              continue;
            }
            
            $contents = file_get_contents('http://openmap.stockholm.se/bios/webquery/app/baggis/web/web_query?_dc=1381945879834&1=' . $letters . '&section=property_suggest&resulttype=elements&filterCol=RESULT');
            
            if($contents == "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?>\r\n<dbresult rows=\"0\"/>\r\n"){
              file_put_contents($file_path, '');
              
              continue;
            }

            if(strpos($contents, '<dbresult rows="100">') !== FALSE){
              file_put_contents($file_path, $contents);
              continue;
            }

            for($k = 0; $k <= 28; $k++){
              $letters = $letters_prefix . get_char($i) . get_char($j) . get_char($k);

              $file_path = 'output/fastigheter-long-names/output/' . $letters . '.xml';
              
              if(file_exists($file_path)){
                continue;
              }
              
              $contents = file_get_contents('http://openmap.stockholm.se/bios/webquery/app/baggis/web/web_query?_dc=1381945879834&1=' . $letters . '&section=property_suggest&resulttype=elements&filterCol=RESULT');
        
              if($contents == "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?>\r\n<dbresult rows=\"0\"/>\r\n"){
                file_put_contents($file_path, '');
            
                continue;
              }

              file_put_contents($file_path, $contents);
            }
          }
        }
      }
    }
  }


  
  /* CREATE OVERFLOWED QUERIES IN FASTIGHETER-LONG-NAMES */

  if(0){
    for($i = 0; $i <= 28; $i++){
      for($j = 0; $j <= 28; $j++){
        for($k = 0; $k <= 28; $k++){
          $letters = get_char($i) . get_char($j) . get_char($k);

          $file_path = 'output/fastigheter/' . $letters . '.xml';

          if($letters == 'con' || $letters == 'aux'){
            $file_path = 'output/fastigheter/' . $letters . '-.xml';
          }
        
          $contents = file_get_contents($file_path);

          if(strpos($contents, '<dbresult rows="100">') !== FALSE){
            file_put_contents('output/fastigheter-long-names/' . $letters . '.xml', '');
          }
        }
      }
    }
  }


  
  /* DOWNLOAD IN FASTIGHETER */
  
  if(0){
    for($i = 0; $i <= 28; $i++){
      for($j = 0; $j <= 28; $j++){
        for($k = 0; $k <= 28; $k++){
          $letters = get_char($i) . get_char($j) . get_char($k);

          $file_path = 'output/fastigheter/' . $letters . '.xml';

          if($letters == 'con' || $letters == 'aux'){
            $file_path = 'output/fastigheter/' . $letters . '-.xml';
          }
          
          if(file_exists($file_path)){
            continue;
          }
          
          $contents = file_get_contents('http://openmap.stockholm.se/bios/webquery/app/baggis/web/web_query?_dc=1381945879834&1=' . $letters . '&section=property_suggest&resulttype=elements&filterCol=RESULT');
        
          if($contents == "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?>\r\n<dbresult rows=\"0\"/>\r\n"){
            file_put_contents($file_path, '');
            
            continue;
          }

          file_put_contents($file_path, $contents);
        }
      }
    }
  }

?>
<br>
complete