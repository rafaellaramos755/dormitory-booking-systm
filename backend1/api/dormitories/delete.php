<?php
require_once "../../config/db.php";
session_start();

header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE' && $_SERVER['REQUEST_METHOD'] !== 'GET') {
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit();
}

if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'owner') {
    echo json_encode(["success" => false, "message" => "Unauthorized. Owner only."]);
    exit();
}

$id = $_GET['id'] ?? null;

if (!$id) {
    echo json_encode(["success" => false, "message" => "Dormitory ID required"]);
    exit();
}

// Check if dormitory belongs to this owner
$checkStmt = $pdo->prepare("SELECT id FROM dormitories WHERE id = ? AND owner_id = ?");
$checkStmt->execute([$id, $_SESSION['user_id']]);
if (!$checkStmt->fetch()) {
    echo json_encode(["success" => false, "message" => "You don't own this dormitory"]);
    exit();
}

// Soft delete - just update status
$stmt = $pdo->prepare("UPDATE dormitories SET status = 'inactive' WHERE id = ? AND owner_id = ?");
$result = $stmt->execute([$id, $_SESSION['user_id']]);

echo json_encode([
    "success" => $result, 
    "message" => $result ? "Dormitory deleted successfully" : "Delete failed"
]);
?>