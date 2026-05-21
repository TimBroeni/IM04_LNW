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
$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput, true);

if (!is_array($input)) {
    $input = $_POST;
}

$action = trim($input['action'] ?? '');

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
    if ($action === 'create') {
        $toyName = trim($input['name'] ?? '');

        if ($toyName === '') {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'name is required']);
            exit;
        }

        if (!empty($_SESSION['toy_id'])) {
            $deleteStmt = $pdo->prepare('DELETE FROM toys WHERE id = :toy_id AND household_id = :household_id');
            $deleteStmt->execute([
                ':toy_id' => (int) $_SESSION['toy_id'],
                ':household_id' => $householdId,
            ]);
            unset($_SESSION['toy_id'], $_SESSION['toy_name']);
        }

        $stmt = $pdo->prepare('INSERT INTO toys (name, weight, household_id) VALUES (:name, :weight, :household_id)');
        $stmt->execute([
            ':name' => $toyName,
            ':weight' => 0,
            ':household_id' => $householdId,
        ]);

        $toyId = (int) $pdo->lastInsertId();

        $stmt = $pdo->prepare('UPDATE boxes SET add_mode = 1 WHERE household_id = :household_id');
        $stmt->execute([
            ':household_id' => $householdId,
        ]);

        $_SESSION['toy_id'] = $toyId;
        $_SESSION['toy_name'] = $toyName;

        echo json_encode([
            'status' => 'success',
            'toy_id' => $toyId,
            'name' => $toyName,
        ]);
        exit;
    }

    if ($action === 'status') {
        if (empty($_SESSION['toy_id'])) {
            http_response_code(404);
            echo json_encode(['status' => 'error', 'message' => 'No toy draft found']);
            exit;
        }

        $stmt = $pdo->prepare('SELECT t.id, t.name, t.weight, b.add_mode FROM toys t LEFT JOIN boxes b ON b.household_id = t.household_id WHERE t.id = :toy_id AND t.household_id = :household_id ORDER BY b.id DESC LIMIT 1');
        $stmt->execute([
            ':toy_id' => (int) $_SESSION['toy_id'],
            ':household_id' => $householdId,
        ]);
        $toy = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$toy) {
            http_response_code(404);
            echo json_encode(['status' => 'error', 'message' => 'Toy not found']);
            exit;
        }

        echo json_encode([
            'status' => 'success',
            'toy_id' => (int) $toy['id'],
            'name' => $toy['name'],
            'weight' => (float) $toy['weight'],
            'add_mode' => !empty($toy['add_mode']) ? 1 : 0,
        ]);
        exit;
    }

    if ($action === 'delete') {
        if (!empty($_SESSION['toy_id'])) {
            $stmt = $pdo->prepare('DELETE FROM toys WHERE id = :toy_id AND household_id = :household_id');
            $stmt->execute([
                ':toy_id' => (int) $_SESSION['toy_id'],
                ':household_id' => $householdId,
            ]);
        }

        unset($_SESSION['toy_id'], $_SESSION['toy_name']);

        echo json_encode(['status' => 'success']);
        exit;
    }

    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid action']);
} catch (Throwable $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Could not process toy request']);
}