CREATE TABLE IF NOT EXISTS `complaints` (
  `id` varchar(50) NOT NULL,
  `timestamp` datetime NOT NULL,
  `worker` varchar(100) NOT NULL,
  `riderName` varchar(100) NOT NULL,
  `riderPhone` varchar(50) NOT NULL,
  `riderId` varchar(50) NOT NULL,
  `platform` varchar(50) NOT NULL,
  `details` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
