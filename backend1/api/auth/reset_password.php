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

require_once "../../config/db.php";

$data = json_decode(file_get_contents("php://input"), true);
$token = $data['token'] ?? '';
$new_password = $data['new_password'] ?? '';

if (empty($token) || empty($new_password)) {
    echo json_encode(["success" => false, "message" => "Token and new password required"]);
    exit();
}

if (strlen($new_password) < 8) {
    echo json_encode(["success" => false, "message" => "Password must be at least 8 characters"]);
    exit();
}

// Verify token
$stmt = $pdo->prepare("SELECT id FROM users WHERE reset_token = ? AND reset_token_expiry > NOW()");
$stmt->execute([$token]);
$user = $stmt->fetch();

if (!$user) {
    echo json_encode(["success" => false, "message" => "Invalid or expired token"]);
    exit();
}

// Hash new password
$hashedPassword = password_hash($new_password, PASSWORD_DEFAULT);

// Update password and clear reset token
$update = $pdo->prepare("UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?");
$result = $update->execute([$hashedPassword, $user['id']]);

if ($result) {
    echo json_encode(["success" => true, "message" => "Password reset successfully. You can now login."]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to reset password"]);
}
?>