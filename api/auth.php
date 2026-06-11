<?php
// Authentifizierungs-API
// - Prüft die aktive Session und liefert die angemeldete user_id zurück
// - Wird von geschützten HTML- und JavaScript-Dateien zusammen mit auth.js genutzt
// - Holt keine Daten aus der Datenbank, sondern arbeitet mit der Session
// - Dient als Grundlage für den Zugriffsschutz in der gesamten Anwendung
session_start();

if (!isset($_SESSION['user_id'])) {
    // Instead of redirect, return a 401 JSON response
    http_response_code(401);
    header('Content-Type: application/json');
    echo json_encode(["error" => "Unauthorized"]);
    exit;
}

// If they are logged in, return user data
echo json_encode([
    "status" => "success",
    "user_id" => $_SESSION['user_id'],
    "email" => $_SESSION['email'],
]);
