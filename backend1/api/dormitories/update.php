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

if (empty($data['id'])) {
    echo json_encode(["success" => false, "message" => "Dormitory ID required"]);
    exit();
}

// Check if dormitory belongs to this owner
$checkStmt = $pdo->prepare("SELECT id FROM dormitories WHERE id = ? AND owner_id = ?");
$checkStmt->execute([$data['id'], $_SESSION['user_id']]);
if (!$checkStmt->fetch()) {
    echo json_encode(["success" => false, "message" => "You don't own this dormitory"]);
    exit();
}

$sql = "UPDATE dormitories SET 
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        location = COALESCE(?, location),
        price_per_month = COALESCE(?, price_per_month),
        advance_payment = COALESCE(?, advance_payment),
        image_url = COALESCE(?, image_url),
        status = COALESCE(?, status),
        deposit_amount = COALESCE(?, deposit_amount),
        advance_months = COALESCE(?, advance_months)
        WHERE id = ? AND owner_id = ?";

$stmt = $pdo->prepare($sql);
$result = $stmt->execute([
    $data['name'] ?? null,
    $data['description'] ?? null,
    $data['location'] ?? null,
    $data['price_per_month'] ?? null,
    $data['advance_payment'] ?? null,
    $data['image_url'] ?? null,
    $data['status'] ?? null,
    $data['deposit_amount'] ?? null,
    $data['advance_months'] ?? null,
    $data['id'],
    $_SESSION['user_id']
]);

if ($result) {
    // Update amenities
    $delAmenities = $pdo->prepare("DELETE FROM amenities WHERE dormitory_id = ?");
    $delAmenities->execute([$data['id']]);
    if (!empty($data['amenities']) && is_array($data['amenities'])) {
        $amenityStmt = $pdo->prepare("INSERT INTO amenities (dormitory_id, amenity_name) VALUES (?, ?)");
        foreach ($data['amenities'] as $amenity) {
            $amenityStmt->execute([$data['id'], trim($amenity)]);
        }
    }
}

echo json_encode([
    "success" => $result, 
    "message" => $result ? "Dormitory updated successfully" : "Update failed"
]);
?>