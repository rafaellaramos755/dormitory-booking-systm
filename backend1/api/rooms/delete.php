<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: DELETE, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

session_start();
if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'owner') {
    echo json_encode(["success" => false, "message" => "Unauthorized"]);
    exit();
}

require_once "../../config/db.php";

$data = json_decode(file_get_contents("php://input"), true);
$room_id = $data['room_id'] ?? null;

if (!$room_id) {
    echo json_encode(["success" => false, "message" => "Room ID required"]);
    exit();
}

// Get room details and verify ownership
$stmt = $pdo->prepare("SELECT r.*, d.owner_id, d.id as dormitory_id FROM rooms r JOIN dormitories d ON r.dormitory_id = d.id WHERE r.id = ?");
$stmt->execute([$room_id]);
$room = $stmt->fetch();

if (!$room || $room['owner_id'] != $_SESSION['user_id']) {
    echo json_encode(["success" => false, "message" => "Unauthorized or room not found"]);
    exit();
}

// Check for current occupants
if ($room['current_occupants'] > 0) {
    echo json_encode(["success" => false, "message" => "Cannot delete room because it has current occupants. Please move them out first."]);
    exit();
}

// Check for active or pending bookings
$bookingCheck = $pdo->prepare("SELECT id FROM bookings WHERE room_id = ? AND status IN ('pending', 'accepted')");
$bookingCheck->execute([$room_id]);
if ($bookingCheck->fetch()) {
    echo json_encode(["success" => false, "message" => "Cannot delete room because there are active or pending bookings. Cancel or complete them first."]);
    exit();
}

$delete = $pdo->prepare("DELETE FROM rooms WHERE id = ?");
$result = $delete->execute([$room_id]);

if ($result) {
    $updateDorm = $pdo->prepare("UPDATE dormitories SET total_rooms = total_rooms - 1, available_rooms = available_rooms - 1 WHERE id = ?");
    $updateDorm->execute([$room['dormitory_id']]);
    echo json_encode(["success" => true, "message" => "Room deleted successfully"]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to delete room"]);
}
?>