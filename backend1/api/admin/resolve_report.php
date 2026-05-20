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
if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'admin') {
    echo json_encode(["success" => false, "message" => "Unauthorized"]);
    exit();
}

require_once "../../config/db.php";

$data = json_decode(file_get_contents("php://input"), true);
$report_id = $data['report_id'] ?? null;
$action = $data['action'] ?? 'resolve';
$admin_notes = $data['admin_notes'] ?? '';

if (!$report_id) {
    echo json_encode(["success" => false, "message" => "Report ID required"]);
    exit();
}

// Get report details first
$getReport = $pdo->prepare("SELECT r.*, rep.name as reporter_name, usr.name as reported_name 
                            FROM reports r
                            LEFT JOIN users rep ON r.reporter_id = rep.id
                            LEFT JOIN users usr ON r.reported_user_id = usr.id
                            WHERE r.id = ?");
$getReport->execute([$report_id]);
$report = $getReport->fetch();

if (!$report) {
    echo json_encode(["success" => false, "message" => "Report not found"]);
    exit();
}

$status = ($action === 'resolve') ? 'resolved' : 'dismissed';

// Update report status
$stmt = $pdo->prepare("UPDATE reports SET status = ?, admin_notes = ?, resolved_at = NOW() WHERE id = ?");
$result = $stmt->execute([$status, $admin_notes, $report_id]);

if ($result) {
    // Send notification to the reporter
    if ($action === 'resolve') {
        $notifMessage = "Your report against '" . $report['reported_name'] . "' has been reviewed and RESOLVED by the admin. Thank you for helping keep our community safe.";
    } else {
        $notifMessage = "Your report against '" . $report['reported_name'] . "' has been reviewed and DISMISSED. " . ($admin_notes ? "Admin notes: " . $admin_notes : "No further action will be taken.");
    }
    
    $notifSql = "INSERT INTO notifications (user_id, title, message, type, created_at) 
                 VALUES (?, 'Report Update', ?, 'system', NOW())";
    $notifStmt = $pdo->prepare($notifSql);
    $notifStmt->execute([$report['reporter_id'], $notifMessage]);
    
    echo json_encode(["success" => true, "message" => "Report " . $status]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to update report"]);
}
?>