<?php

session_start();
header('Content-Type: application/json');

include_once '../system/config.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit;
}

$userID = $_SESSION['user_id'];

$stmt = $pdo->prepare("SELECT * FROM users WHERE id = :userID");
$stmt->execute([':userID' => $userID]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    http_response_code(404);
    echo json_encode(["status" => "error", "message" => "User not found"]);
    exit;
}

$boxesTotal = 0;
$toysTotal = 0;
$toysSorted = 0;
$outsideToys = [];
$householdName = 'Dein Zuhause';

if (!empty($user['household_id'])) {
    $stmt = $pdo->prepare("SELECT name FROM households WHERE id = :household_id LIMIT 1");
    $stmt->execute([':household_id' => (int) $user['household_id']]);
    $household = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!empty($household['name'])) {
        $householdName = $household['name'];
    }

    $stmt = $pdo->prepare("SELECT COUNT(*) AS toys_total FROM toys WHERE household_id = :household_id");
    $stmt->execute([':household_id' => (int) $user['household_id']]);
    $toysTotal = (int) ($stmt->fetch(PDO::FETCH_ASSOC)['toys_total'] ?? 0);

    $stmt = $pdo->prepare("SELECT COUNT(*) AS boxes_total FROM boxes WHERE household_id = :household_id");
    $stmt->execute([':household_id' => (int) $user['household_id']]);
    $boxesTotal = (int) ($stmt->fetch(PDO::FETCH_ASSOC)['boxes_total'] ?? 0);

    $stmt = $pdo->prepare("SELECT COUNT(*) AS toys_sorted FROM toy_events te INNER JOIN boxes b ON b.id = te.box_id INNER JOIN ( SELECT te2.toy_id, MAX(te2.id) AS max_id FROM toy_events te2 INNER JOIN boxes b2 ON b2.id = te2.box_id WHERE b2.household_id = :household_id GROUP BY te2.toy_id ) latest ON latest.max_id = te.id WHERE b.household_id = :household_id AND te.movement = 1");
    $stmt->execute([':household_id' => (int) $user['household_id']]);
    $toysSorted = (int) ($stmt->fetch(PDO::FETCH_ASSOC)['toys_sorted'] ?? 0);

    $stmt = $pdo->prepare("SELECT t.id, t.name, latest_event.timestamp, latest_event.movement FROM toys t LEFT JOIN ( SELECT te1.toy_id, te1.timestamp, te1.movement FROM toy_events te1 INNER JOIN ( SELECT toy_id, MAX(id) AS max_id FROM toy_events GROUP BY toy_id ) latest ON latest.toy_id = te1.toy_id AND latest.max_id = te1.id ) latest_event ON latest_event.toy_id = t.id WHERE t.household_id = :household_id AND (latest_event.movement IS NULL OR latest_event.movement = 0) ORDER BY COALESCE(latest_event.timestamp, 0) ASC, t.name ASC");
    $stmt->execute([':household_id' => (int) $user['household_id']]);

    foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $toy) {
        $outsideToys[] = [
            'id' => (int) $toy['id'],
            'name' => $toy['name'],
            'timestamp' => isset($toy['timestamp']) ? (int) $toy['timestamp'] : 0,
        ];
    }
}

echo json_encode([
    "status" => "success",
    "user_id" => $user['id'],
    "email" => $user['email'],
    "firstname" => $user['firstname'],
    "lastname" => $user['lastname'],
    "household_name" => $householdName,
    "toys_total" => $toysTotal,
    "boxes_total" => $boxesTotal,
    "toys_sorted" => $toysSorted,
    "all_toys_sorted" => $toysTotal > 0 && $toysSorted >= $toysTotal,
    "outside_toys" => $outsideToys,
]);
