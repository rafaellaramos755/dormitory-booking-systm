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

$required = ['name', 'location', 'price_per_month', 'total_rooms'];
foreach ($required as $field) {
    if (empty($data[$field])) {
        echo json_encode(["success" => false, "message" => "$field is required"]);
        exit();
    }
}

try {
    $pdo->beginTransaction();
    
    $sql = "INSERT INTO dormitories (owner_id, name, description, location, latitude, longitude, 
            price_per_month, advance_payment, total_rooms, available_rooms, image_url, status,
            deposit_amount, advance_months) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)";
    
    $stmt = $pdo->prepare($sql);
    $result = $stmt->execute([
        $_SESSION['user_id'],
        $data['name'],
        $data['description'] ?? null,
        $data['location'],
        $data['latitude'] ?? null,
        $data['longitude'] ?? null,
        $data['price_per_month'],
        $data['advance_payment'] ?? 0,
        $data['total_rooms'],
        $data['total_rooms'],
        $data['image_url'] ?? null,
        $data['deposit_amount'] ?? 0,
        $data['advance_months'] ?? 1
    ]);
    
    if ($result) {
        $dormitory_id = $pdo->lastInsertId();
        
        // Create individual rooms
        $capacity = $data['capacity'] ?? 1;
        for ($i = 1; $i <= $data['total_rooms']; $i++) {
            $roomSql = "INSERT INTO rooms (dormitory_id, room_number, capacity, current_occupants, is_available) 
                        VALUES (?, ?, ?, ?, ?)";
            $roomStmt = $pdo->prepare($roomSql);
            $roomStmt->execute([$dormitory_id, "Room " . $i, $capacity, 0, true]);
        }
        
        // Save amenities
        if (!empty($data['amenities']) && is_array($data['amenities'])) {
            $amenityStmt = $pdo->prepare("INSERT INTO amenities (dormitory_id, amenity_name) VALUES (?, ?)");
            foreach ($data['amenities'] as $amenity) {
                $amenityStmt->execute([$dormitory_id, trim($amenity)]);
            }
        }
        
        $pdo->commit();
        
        echo json_encode([
            "success" => true,
            "message" => "Dormitory created successfully",
            "dormitory_id" => $dormitory_id
        ]);
    } else {
        $pdo->rollBack();
        echo json_encode(["success" => false, "message" => "Failed to create dormitory"]);
    }
} catch (Exception $e) {
    $pdo->rollBack();
    echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
}
?>