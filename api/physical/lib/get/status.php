<?php

/**
 * @var object $box
 */

/**
 * Select the last toy_event of each toy (knowing the last movement, says is the toy is currently in the box or not) 
 * and count the total in/out movements
 */

$stmt = $pdo->prepare("SELECT
    COUNT(CASE WHEN movement = 1 THEN 1 END) AS in_box,
    COUNT(CASE WHEN movement = 0 THEN 1 END) AS out_box
FROM (
SELECT t.toy_id, t.movement, boxes.household_id FROM toy_events AS t 
  JOIN (
        SELECT toy_id, MAX(toy_events.id) AS max_id
        FROM toy_events
        JOIN boxes ON toy_events.box_id=boxes.id
        WHERE household_id = :household_id
        GROUP BY toy_id
       ) AS mx
  ON t.toy_id = mx.toy_id
  AND t.id = mx.max_id
  JOIN boxes ON t.box_id=boxes.id
  WHERE boxes.household_id = :household_id
) t;");
$stmt->execute(['household_id' => $box->household_id]);
$toy_events = $stmt->fetch(PDO::FETCH_OBJ);

$return_data = [
  'all_in_box' => $toy_events->out_box == 0 ? true : false,
  'in_box' => intval($toy_events->in_box),
  'out_box' => intval($toy_events->out_box)
];
