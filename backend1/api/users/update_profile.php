<?php
require_once "../../config/db.php";
session_start();

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "message" => "Not logged in"]);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);

$sql = "UPDATE users SET name = ?, phone = ?, address = ? WHERE id = ?";
$stmt = $pdo->prepare($sql);
$result = $stmt->execute([
    $data['name'] ?? null,
    $data['phone'] ?? null,
    $data['address'] ?? null,
    $_SESSION['user_id']
]);

echo json_encode(["success" => $result, "message" => $result ? "Profile updated" : "Update failed"]);
?>