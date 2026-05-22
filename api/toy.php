<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
    exit;
}

require_once '../system/config.php';

$userId = (int) $_SESSION['user_id'];

$stmt = $pdo->prepare('SELECT household_id FROM users WHERE id = :user_id');
$stmt->execute([':user_id' => $userId]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user || empty($user['household_id'])) {
    echo json_encode([
        'status' => 'success',
        'toys_total' => 0,
        'toys' => [],
    ]);
    exit;
}

$stmt = $pdo->prepare('SELECT COUNT(*) AS toys_total FROM toys WHERE household_id = :household_id');
$stmt->execute([':household_id' => (int) $user['household_id']]);
$count = (int) ($stmt->fetch(PDO::FETCH_ASSOC)['toys_total'] ?? 0);

$stmt = $pdo->prepare("SELECT t.id, t.name, COALESCE(latest_event.movement, 0) AS movement, latest_event.timestamp AS event_timestamp, COALESCE(weekly_removals.weekly_removals, 0) AS weekly_removals FROM toys t LEFT JOIN ( SELECT te1.toy_id, te1.movement, te1.timestamp FROM toy_events te1 INNER JOIN ( SELECT toy_id, MAX(id) AS max_id FROM toy_events GROUP BY toy_id ) latest ON latest.toy_id = te1.toy_id AND latest.max_id = te1.id ) latest_event ON latest_event.toy_id = t.id LEFT JOIN ( SELECT toy_id, COUNT(*) AS weekly_removals FROM toy_events WHERE movement = 0 AND timestamp >= :week_start GROUP BY toy_id ) weekly_removals ON weekly_removals.toy_id = t.id WHERE t.household_id = :household_id ORDER BY t.name ASC");
$weekStart = time() - (7 * 24 * 60 * 60);
$stmt->execute([':household_id' => (int) $user['household_id'], ':week_start' => $weekStart]);
$toys = [];

foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $toy) {
    $toys[] = [
        'id' => (int) $toy['id'],
        'name' => $toy['name'],
        'movement' => (int) $toy['movement'],
        'timestamp' => isset($toy['event_timestamp']) ? (int) $toy['event_timestamp'] : 0,
        'weekly_removals' => (int) ($toy['weekly_removals'] ?? 0),
        'status' => ((int) $toy['movement'] === 1) ? 'In Kiste' : 'Draussen',
    ];
}

echo json_encode([
    'status' => 'success',
    'toys_total' => $count,
    'toys' => $toys,
]);