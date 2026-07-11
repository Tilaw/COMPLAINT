-- Users (Admins) Table
CREATE TABLE IF NOT EXISTS `admins` (
  `username` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `must_change_password` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert Default Admin
-- We store the initial password in plain text, but auth.php will force a change to a hashed password upon first login.
INSERT IGNORE INTO `admins` (`username`, `password_hash`, `must_change_password`) VALUES
('hossein@taslim.ae', 'admin@hossein', 1);

-- Complaints Table (Updated for media paths)
CREATE TABLE IF NOT EXISTS `complaints` (
  `id` varchar(50) NOT NULL,
  `timestamp` datetime NOT NULL,
  `worker` varchar(100) NOT NULL,
  `riderName` varchar(100) NOT NULL,
  `riderPhone` varchar(50) NOT NULL,
  `riderId` varchar(50) NOT NULL,
  `platform` varchar(50) NOT NULL,
  `details` text NOT NULL,
  `image_path` varchar(255) DEFAULT NULL,
  `audio_path` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
