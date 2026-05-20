<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: DELETE, GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once "../../config/db.php";
session_start();

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE' && $_SERVER['REQUEST_METHOD'] !== 'GET') {
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit();
}

if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'owner') {
    echo json_encode(["success" => false, "message" => "Unauthorized. Owner only."]);
    exit();
}

$rule_id = $_GET['rule_id'] ?? null;

if (!$rule_id) {
    echo json_encode(["success" => false, "message" => "Rule ID required"]);
    exit();
}

// Check if rule belongs to owner's dormitory
$checkStmt = $pdo->prepare("
    SELECT r.id FROM rules r
    JOIN dormitories d ON r.dormitory_id = d.id
    WHERE r.id = ? AND d.owner_id = ?
");
$checkStmt->execute([$rule_id, $_SESSION['user_id']]);
if (!$checkStmt->fetch()) {
    echo json_encode(["success" => false, "message" => "You don't own this rule"]);
    exit();
}

$stmt = $pdo->prepare("DELETE FROM rules WHERE id = ?");
$result = $stmt->execute([$rule_id]);

if ($result) {
    echo json_encode(["success" => true, "message" => "Rule deleted successfully"]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to delete rule"]);
}
?>