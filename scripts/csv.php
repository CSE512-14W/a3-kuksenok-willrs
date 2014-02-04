<?php

ini_set('memory_limit','16M');

$data_file = "data/ufo_awesome.json";

echo "sighted_at_timestamp|sighted_at_date|sighted_at_month|reported_at_timestamp|reported_at_date|reported_at_month|shape|duration|location|description\n";
$handle = fopen($data_file, "r");
if ($handle) {
	while (($line = fgets($handle)) !== false) {
		$line = json_decode($line, true);
		$sighted_at_timestamp = strtotime($line["sighted_at"]);
		$sighted_at_date = date("Y-m-d", $sighted_at_timestamp);
		$sighted_at_month = date("M", $sighted_at_timestamp);
		$reported_at_timestamp = strtotime($line["reported_at"]);
		$reported_at_date = date("Y-m-d", $reported_at_timestamp);
		$reported_at_month = date("M", $reported_at_timestamp);
		$desc = str_replace("|", ":", $line["description"]);
		$desc = str_replace("\n","\\n", $desc);
		echo $sighted_at_timestamp . "|" . $sighted_at_date . "|" . $sighted_at_month . "|" .
			$reported_at_timestamp . "|" . $reported_at_date . "|" . $reported_at_month . "|" .
			$line["shape"] . "|" . $line["duration"] . "|" . $line["location"] . "|" . $desc . "\n";
			
		//if(strlen($line["duration"]) > 0) {
		//	echo strtotime($line["duration"]) . "  <-- " . $line["duration"] . "\n";
		//	//break;
		//}
	}
}
	
?>