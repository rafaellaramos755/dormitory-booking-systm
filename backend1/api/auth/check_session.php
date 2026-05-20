<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// The rest of your register code here...
require_once(__DIR__ . "/../../db.php");
session_start();

if (isset($_SESSION['user_id'])) {
    $stmt = $pdo->prepare("SELECT id, name, email, user_type FROM users WHERE id = ?");
    $stmt->execute([$_SESSION['user_id']]);
    $user = $stmt->fetch();

    echo json_encode([
        "logged_in" => true,
        "user" => $user
    ]);
} else {
    echo json_encode(["logged_in" => false]);
}