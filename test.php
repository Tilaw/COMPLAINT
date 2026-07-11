<?php
$host = "localhost";
$db_name = "complaints_db";
$username = "complaints_db";
$password = "Til@w19988";

try {
    $db = new PDO("mysql:host=" . $host . ";dbname=" . $db_name, $username, $password);
    
    echo "<h1>✅ Database Connection Successful!</h1>";
    
    // Check if admins table exists
    $stmt = $db->query("SHOW TABLES LIKE 'admins'");
    if($stmt->rowCount() > 0) {
        echo "<p>✅ 'admins' table exists!</p>";
        
        // Check if Hossein is in the table
        $stmt2 = $db->query("SELECT * FROM admins WHERE username = 'hossein@taslim.ae'");
        if($stmt2->rowCount() > 0) {
            echo "<p>✅ 'hossein@taslim.ae' user exists in the table!</p>";
        } else {
            echo "<p>❌ 'hossein@taslim.ae' user is MISSING from the table!</p>";
        }
    } else {
        echo "<p>❌ 'admins' table DOES NOT EXIST!</p>";
    }
    
} catch(PDOException $e) {
    echo "<h1>❌ Database Connection Failed!</h1>";
    echo "<p>Error: " . $e->getMessage() . "</p>";
    echo "<p>This means your database username/password in auth.php is incorrect, or the database doesn't exist.</p>";
}
?>
