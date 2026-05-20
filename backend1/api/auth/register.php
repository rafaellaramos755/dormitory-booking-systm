<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// The rest of your register code here...
require_once "../../config/db.php";
session_start();

// ... ang natitirang code mo

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);

// Validate required fields
$required = ['name', 'email', 'password', 'phone', 'user_type'];
foreach ($required as $field) {
    if (empty($data[$field])) {
        echo json_encode(["success" => false, "message" => "$field is required"]);
        exit();
    }
}

// Check if email exists
$stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
$stmt->execute([$data['email']]);
if ($stmt->rowCount() > 0) {
    echo json_encode(["success" => false, "message" => "Email already exists"]);
    exit();
}

// Hash password
$hashed_password = password_hash($data['password'], PASSWORD_DEFAULT);

// Insert user
$sql = "INSERT INTO users (name, email, password, phone, address, user_type, profile_image) 
        VALUES (?, ?, ?, ?, ?, ?, ?)";

$stmt = $pdo->prepare($sql);
$result = $stmt->execute([
    $data['name'],
    $data['email'],
    $hashed_password,
    $data['phone'],
    $data['address'] ?? null,
    $data['user_type'],
    $data['profile_image'] ?? null
]);

if ($result) {
    $user_id = $pdo->lastInsertId();
    
    echo json_encode([
        "success" => true,
        "message" => "Registration successful",
        "user" => [
            "id" => $user_id,
            "name" => $data['name'],
            "email" => $data['email'],
            "user_type" => $data['user_type']
        ]
    ]);
} else {
    echo json_encode(["success" => false, "message" => "Registration failed"]);
}
?>