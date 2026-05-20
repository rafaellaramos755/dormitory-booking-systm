<?php
require_once "../../config/db.php";
session_start();

header("Content-Type: application/json");

if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'tenant') {
    echo json_encode(["success" => false, "message" => "Unauthorized"]);
    exit();
}

$dormitory_id = $_GET['dormitory_id'] ?? null;

if (!$dormitory_id) {
    echo json_encode(["success" => false, "message" => "Dormitory ID required"]);
    exit();
}

$stmt = $pdo->prepare("SELECT rating, review, created_at, updated_at FROM ratings WHERE dormitory_id = ? AND tenant_id = ?");
$stmt->execute([$dormitory_id, $_SESSION['user_id']]);
$rating = $stmt->fetch();

echo json_encode(["success" => true, "data" => $rating]);
?>