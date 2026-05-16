<?php
// profilUpdate.php

session_start();
require_once '../system/config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

    $userId = $_SESSION['user_id'];
    $firstname = trim($data['firstname'] ?? '');
    $lastname = trim($data['lastname'] ?? '');

    if (!$firstname || !$lastname) {
        echo json_encode(["status" => "error", "message" => "First name and last name are required"]);
        exit;
    }

    // echo json_encode(["status" => "success", "firstname" => $firstname, "lastname" => $lastname]);

    // Update user in DB
    $stmt = $pdo->prepare("UPDATE users SET firstname = :firstname, lastname = :lastname WHERE id = :userID");
    $stmt->execute([':firstname' => $firstname, ':lastname' => $lastname, ':userID' => $userId]);
    $userUpdate = $stmt->fetch();

   
        echo json_encode(["status" => "success"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Invalid request method"]);
}
