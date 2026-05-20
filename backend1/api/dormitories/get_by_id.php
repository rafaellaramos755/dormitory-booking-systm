<?php
require_once "../../config/db.php";
header("Content-Type: application/json");

$id = $_GET['id'] ?? null;
if (!$id) {
    echo json_encode(["success" => false, "message" => "Dormitory ID required"]);
    exit();
}

$sql = "SELECT d.*, u.name as owner_name, u.phone as owner_phone, u.email as owner_email
        FROM dormitories d JOIN users u ON d.owner_id = u.id WHERE d.id = ?";
$stmt = $pdo->prepare($sql);
$stmt->execute([$id]);
$dormitory = $stmt->fetch();

if ($dormitory) {
    $amenityStmt = $pdo->prepare("SELECT amenity_name FROM amenities WHERE dormitory_id = ?");
    $amenityStmt->execute([$id]);
    $dormitory['amenities'] = $amenityStmt->fetchAll(PDO::FETCH_COLUMN);
    
    $roomStmt = $pdo->prepare("SELECT * FROM rooms WHERE dormitory_id = ?");
    $roomStmt->execute([$id]);
    $rooms = $roomStmt->fetchAll();
    
    $ruleStmt = $pdo->prepare("SELECT * FROM rules WHERE dormitory_id = ?");
    $ruleStmt->execute([$id]);
    $dormitory['rules'] = $ruleStmt->fetchAll();
    
    // Images with room association
    $imgStmt = $pdo->prepare("SELECT di.*, r.room_number FROM dormitory_images di LEFT JOIN rooms r ON di.room_id = r.id WHERE di.dormitory_id = ? ORDER BY di.is_featured DESC, di.created_at ASC");
    $imgStmt->execute([$id]);
    $dormitory['images'] = $imgStmt->fetchAll();
    
    // Para sa bawat room, kalkulahin ang available slots
    foreach ($rooms as &$room) {
        $room['available_slots'] = $room['capacity'] - ($room['current_occupants'] ?? 0);
    }
    $dormitory['rooms'] = $rooms;
    
    echo json_encode(["success" => true, "data" => $dormitory]);
} else {
    echo json_encode(["success" => false, "message" => "Dormitory not found"]);
}
?>