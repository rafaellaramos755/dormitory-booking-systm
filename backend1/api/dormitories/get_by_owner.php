<?php
require_once "../../config/db.php";
session_start();

header("Content-Type: application/json");

if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'owner') {
    echo json_encode(["success" => false, "message" => "Unauthorized. Owner only."]);
    exit();
}

$stmt = $pdo->prepare("SELECT d.*, 
                       (SELECT COUNT(*) FROM rooms WHERE dormitory_id = d.id) as total_rooms,
                       (SELECT COUNT(*) FROM bookings b 
                        JOIN rooms r ON b.room_id = r.id 
                        WHERE r.dormitory_id = d.id AND b.status = 'accepted') as total_tenants
                       FROM dormitories d 
                       WHERE d.owner_id = ? 
                       ORDER BY d.created_at DESC");
$stmt->execute([$_SESSION['user_id']]);
$dormitories = $stmt->fetchAll();

foreach ($dormitories as &$dorm) {
    // Pending bookings count
    $bookingStmt = $pdo->prepare("SELECT COUNT(*) FROM bookings b 
                                  JOIN rooms r ON b.room_id = r.id 
                                  WHERE r.dormitory_id = ? AND b.status = 'pending'");
    $bookingStmt->execute([$dorm['id']]);
    $dorm['pending_bookings'] = $bookingStmt->fetchColumn();
    
    // Rules
    $rulesStmt = $pdo->prepare("SELECT * FROM rules WHERE dormitory_id = ? ORDER BY created_at ASC");
    $rulesStmt->execute([$dorm['id']]);
    $dorm['rules'] = $rulesStmt->fetchAll();
    
    // Multiple Images
    $imagesStmt = $pdo->prepare("SELECT * FROM dormitory_images WHERE dormitory_id = ? ORDER BY is_featured DESC, created_at ASC");
    $imagesStmt->execute([$dorm['id']]);
    $dorm['images'] = $imagesStmt->fetchAll();
    
    // Get rooms with tenant details
    $roomsStmt = $pdo->prepare("SELECT * FROM rooms WHERE dormitory_id = ?");
    $roomsStmt->execute([$dorm['id']]);
    $rooms = $roomsStmt->fetchAll();
    
    foreach ($rooms as &$room) {
        $tenantIds = $room['tenant_ids'] ? json_decode($room['tenant_ids'], true) : [];
        $tenants = [];
        if (!empty($tenantIds)) {
            $placeholders = implode(',', array_fill(0, count($tenantIds), '?'));
            $tenantStmt = $pdo->prepare("SELECT id, name, email, phone FROM users WHERE id IN ($placeholders)");
            $tenantStmt->execute($tenantIds);
            $tenants = $tenantStmt->fetchAll();
        }
        $room['tenants'] = $tenants;
        $room['available_slots'] = $room['capacity'] - ($room['current_occupants'] ?? 0);
    }
    $dorm['rooms'] = $rooms;
}

echo json_encode(["success" => true, "data" => $dormitories]);
?>