<?php
require_once "../../config/db.php";
session_start();

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "message" => "Not logged in"]);
    exit();
}

$stmt = $pdo->prepare("SELECT id, name, email, phone, address, user_type, profile_image, created_at FROM users WHERE id = ?");
$stmt->execute([$_SESSION['user_id']]);
$user = $stmt->fetch();

echo json_encode(["success" => true, "data" => $user]);
?>