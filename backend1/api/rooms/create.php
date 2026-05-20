<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
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
$dormitory_id = $data['dormitory_id'] ?? null;
$room_number = $data['room_number'] ?? null;
$capacity = $data['capacity'] ?? 1;

if (!$dormitory_id || !$room_number) {
    echo json_encode(["success" => false, "message" => "Dormitory ID and room number required"]);
    exit();
}

// Verify ownership
$check = $pdo->prepare("SELECT id FROM dormitories WHERE id = ? AND owner_id = ?");
$check->execute([$dormitory_id, $_SESSION['user_id']]);
if (!$check->fetch()) {
    echo json_encode(["success" => false, "message" => "You don't own this dormitory"]);
    exit();
}

// Check duplicate room number
$dup = $pdo->prepare("SELECT id FROM rooms WHERE dormitory_id = ? AND room_number = ?");
$dup->execute([$dormitory_id, $room_number]);
if ($dup->fetch()) {
    echo json_encode(["success" => false, "message" => "Room number already exists in this dormitory"]);
    exit();
}

$stmt = $pdo->prepare("INSERT INTO rooms (dormitory_id, room_number, capacity, current_occupants, is_available) VALUES (?, ?, ?, 0, 1)");
$result = $stmt->execute([$dormitory_id, $room_number, $capacity]);

if ($result) {
    $updateDorm = $pdo->prepare("UPDATE dormitories SET total_rooms = total_rooms + 1, available_rooms = available_rooms + 1 WHERE id = ?");
    $updateDorm->execute([$dormitory_id]);
    echo json_encode(["success" => true, "message" => "Room added successfully"]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to add room"]);
}
?>