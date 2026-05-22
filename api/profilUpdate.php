<?php
// profilUpdate.php

session_start();
require_once '../system/config.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Unauthorized"]);
        exit;
    }

    $userId = $_SESSION['user_id'];
    $email = trim($data['email'] ?? '');
    $firstname = trim($data['firstname'] ?? '');
    $lastname = trim($data['lastname'] ?? '');
    $password = trim($data['password'] ?? '');

    if (!$email || !$firstname || !$lastname) {
        echo json_encode(["status" => "error", "message" => "Email, first name and last name are required"]);
        exit;
    }

    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = :email AND id <> :userID");
    $stmt->execute([':email' => $email, ':userID' => $userId]);
    if ($stmt->fetch()) {
        echo json_encode(["status" => "error", "message" => "Email is already in use"]);
        exit;
    }

    $query = "UPDATE users SET email = :email, firstname = :firstname, lastname = :lastname";
    $params = [
        ':email' => $email,
        ':firstname' => $firstname,
        ':lastname' => $lastname,
        ':userID' => $userId,
    ];

    if ($password !== '') {
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        $query .= ", password = :password";
        $params[':password'] = $hashedPassword;
    }

    $query .= " WHERE id = :userID";

    $stmt = $pdo->prepare($query);
    $stmt->execute($params);

    $_SESSION['email'] = $email;

    echo json_encode(["status" => "success"]);
} else {
    echo json_encode(["status" => "error", "message" => "Invalid request method"]);
}
