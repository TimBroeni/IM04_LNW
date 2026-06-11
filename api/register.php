<?php
// Registrierungs-API
// - Legt neue Benutzerkonten an
// - Wird von register.html und register.js verwendet
// - Prüft die users-Tabelle auf doppelte E-Mail-Adressen und liest dort vorhandene Datensätze
// - Speichert E-Mail, Passwort-Hash, Vorname und Nachname in der Datenbank
session_start();
header('Content-Type: application/json');

require_once '../system/config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $data = json_decode(file_get_contents("php://input"), true);

    $email    = trim($data['email'] ?? '');
    $password = trim($data['password'] ?? '');
    $firstname = trim($data['firstname'] ?? '');
    $lastname = trim($data['lastname'] ?? '');

    if (!$email || !$password) {
        echo json_encode(["status" => "error", "message" => "Email, Passwort dürfen nicht leer sein."]);
        exit;
    }

    // Check if email already exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = :email");
    $stmt->execute([':email' => $email]);
    if ($stmt->fetch()) {
        echo json_encode(["status" => "error", "message" => "Diese Email-Adresse ist bereits registriert."]);
        exit;
    }

    // Hash the password
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    // Insert the new user
    $insert = $pdo->prepare("INSERT INTO users (email, password, firstname, lastname) VALUES (:email, :pass, :firstname, :lastname)");
    $insert->execute([
        ':email' => $email,
        ':pass'  => $hashedPassword,
        ':firstname' => $firstname,
        ':lastname' => $lastname
    ]);

    echo json_encode(["status" => "success"]);
} else {
    echo json_encode(["status" => "error", "message" => "Invalid request method"]);
}
