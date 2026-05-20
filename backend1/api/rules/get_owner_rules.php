<?php
require_once "../../config/db.php";
session_start();

header("Content-Type: application/json");

if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'owner') {
    echo json_encode(["success" => false, "message" => "Unauthorized. Owner only."]);
    exit();
}

$dormitory_id = $_GET['dormitory_id'] ?? null;

if ($dormitory_id) {
    // Check if dormitory belongs to owner
    $checkStmt = $pdo->prepare("SELECT id FROM dormitories WHERE id = ? AND owner_id = ?");
    $checkStmt->execute([$dormitory_id, $_SESSION['user_id']]);
    if (!$checkStmt->fetch()) {
        echo json_encode(["success" => false, "message" => "You don't own this dormitory"]);
        exit();
    }
    
    $stmt = $pdo->prepare("SELECT r.*, d.name as dormitory_name 
                           FROM rules r 
                           JOIN dormitories d ON r.dormitory_id = d.id 
                           WHERE r.dormitory_id = ? 
                           ORDER BY r.created_at ASC");
    $stmt->execute([$dormitory_id]);
} else {
    // Get all rules for all owner's dormitories
    $stmt = $pdo->prepare("SELECT r.*, d.name as dormitory_name, d.id as dormitory_id
                           FROM rules r 
                           JOIN dormitories d ON r.dormitory_id = d.id 
                           WHERE d.owner_id = ? 
                           ORDER BY d.name, r.created_at ASC");
    $stmt->execute([$_SESSION['user_id']]);
}

$rules = $stmt->fetchAll();

echo json_encode(["success" => true, "data" => $rules]);
?>