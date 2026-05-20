<?php
require_once "../../config/db.php";

header("Content-Type: application/json");

$status = $_GET['status'] ?? 'active';
$search = $_GET['search'] ?? '';
$min_price = $_GET['min_price'] ?? 0;
$max_price = $_GET['max_price'] ?? 999999;

$sql = "SELECT d.*, 
        u.name as owner_name, u.phone as owner_phone,
        (SELECT AVG(rating) FROM ratings WHERE dormitory_id = d.id) as avg_rating,
        (SELECT COUNT(*) FROM ratings WHERE dormitory_id = d.id) as total_ratings,
        (SELECT SUM(r.capacity) FROM rooms r WHERE r.dormitory_id = d.id) as total_slots,
        (SELECT SUM(r.current_occupants) FROM rooms r WHERE r.dormitory_id = d.id) as occupied_slots,
        (SELECT COUNT(*) FROM rooms r WHERE r.dormitory_id = d.id AND r.is_available = 1) as available_rooms_count
        FROM dormitories d
        JOIN users u ON d.owner_id = u.id
        WHERE d.status = ? 
        AND d.available_rooms > 0
        AND (d.name LIKE ? OR d.location LIKE ?)
        AND d.price_per_month BETWEEN ? AND ?
        ORDER BY d.created_at DESC";

$searchTerm = "%$search%";
$stmt = $pdo->prepare($sql);
$stmt->execute([$status, $searchTerm, $searchTerm, $min_price, $max_price]);
$dormitories = $stmt->fetchAll();

foreach ($dormitories as &$dorm) {
    $totalSlots = (int)($dorm['total_slots'] ?? 0);
    $occupiedSlots = (int)($dorm['occupied_slots'] ?? 0);
    $dorm['available_slots'] = $totalSlots - $occupiedSlots;
    $dorm['available_rooms'] = $dorm['available_rooms_count'] ?? $dorm['available_rooms'] ?? 0;
    
    $amenityStmt = $pdo->prepare("SELECT amenity_name FROM amenities WHERE dormitory_id = ?");
    $amenityStmt->execute([$dorm['id']]);
    $dorm['amenities'] = $amenityStmt->fetchAll(PDO::FETCH_COLUMN);
}

echo json_encode(["success" => true, "data" => $dormitories]);
?>