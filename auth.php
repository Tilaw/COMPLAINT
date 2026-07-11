<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}

$host = "localhost";
$db_name = "complaints_db";
$username = "complaints";
$password = "Til@w19988";

try {
    $db = new PDO("mysql:host=" . $host . ";dbname=" . $db_name, $username, $password);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $exception) {
    http_response_code(500);
    echo json_encode(array("error" => "Database connection error: " . $exception->getMessage()));
    exit;
}

$data = json_decode(file_get_contents("php://input"));
$action = isset($_GET['action']) ? $_GET['action'] : '';

if ($action === 'login') {
    if (!empty($data->username) && !empty($data->password)) {
        try {
            $stmt = $db->prepare("SELECT password_hash, must_change_password FROM admins WHERE username = :username");
            $stmt->bindParam(":username", $data->username);
            $stmt->execute();
            
            if ($stmt->rowCount() > 0) {
                $row = $stmt->fetch(PDO::FETCH_ASSOC);
                
                $isValid = false;
                if ($row['must_change_password'] == 1 && $row['password_hash'] === $data->password) {
                    $isValid = true; 
                } else if (password_verify($data->password, $row['password_hash'])) {
                    $isValid = true;
                }

                if ($isValid) {
                    if ($row['must_change_password'] == 1) {
                        echo json_encode(array("success" => true, "status" => "REQUIRE_PASSWORD_CHANGE"));
                    } else {
                        echo json_encode(array("success" => true, "status" => "LOGGED_IN", "token" => bin2hex(random_bytes(16))));
                    }
                } else {
                    http_response_code(401);
                    echo json_encode(array("error" => "Password mismatch. Expected: '" . $row['password_hash'] . "' Got: '" . $data->password . "'"));
                }
            } else {
                http_response_code(401);
                echo json_encode(array("error" => "Username not found in database: '" . $data->username . "'"));
            }
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(array("error" => "Database error: " . $e->getMessage()));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("error" => "Username and password required."));
    }
} else if ($action === 'change_password') {
    if (!empty($data->username) && !empty($data->old_password) && !empty($data->new_password)) {
        $stmt = $db->prepare("SELECT password_hash, must_change_password FROM admins WHERE username = :username");
        $stmt->bindParam(":username", $data->username);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            $isValid = false;
            if ($row['must_change_password'] == 1 && $row['password_hash'] === $data->old_password) {
                $isValid = true;
            } else if (password_verify($data->old_password, $row['password_hash'])) {
                $isValid = true;
            }
            
            if ($isValid) {
                // Hash the new password securely
                $new_hash = password_hash($data->new_password, PASSWORD_DEFAULT);
                $update = $db->prepare("UPDATE admins SET password_hash = :hash, must_change_password = 0 WHERE username = :username");
                $update->bindParam(":hash", $new_hash);
                $update->bindParam(":username", $data->username);
                
                if($update->execute()) {
                    echo json_encode(array("success" => true, "status" => "PASSWORD_CHANGED"));
                } else {
                    http_response_code(500);
                    echo json_encode(array("error" => "Failed to update password."));
                }
            } else {
                http_response_code(401);
                echo json_encode(array("error" => "Invalid old password."));
            }
        } else {
            http_response_code(401);
            echo json_encode(array("error" => "User not found."));
        }
    } else {
         http_response_code(400);
         echo json_encode(array("error" => "Missing required fields."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("error" => "Invalid action."));
}
?>
