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

$stmt = $pdo->prepare(
	'SELECT h.name AS household_name
	 FROM users u
	 LEFT JOIN households h ON h.id = u.household_id
	 WHERE u.id = :user_id
	 LIMIT 1'
);
$stmt->execute([':user_id' => $userId]);
$row = $stmt->fetch(PDO::FETCH_ASSOC);

$householdMembers = [];

if ($row && !empty($row['household_name'])) {
	$membersStmt = $pdo->prepare(
		'SELECT firstname, lastname, email
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
