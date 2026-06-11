<?php
// Kisten-API
// - Legt eine bestehende Sortino-Kiste dem aktuellen Haushalt zu
// - Wird von new_box.html und new_box.js aufgerufen
// - Holt die household_id des Nutzers und prüft die Box über die Seriennummer
// - Schreibt name, household_id und add_mode in die boxes-Tabelle
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
		$serialnumber = strtoupper(trim($input['serialnumber'] ?? ''));
		$boxName = trim($input['name'] ?? '');

		if ($serialnumber === '') {
			http_response_code(400);
			echo json_encode(['status' => 'error', 'message' => 'serialnumber is required']);
			exit;
		}

		if ($boxName === '') {
			http_response_code(400);
			echo json_encode(['status' => 'error', 'message' => 'name is required']);
			exit;
		}

		$stmt = $pdo->prepare('SELECT id, serialnumber FROM boxes WHERE serialnumber = :serialnumber LIMIT 1');
		$stmt->execute([':serialnumber' => $serialnumber]);
		$box = $stmt->fetch(PDO::FETCH_ASSOC);

		if (!$box) {
			http_response_code(404);
			echo json_encode(['status' => 'error', 'message' => 'Die Seriennummer ist falsch.']);
			exit;
		}

		$stmt = $pdo->prepare('UPDATE boxes SET name = :name, household_id = :household_id, add_mode = 0 WHERE id = :box_id');
		$stmt->execute([
			':name' => $boxName,
			':household_id' => $householdId,
			':box_id' => (int) $box['id'],
		]);

		$_SESSION['box_id'] = (int) $box['id'];
		$_SESSION['box_serialnumber'] = $serialnumber;

		echo json_encode([
			'status' => 'success',
			'box_id' => (int) $box['id'],
			'serialnumber' => $serialnumber,
			'name' => $boxName,
		]);
		exit;
	}

	http_response_code(400);
	echo json_encode(['status' => 'error', 'message' => 'Invalid action']);
} catch (Throwable $e) {
	http_response_code(500);
	echo json_encode(['status' => 'error', 'message' => 'Could not process box request']);
}
