<?php

/**
 * @var object $box
 */

/**
 * box is in add_mode or not
 */
$stmt = $pdo->prepare("SELECT add_mode FROM boxes WHERE id=:box_id");
$stmt->execute(['box_id' => $box->id]);
$box = $stmt->fetch(PDO::FETCH_OBJ);

$return_data = [
  'add_mode' => $box->add_mode ? true : false
];
