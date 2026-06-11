<?php
// Profil-Lese-API
// - Liefert die aktuellen Profildaten des angemeldeten Nutzers zurück
// - Wird von profil.html, profil.js und data.js verwendet
// - Holt id, E-Mail, Vorname, Nachname und household_id aus der users-Tabelle
// - Dient als Datenquelle für das Bearbeitungsformular
session_start();

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit;
}

include_once '../system/config.php';

$userID = $_SESSION['user_id'];

$stmt = $pdo->prepare("SELECT * FROM users WHERE id = :userID");
$stmt->execute([':userID' => $userID]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    http_response_code(404);
    echo json_encode(["status" => "error", "message" => "User not found"]);
    exit;
}

echo json_encode([
    "status" => "success",
    "user_id" => $user['id'],
    "email" => $user['email'],
    "firstname" => $user['firstname'],
    "lastname" => $user['lastname'],
    "household_id" => $user['household_id']
]);