<?php

/**
 * @var object $box
 */

$post_data = json_decode(file_get_contents("php://input"));

if (!isset($post_data->weight) || empty($post_data->weight) || !is_float($post_data->weight) || $post_data->weight == 0) {
  http_response_code(400);
  echo json_encode(["status" => "error", "message" => "Bad request, weight is unknown or invalid"]);
  exit;
}

/**
 * find the toy by weight with a 5% margin
 */
$input_weight = $post_data->weight;
$min_weight = abs($input_weight) * 0.95;
$max_weight = abs($input_weight) * 1.05;

$stmt = $pdo->prepare("SELECT * FROM toys WHERE weight >= :min_weight AND weight <= :max_weight AND household_id=:household_id");
$stmt->execute([':min_weight' => $min_weight, ':max_weight' => $max_weight, ':household_id' => $box->household_id]);
$toys = $stmt->fetchAll(PDO::FETCH_OBJ);

/**
 * Find the closest toy the the mesured weight, incase multiple toys were in the 5% margin
 */
$weighed_toy = null;
$minDiff = PHP_INT_MAX;

foreach ($toys as $toy) {
  $diff = abs($toy->weight - $input_weight);
  if ($diff < $minDiff) {
    $minDiff = $diff;
    $weighed_toy = $toy;
  }
}

if ($weighed_toy === null) {
  http_response_code(404);
  echo json_encode(["status" => "error", "message" => "No matching toy found"]);
  exit;
}

/**
 * If the weight is negative, the toy was removed from the box
 * 1 = in
 * 0 = out
 */
if ($input_weight > 0) {
  $movement = 1;
} else {
  $movement = 0;
}

$insert = $pdo->prepare("INSERT INTO toy_events (timestamp, toy_id, box_id, movement) VALUES (:timestamp, :toy_id, :box_id, :movement)");
$insert->execute(['timestamp' => time(), 'toy_id' => $weighed_toy->id, 'box_id' => $box->id, 'movement' => $movement]);

$return_data = [
  'name' => $weighed_toy->name,
  'movement' => $movement
];
