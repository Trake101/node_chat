<?php

error_reporting(E_ALL ^ E_NOTICE);
ini_set('display_errors', '1');

$url = 'http://fusion.learninghouse.com/mod/fusionchat/chatauth.php';

$fields = array(
            'userid'=>urlencode(2),
            'courseid'=>urlencode(2),
        );

foreach($fields as $key=>$value) { $fields_string .= $key.'='.$value.'&'; }
rtrim($fields_string,'&');

$ch = curl_init();

curl_setopt($ch,CURLOPT_URL,$url.'?'.$fields_string);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
//curl_s
$data = curl_exec($ch);

curl_close($ch);

echo $data;

?>
