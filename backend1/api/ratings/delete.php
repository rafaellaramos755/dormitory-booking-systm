<?php
require_once "../../config/db.php";
session_start();

header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE' && $_SERVER['REQUEST_METHOD'] !== 'GET') {
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit();
}

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "message" => "Not logged in"]);
    exit();
}

$dormitory_id = $_GET['dormitory_id'] ?? null;

if (!$dormitory_id) {
    echo json_encode(["success" => false, "message" => "Dormitory ID required"]);
    exit();
}

// Check if rating exists and belongs to this tenant
$checkStmt = $pdo->prepare("SELECT id FROM ratings WHERE dormitory_id = ? AND tenant_id = ?");
$checkStmt->execute([$dormitory_id, $_SESSION['user_id']]);
if (!$checkStmt->fetch()) {
    echo json_encode(["success" => false, "message" => "Rating not found"]);
    exit();
}

$stmt = $pdo->prepare("DELETE FROM ratings WHERE dormitory_id = ? AND tenant_id = ?");
$result = $stmt->execute([$dormitory_id, $_SESSION['user_id']]);

if ($result) {
    echo json_encode(["success" => true, "message" => "Rating deleted successfully"]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to delete rating"]);
}
?>