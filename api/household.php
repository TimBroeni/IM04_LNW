<?php
// Haushalt-API
// - Verarbeitet das Erstellen und Beitreten zu Haushalten
// - Wird von household.html, join_household.js und new_household.js genutzt
// - Holt den aktuellen user.household_id und sucht Haushalte per Code
// - Schreibt neue Haushalte an und aktualisiert die Zuordnung des Nutzers
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
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

if (!$user) {
    http_response_code(404);
    echo json_encode(["status" => "error", "message" => "User not found"]);
    exit;
}

if (!empty($user['household_id'])) {
    echo json_encode([
        'status' => 'success',
        'message' => 'User already has a household',
        'household_id' => (int) $user['household_id'],
    ]);
    exit;
}

try {
    if ($action === 'create') {
        $householdName = trim($input['household_name'] ?? '');

        if ($householdName === '') {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "household_name is required"]);
            exit;
        }

        $code = generateHouseholdCode();

        $pdo->beginTransaction();

        $stmt = $pdo->prepare('INSERT INTO households (name, code) VALUES (:name, :code)');
        $stmt->execute([
            ':name' => $householdName,
            ':code' => $code,
        ]);

        $householdId = (int) $pdo->lastInsertId();

        $stmt = $pdo->prepare('UPDATE users SET household_id = :household_id WHERE id = :user_id');
        $stmt->execute([
            ':household_id' => $householdId,
            ':user_id' => $userId,
        ]);

        $pdo->commit();

        $_SESSION['household_id'] = $householdId;

        echo json_encode([
            'status' => 'success',
            'action' => 'create',
            'household_id' => $householdId,
            'code' => $code,
        ]);
        exit;
    }

    if ($action === 'join') {
        $code = strtoupper(trim($input['code'] ?? ''));

        if ($code === '') {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "code is required"]);
            exit;
        }

        $stmt = $pdo->prepare('SELECT id, name, code FROM households WHERE code = :code LIMIT 1');
        $stmt->execute([':code' => $code]);
        $household = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$household) {
            http_response_code(404);
            echo json_encode(["status" => "error", "message" => "Household code not found"]);
            exit;
        }

        $pdo->beginTransaction();

        $stmt = $pdo->prepare('UPDATE users SET household_id = :household_id WHERE id = :user_id');
        $stmt->execute([
            ':household_id' => (int) $household['id'],
            ':user_id' => $userId,
        ]);

        $pdo->commit();

        $_SESSION['household_id'] = (int) $household['id'];

        echo json_encode([
            'status' => 'success',
            'action' => 'join',
            'household_id' => (int) $household['id'],
            'household_name' => $household['name'],
        ]);
        exit;
    }

    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid action"]);
} catch (Throwable $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Could not process household request'
    ]);
}

function generateHouseholdCode(int $length = 6): string
{
    $characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    $code = '';

    for ($i = 0; $i < $length; $i++) {
        $code .= $characters[random_int(0, strlen($characters) - 1)];
    }

    return $code;
}
