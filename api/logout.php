<?php
// Logout-API
// - Beendet die aktuelle Session und meldet den Nutzer ab
// - Wird von logout.js und den Logout-Buttons in settings.html/profil.html genutzt
// - Holt keine Daten aus der Datenbank
// - Liefert nur eine JSON-Antwort für den erfolgreichen Abmeldeprozess
session_start();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    header('Content-Type: application/json');
    echo json_encode(["error" => "Method Not Allowed"]);
    exit;
}

$_SESSION = [];
session_destroy();

// Return a success response instead of redirecting
header('Content-Type: application/json');
echo json_encode(["status" => "success"]);
exit;
?>