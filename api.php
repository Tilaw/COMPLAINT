<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ==========================================
// DATABASE CONFIGURATION - EDIT THIS SECTION
// ==========================================
$host = "localhost";
$db_name = "complaints_db";
$username = "complaints";
$password = "Til@w19988";
// ==========================================

try {
    $db = new PDO("mysql:host=" . $host . ";dbname=" . $db_name, $username, $password);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $exception) {
    http_response_code(500);
    echo json_encode(array("error" => "Connection error: " . $exception->getMessage()));
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $query = "SELECT * FROM complaints ORDER BY timestamp DESC";
        $stmt = $db->prepare($query);
        $stmt->execute();
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($results);
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(array("error" => "Database error: " . $e->getMessage()));
    }
}
else if ($method === 'POST') {
    // Handle multipart/form-data or json
    // Since we are using FormData in JS now, data is in $_POST
    
    // Create uploads directory if it doesn't exist
    $upload_dir = 'uploads/';
    if (!is_dir($upload_dir)) {
        mkdir($upload_dir, 0755, true);
    }
    
    // Helper function to handle file upload
    function uploadFile($fileInputName, $upload_dir) {
        if (isset($_FILES[$fileInputName]) && $_FILES[$fileInputName]['error'] === UPLOAD_ERR_OK) {
            $tmp_name = $_FILES[$fileInputName]['tmp_name'];
            $name = basename($_FILES[$fileInputName]['name']);
            // Sanitize file name and prepend unique ID
            $safe_name = uniqid() . '_' . preg_replace("/[^a-zA-Z0-9.-]/", "_", $name);
            $destination = $upload_dir . $safe_name;
            if (move_uploaded_file($tmp_name, $destination)) {
                return $destination;
            }
        }
        return null;
    }
    
    $id = isset($_POST['id']) ? $_POST['id'] : null;
    $worker = isset($_POST['worker']) ? $_POST['worker'] : null;
    $riderName = isset($_POST['riderName']) ? $_POST['riderName'] : null;
    $riderPhone = isset($_POST['riderPhone']) ? $_POST['riderPhone'] : null;
    $riderId = isset($_POST['riderId']) ? $_POST['riderId'] : null;
    $platform = isset($_POST['platform']) ? $_POST['platform'] : null;
    $details = isset($_POST['details']) ? $_POST['details'] : null;
    
    $image_path = uploadFile('image_file', $upload_dir);
    $audio_path = uploadFile('audio_file', $upload_dir);

    if($id && $worker && $details) {
        try {
            $query = "INSERT INTO complaints (id, timestamp, worker, riderName, riderPhone, riderId, platform, details, image_path, audio_path) 
                      VALUES (:id, NOW(), :worker, :riderName, :riderPhone, :riderId, :platform, :details, :image_path, :audio_path)";
            
            $stmt = $db->prepare($query);
            $stmt->bindParam(':id', $id);
            $stmt->bindParam(':worker', $worker);
            $stmt->bindParam(':riderName', $riderName);
            $stmt->bindParam(':riderPhone', $riderPhone);
            $stmt->bindParam(':riderId', $riderId);
            $stmt->bindParam(':platform', $platform);
            $stmt->bindParam(':details', $details);
            $stmt->bindParam(':image_path', $image_path);
            $stmt->bindParam(':audio_path', $audio_path);
            
            if ($stmt->execute()) {
                http_response_code(201);
                echo json_encode(array("message" => "Complaint saved successfully."));
            } else {
                http_response_code(503);
                echo json_encode(array("error" => "Unable to save complaint."));
            }
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(array("error" => "Database error: " . $e->getMessage()));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("error" => "Incomplete data. Worker and details are required."));
    }
}
else if ($method === 'DELETE') {
    // Read JSON payload for DELETE
    $data = json_decode(file_get_contents("php://input"));
    
    if(!empty($data->id)) {
        // Find file paths to delete physical files as well
        $sel = $db->prepare("SELECT image_path, audio_path FROM complaints WHERE id = :id");
        $sel->bindParam(":id", $data->id);
        $sel->execute();
        $row = $sel->fetch(PDO::FETCH_ASSOC);
        
        $query = "DELETE FROM complaints WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":id", $data->id);
        
        if($stmt->execute()){
            // Delete files
            if ($row && !empty($row['image_path']) && file_exists($row['image_path'])) {
                unlink($row['image_path']);
            }
            if ($row && !empty($row['audio_path']) && file_exists($row['audio_path'])) {
                unlink($row['audio_path']);
            }
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
