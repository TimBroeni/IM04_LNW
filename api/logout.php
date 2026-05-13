<?php
// logout.php
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