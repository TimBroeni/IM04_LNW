<?php
// Login-API
// - Prüft E-Mail und Passwort beim Anmelden
// - Wird von login.html und js/login.js aufgerufen
// - Holt Benutzer-ID, Passwort-Hash und household_id aus der users-Tabelle
// - Setzt die Session für den weiteren Zugriff der Webapp
ini_set('session.cookie_httponly', 1);
// ini_set('session.cookie_secure', 1); // if using HTTPS
session_start();
header('Content-Type: application/json');

require_once '../system/config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

    $email    = trim($data['email'] ?? '');
    $password = trim($data['password'] ?? '');

    if (!$email || !$password) {
        echo json_encode(["status" => "error", "message" => "Email and password are required"]);
        exit;
    }

    // Check user in DB (include household_id)
    $stmt = $pdo->prepare("SELECT id, password, household_id FROM users WHERE email = :email");
    $stmt->execute([':email' => $email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    // Verify password
    if ($user && password_verify($password, $user['password'])) {
        session_regenerate_id(true);
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['email']   = $email;
        // store household_id in session (may be NULL)
        $_SESSION['household_id'] = isset($user['household_id']) ? $user['household_id'] : null;

        echo json_encode(["status" => "success", "household_id" => $_SESSION['household_id']]);
    } else {
        echo json_encode(["status" => "error", "message" => "Invalid credentials"]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Invalid request method"]);
}
