<?php
require_once "../../config/db.php";
session_start();

if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'owner') {
    echo json_encode(["success" => false, "message" => "Unauthorized"]);
    exit();
}

$stmt = $pdo->prepare("SELECT id, name, email, phone, created_at FROM users WHERE user_type = 'tenant'");
$stmt->execute();
$tenants = $stmt->fetchAll();

echo json_encode(["success" => true, "data" => $tenants]);
?>