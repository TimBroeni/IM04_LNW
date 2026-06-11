<?php
// Spielzeug-Update- und Lösch-API
// - Benennt ein Spielzeug um oder löscht es inklusive zugehöriger Events
// - Wird von toys.html und js/toy.js genutzt
// - Holt household_id und prüft das betroffene Spielzeug in der toys-Tabelle
// - Schreibt Änderungen direkt in toys und toy_events
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
    exit;
}

require_once '../system/config.php';

$userId = (int) $_SESSION['user_id'];
$input = json_decode(file_get_contents('php://input'), true);

if (!is_array($input)) {
    $input = [];
}

$toyId = (int) ($input['toy_id'] ?? 0);
$action = trim($input['action'] ?? 'delete');

if ($toyId <= 0) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'toy_id is required']);
    exit;
}

$stmt = $pdo->prepare('SELECT household_id FROM users WHERE id = :user_id');
$stmt->execute([':user_id' => $userId]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user || empty($user['household_id'])) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Household missing']);
    exit;
}

$householdId = (int) $user['household_id'];

try {
    if ($action === 'update_name') {
        $toyName = trim($input['name'] ?? '');

        if ($toyName === '') {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'name is required']);
            exit;
        }

        $stmt = $pdo->prepare('SELECT id FROM toys WHERE id = :toy_id AND household_id = :household_id');
        $stmt->execute([
            ':toy_id' => $toyId,
            ':household_id' => $householdId,
        ]);

        if (!$stmt->fetch(PDO::FETCH_ASSOC)) {
            http_response_code(404);
            echo json_encode(['status' => 'error', 'message' => 'Toy not found']);
            exit;
        }

        $stmt = $pdo->prepare('UPDATE toys SET name = :name WHERE id = :toy_id AND household_id = :household_id');
        $stmt->execute([
            ':name' => $toyName,
            ':toy_id' => $toyId,
            ':household_id' => $householdId,
        ]);

        echo json_encode(['status' => 'success']);
        exit;
    }

    $stmt = $pdo->prepare('SELECT id FROM toys WHERE id = :toy_id AND household_id = :household_id');
    $stmt->execute([
        ':toy_id' => $toyId,
        ':household_id' => $householdId,
    ]);

    if (!$stmt->fetch(PDO::FETCH_ASSOC)) {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Toy not found']);
        exit;
    }

    $stmt = $pdo->prepare('DELETE FROM toy_events WHERE toy_id = :toy_id');
    $stmt->execute([':toy_id' => $toyId]);

    $stmt = $pdo->prepare('DELETE FROM toys WHERE id = :toy_id AND household_id = :household_id');
    $stmt->execute([
        ':toy_id' => $toyId,
        ':household_id' => $householdId,
    ]);

    echo json_encode(['status' => 'success']);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Could not delete toy']);
}