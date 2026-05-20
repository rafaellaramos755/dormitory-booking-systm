<?php
require_once "../../config/db.php";

header("Content-Type: application/json");

$dormitory_id = $_GET['dormitory_id'] ?? null;

if (!$dormitory_id) {
    echo json_encode(["success" => false, "message" => "Dormitory ID required"]);
    exit();
}

$stmt = $pdo->prepare("SELECT * FROM rules WHERE dormitory_id = ? ORDER BY created_at ASC");
$stmt->execute([$dormitory_id]);
$rules = $stmt->fetchAll();

echo json_encode(["success" => true, "data" => $rules]);
?>