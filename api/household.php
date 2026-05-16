<?php
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

$householdName = trim($input['household_name'] ?? '');

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
        "status" => "success",
        "message" => "User already has a household",
        "household_id" => (int) $user['household_id']
    ]);
    exit;
}

if ($householdName === '') {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "household_name is required"]);
    exit;
}

$code = generateHouseholdCode();

$pdo->beginTransaction();

try {
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
        'household_id' => $householdId,
        'code' => $code,
    ]);
} catch (Throwable $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Could not create household'
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
