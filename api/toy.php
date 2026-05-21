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
    ]);
    exit;
}

$stmt = $pdo->prepare('SELECT COUNT(*) AS toys_total FROM toys WHERE household_id = :household_id');
$stmt->execute([':household_id' => (int) $user['household_id']]);
$count = (int) ($stmt->fetch(PDO::FETCH_ASSOC)['toys_total'] ?? 0);

echo json_encode([
    'status' => 'success',
    'toys_total' => $count,
]);