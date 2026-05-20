<?php
require_once "../../config/db.php";

header("Content-Type: application/json");

$dormitory_id = $_GET['dormitory_id'] ?? null;

if (!$dormitory_id) {
    echo json_encode(["success" => false, "message" => "Dormitory ID required"]);
    exit();
}

// Get all ratings for this dormitory
$stmt = $pdo->prepare("
    SELECT r.*, u.name as tenant_name 
    FROM ratings r
    JOIN users u ON r.tenant_id = u.id
    WHERE r.dormitory_id = ?
    ORDER BY r.created_at DESC
");
$stmt->execute([$dormitory_id]);
$ratings = $stmt->fetchAll();

// Get rating statistics
$statsStmt = $pdo->prepare("
    SELECT 
        AVG(rating) as average_rating,
        COUNT(*) as total_ratings,
        SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as five_star,
        SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as four_star,
        SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as three_star,
        SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as two_star,
        SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as one_star
    FROM ratings 
    WHERE dormitory_id = ?
");
$statsStmt->execute([$dormitory_id]);
$stats = $statsStmt->fetch();

echo json_encode([
    "success" => true, 
    "data" => $ratings,
    "stats" => [
        "average" => round($stats['average_rating'] ?? 0, 1),
        "total" => $stats['total_ratings'] ?? 0,
        "five_star" => $stats['five_star'] ?? 0,
        "four_star" => $stats['four_star'] ?? 0,
        "three_star" => $stats['three_star'] ?? 0,
        "two_star" => $stats['two_star'] ?? 0,
        "one_star" => $stats['one_star'] ?? 0
    ]
]);
?>