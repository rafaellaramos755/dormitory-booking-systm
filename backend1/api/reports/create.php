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
if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "message" => "Unauthorized"]);
    exit();
}

require_once "../../config/db.php";

$reporter_id = $_SESSION['user_id'];
$reported_user_id = $_POST['reported_user_id'] ?? null;
$reported_dorm_id = $_POST['reported_dorm_id'] ?? null;
$reason = $_POST['reason'] ?? '';
$description = $_POST['description'] ?? '';

if (!$reported_user_id || !$reason) {
    echo json_encode(["success" => false, "message" => "Missing required fields"]);
    exit();
}

// Handle evidence upload
$evidence_url = null;
if (isset($_FILES['evidence']) && $_FILES['evidence']['error'] === UPLOAD_ERR_OK) {
    $upload_dir = "../../uploads/reports/";
    if (!is_dir($upload_dir)) mkdir($upload_dir, 0777, true);
    $ext = pathinfo($_FILES['evidence']['name'], PATHINFO_EXTENSION);
    $filename = "report_" . time() . "_" . rand(1000, 9999) . "." . $ext;
    if (move_uploaded_file($_FILES['evidence']['tmp_name'], $upload_dir . $filename)) {
        $evidence_url = "uploads/reports/" . $filename;
    }
}

$sql = "INSERT INTO reports (reporter_id, reported_user_id, reported_dorm_id, reason, description, evidence_url, status, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, 'pending', NOW())";
$stmt = $pdo->prepare($sql);
$result = $stmt->execute([$reporter_id, $reported_user_id, $reported_dorm_id, $reason, $description, $evidence_url]);

if ($result) {
    echo json_encode(["success" => true, "message" => "Report submitted successfully"]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to submit report"]);
}
?>