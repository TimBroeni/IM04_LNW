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

$stmt = $pdo->prepare(
	'SELECT h.name AS household_name
	 FROM users u
	 LEFT JOIN households h ON h.id = u.household_id
	 WHERE u.id = :user_id
	 LIMIT 1'
);
$stmt->execute([':user_id' => $userId]);
$row = $stmt->fetch(PDO::FETCH_ASSOC);

if ($action === 'remove_member') {
	$memberId = (int) ($input['member_id'] ?? 0);

	if ($memberId <= 0) {
		http_response_code(400);
		echo json_encode(['status' => 'error', 'message' => 'member_id is required']);
		exit;
	}

	$memberStmt = $pdo->prepare(
		'SELECT id FROM users
		 WHERE id = :member_id
		 AND household_id = (SELECT household_id FROM users WHERE id = :user_id LIMIT 1)'
	);
	$memberStmt->execute([
		':member_id' => $memberId,
		':user_id' => $userId,
	]);

	if (!$memberStmt->fetch(PDO::FETCH_ASSOC)) {
		http_response_code(404);
		echo json_encode(['status' => 'error', 'message' => 'Member not found']);
		exit;
	}

	$deleteStmt = $pdo->prepare('UPDATE users SET household_id = NULL WHERE id = :member_id');
	$deleteStmt->execute([':member_id' => $memberId]);

	echo json_encode(['status' => 'success']);
	exit;
}

$householdMembers = [];

if ($row && !empty($row['household_name'])) {
	$membersStmt = $pdo->prepare(
		'SELECT id, firstname, lastname, email
		 FROM users
		 WHERE household_id = (
		 	SELECT household_id FROM users WHERE id = :user_id LIMIT 1
		 )
		 ORDER BY firstname ASC, lastname ASC, id ASC'
	);
	$membersStmt->execute([':user_id' => $userId]);
	$householdMembers = $membersStmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
}

if (!$row || empty($row['household_name'])) {
	echo json_encode([
		'status' => 'success',
		'household_name' => null,
		'household_members' => [],
	]);
	exit;
}

echo json_encode([
	'status' => 'success',
	'household_name' => $row['household_name'],
	'household_members' => $householdMembers,
]);
