<?php
require_once "../../config/db.php";
session_start();

header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit();
}

if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'owner') {
    echo json_encode(["success" => false, "message" => "Unauthorized. Owner only."]);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);

if (empty($data['dormitory_id']) || empty($data['title']) || empty($data['description'])) {
    echo json_encode(["success" => false, "message" => "Dormitory ID, title, and description required"]);
    exit();
}

// Check if dormitory belongs to this owner
$checkStmt = $pdo->prepare("SELECT id FROM dormitories WHERE id = ? AND owner_id = ?");
$checkStmt->execute([$data['dormitory_id'], $_SESSION['user_id']]);
if (!$checkStmt->fetch()) {
    echo json_encode(["success" => false, "message" => "You don't own this dormitory"]);
    exit();
}

$sql = "INSERT INTO rules (dormitory_id, rule_title, rule_description) VALUES (?, ?, ?)";
$stmt = $pdo->prepare($sql);
$result = $stmt->execute([
    $data['dormitory_id'],
    $data['title'],
    $data['description']
]);

if ($result) {
    echo json_encode([
        "success" => true, 
        "message" => "Rule added successfully",
        "rule_id" => $pdo->lastInsertId()
    ]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to add rule"]);
}
?>