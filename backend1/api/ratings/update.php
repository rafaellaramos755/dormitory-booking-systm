<?php
require_once "../../config/db.php";
session_start();

header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit();
}

if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'tenant') {
    echo json_encode(["success" => false, "message" => "Unauthorized. Tenant only."]);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);

if (empty($data['dormitory_id']) || empty($data['rating'])) {
    echo json_encode(["success" => false, "message" => "Dormitory ID and rating required"]);
    exit();
}

if ($data['rating'] < 1 || $data['rating'] > 5) {
    echo json_encode(["success" => false, "message" => "Rating must be between 1 and 5"]);
    exit();
}

// Check if rating exists and belongs to this tenant
$checkStmt = $pdo->prepare("SELECT id FROM ratings WHERE dormitory_id = ? AND tenant_id = ?");
$checkStmt->execute([$data['dormitory_id'], $_SESSION['user_id']]);
if (!$checkStmt->fetch()) {
    echo json_encode(["success" => false, "message" => "No existing rating found for this dormitory"]);
    exit();
}

$sql = "UPDATE ratings SET rating = ?, review = ? WHERE dormitory_id = ? AND tenant_id = ?";
$stmt = $pdo->prepare($sql);
$result = $stmt->execute([
    $data['rating'],
    $data['review'] ?? null,
    $data['dormitory_id'],
    $_SESSION['user_id']
]);

if ($result) {
    echo json_encode(["success" => true, "message" => "Rating updated successfully"]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to update rating"]);
}
?>