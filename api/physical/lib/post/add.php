<?php

/**
 * @var object $box
 */

$post_data = json_decode(file_get_contents("php://input"));

if (!isset($post_data->weight) || empty($post_data->weight) || !is_float($post_data->weight)) {
  http_response_code(400);
  echo json_encode(["status" => "error", "message" => "Bad request, weight is unknown or invalid"]);
  exit;
}

$input_weight = $post_data->weight;

/**
 * Find the new toy that has been added without a weight by the webapp
 */
$stmt = $pdo->prepare("SELECT id, name FROM toys WHERE weight = 0 AND household_id=:household_id");
$stmt->execute(['household_id' => $box->household_id]);
$new_toy = $stmt->fetch(PDO::FETCH_OBJ);

if (!isset($new_toy->id)) {
  http_response_code(500);
  echo json_encode(["status" => "error", "message" => "New toy couldn't be added"]);
  exit;
}

/**
 * insert the weight into the record
 */
$update = $pdo->prepare("UPDATE toys SET weight = :weight WHERE id=:id");
$update->execute(['id' => $new_toy->id, 'weight' => $input_weight]);

/**
 * Add first toy event, event was added to box
 */
$insert = $pdo->prepare("INSERT INTO toy_events (timestamp, toy_id, box_id, movement) VALUES (:timestamp, :toy_id, :box_id, :movement)");
$insert->execute(['timestamp' => time(), 'toy_id' => $new_toy->id, 'box_id' => $box->id, 'movement' => 1]);

/**
 * turn off add mode from the box when done
 */
$update = $pdo->prepare("UPDATE boxes SET add_mode = :add_mode WHERE household_id=:household_id");
$update->execute(['household_id' => $box->household_id, 'add_mode' => 0]);

$return_data = [
  'name' => $new_toy->name
];
