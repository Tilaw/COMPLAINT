<?php
// Prevent CORS issues if testing locally or on different domains
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ==========================================
// DATABASE CONFIGURATION - EDIT THIS SECTION
// ==========================================
$host = "localhost";
$db_name = "complaints_db";      // Replace with your Plesk database name
$username = "complaints_db";     // Assuming username is the same as DB name
$password = "Til@w19988";        // Replace with your Plesk database password
// ==========================================

// Establish database connection using PDO
try {
    $db = new PDO("mysql:host=" . $host . ";dbname=" . $db_name, $username, $password);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $exception) {
    http_response_code(500);
    echo json_encode(array("error" => "Connection error: " . $exception->getMessage()));
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

// GET: Fetch all complaints
if ($method === 'GET') {
    $query = "SELECT * FROM complaints ORDER BY timestamp DESC";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($results);
} 
// POST: Add new complaint
else if ($method === 'POST') {
    // Get posted JSON data
    $data = json_decode(file_get_contents("php://input"));
    
    if(!empty($data->id) && !empty($data->worker) && !empty($data->details)) {
        $query = "INSERT INTO complaints SET
                    id=:id, timestamp=NOW(), worker=:worker, riderName=:riderName, 
                    riderPhone=:riderPhone, riderId=:riderId, platform=:platform, details=:details";
        
        $stmt = $db->prepare($query);
        
        $stmt->bindParam(":id", $data->id);
        $stmt->bindParam(":worker", $data->worker);
        $stmt->bindParam(":riderName", $data->riderName);
        $stmt->bindParam(":riderPhone", $data->riderPhone);
        $stmt->bindParam(":riderId", $data->riderId);
        $stmt->bindParam(":platform", $data->platform);
        $stmt->bindParam(":details", $data->details);
        
        if($stmt->execute()){
            http_response_code(200);
            echo json_encode(array("success" => true, "id" => $data->id));
        } else {
            http_response_code(503);
            echo json_encode(array("error" => "Unable to save complaint."));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("error" => "Incomplete data."));
    }
}
// DELETE: Remove a complaint
else if ($method === 'DELETE') {
    $data = json_decode(file_get_contents("php://input"));
    
    if(!empty($data->id)) {
        $query = "DELETE FROM complaints WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":id", $data->id);
        
        if($stmt->execute()){
            http_response_code(200);
            echo json_encode(array("success" => true));
        } else {
            http_response_code(503);
            echo json_encode(array("error" => "Unable to delete complaint."));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("error" => "No ID provided."));
    }
}
else {
    http_response_code(405);
    echo json_encode(array("error" => "Method not allowed."));
}
?>
