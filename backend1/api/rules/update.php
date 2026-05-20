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

require_once "../../config/db.php";
session_start();

if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'owner') {
    echo json_encode(["success" => false, "message" => "Unauthorized"]);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);

if (empty($data['rule_id']) || empty($data['title']) || empty($data['description'])) {
    echo json_encode(["success" => false, "message" => "Rule ID, title, and description required"]);
    exit();
}

// Check if rule belongs to owner's dormitory
$checkStmt = $pdo->prepare("
    SELECT r.id FROM rules r
    JOIN dormitories d ON r.dormitory_id = d.id
    WHERE r.id = ? AND d.owner_id = ?
");
$checkStmt->execute([$data['rule_id'], $_SESSION['user_id']]);
if (!$checkStmt->fetch()) {
    echo json_encode(["success" => false, "message" => "You don't own this rule"]);
    exit();
}

$sql = "UPDATE rules SET rule_title = ?, rule_description = ? WHERE id = ?";
$stmt = $pdo->prepare($sql);
$result = $stmt->execute([
    $data['title'],
    $data['description'],
    $data['rule_id']
]);

if ($result) {
    echo json_encode(["success" => true, "message" => "Rule updated successfully"]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to update rule"]);
}
?>