-- MySQL dump 10.13  Distrib 8.0.34, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: gym_xala_db
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `ai_recommendation_log`
--

DROP TABLE IF EXISTS `ai_recommendation_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ai_recommendation_log` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `member_id` bigint NOT NULL,
  `suggested_pt_id` bigint DEFAULT NULL,
  `suggested_package_content` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `recommendation_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `is_accepted` bit(1) DEFAULT b'0',
  PRIMARY KEY (`id`),
  KEY `member_id` (`member_id`),
  KEY `suggested_pt_id` (`suggested_pt_id`),
  CONSTRAINT `ai_recommendation_log_ibfk_1` FOREIGN KEY (`member_id`) REFERENCES `member` (`id`),
  CONSTRAINT `ai_recommendation_log_ibfk_2` FOREIGN KEY (`suggested_pt_id`) REFERENCES `employee` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ai_recommendation_log`
--

LOCK TABLES `ai_recommendation_log` WRITE;
/*!40000 ALTER TABLE `ai_recommendation_log` DISABLE KEYS */;
/*!40000 ALTER TABLE `ai_recommendation_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employee`
--

DROP TABLE IF EXISTS `employee`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `position_id` int DEFAULT NULL,
  `address_gym_id` int DEFAULT NULL,
  `start_work` datetime DEFAULT NULL,
  `pt_rating` double DEFAULT '5',
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pt_specialty` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_employee_user` (`user_id`),
  KEY `idx_employee_position` (`position_id`),
  KEY `idx_employee_gym` (`address_gym_id`),
  CONSTRAINT `fk_employee_gym` FOREIGN KEY (`address_gym_id`) REFERENCES `gym_location` (`id`),
  CONSTRAINT `fk_employee_position` FOREIGN KEY (`position_id`) REFERENCES `position` (`position_id`),
  CONSTRAINT `fk_employee_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employee`
--

LOCK TABLES `employee` WRITE;
/*!40000 ALTER TABLE `employee` DISABLE KEYS */;
/*!40000 ALTER TABLE `employee` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gym_location`
--

DROP TABLE IF EXISTS `gym_location`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gym_location` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gym_location`
--

LOCK TABLES `gym_location` WRITE;
/*!40000 ALTER TABLE `gym_location` DISABLE KEYS */;
/*!40000 ALTER TABLE `gym_location` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `member`
--

DROP TABLE IF EXISTS `member`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `member` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `membercard_id` int DEFAULT NULL,
  `address_gym_id` int DEFAULT NULL,
  `status` bit(1) DEFAULT b'1',
  `height` float DEFAULT NULL,
  `weight` float DEFAULT NULL,
  `bmi` float GENERATED ALWAYS AS ((`weight` / ((`height` / 100) * (`height` / 100)))) STORED,
  `availability_slots` json DEFAULT NULL,
  `cccd` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `goal_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sex` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  KEY `membercard_id` (`membercard_id`),
  KEY `address_gym_id` (`address_gym_id`),
  CONSTRAINT `member_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `member_ibfk_2` FOREIGN KEY (`membercard_id`) REFERENCES `member_card` (`id`),
  CONSTRAINT `member_ibfk_3` FOREIGN KEY (`address_gym_id`) REFERENCES `gym_location` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `member`
--

LOCK TABLES `member` WRITE;
/*!40000 ALTER TABLE `member` DISABLE KEYS */;
/*!40000 ALTER TABLE `member` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `member_card`
--

DROP TABLE IF EXISTS `member_card`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `member_card` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `duration_months` int DEFAULT NULL,
  `price` double DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `member_card`
--

LOCK TABLES `member_card` WRITE;
/*!40000 ALTER TABLE `member_card` DISABLE KEYS */;
/*!40000 ALTER TABLE `member_card` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `packages`
--

DROP TABLE IF EXISTS `packages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `packages` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  `price` double DEFAULT NULL,
  `duration_in_days` int DEFAULT NULL,
  `category` varchar(255) DEFAULT NULL,
  `active` bit(1) DEFAULT b'1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `packages`
--

LOCK TABLES `packages` WRITE;
/*!40000 ALTER TABLE `packages` DISABLE KEYS */;
/*!40000 ALTER TABLE `packages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `position`
--

DROP TABLE IF EXISTS `position`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `position` (
  `position_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`position_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `position`
--

LOCK TABLES `position` WRITE;
/*!40000 ALTER TABLE `position` DISABLE KEYS */;
/*!40000 ALTER TABLE `position` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role`
--

DROP TABLE IF EXISTS `role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=1003 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role`
--

LOCK TABLES `role` WRITE;
/*!40000 ALTER TABLE `role` DISABLE KEYS */;
INSERT INTO `role` VALUES (1002,'ROLE_ADMIN'),(1000,'ROLE_MEMBER'),(1001,'ROLE_PT');
/*!40000 ALTER TABLE `role` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `schedule`
--

DROP TABLE IF EXISTS `schedule`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `schedule` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `member_id` bigint NOT NULL,
  `pt_id` bigint DEFAULT NULL,
  `start_time` datetime DEFAULT NULL,
  `end_time` datetime NOT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING',
  `feedback` text COLLATE utf8mb4_unicode_ci,
  `rating` int DEFAULT NULL,
  `package_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `member_id` (`member_id`),
  KEY `employee_id` (`pt_id`),
  KEY `fk_schedule_package` (`package_id`),
  CONSTRAINT `fk_schedule_package` FOREIGN KEY (`package_id`) REFERENCES `packages` (`id`),
  CONSTRAINT `schedule_ibfk_1` FOREIGN KEY (`member_id`) REFERENCES `member` (`id`),
  CONSTRAINT `schedule_ibfk_2` FOREIGN KEY (`pt_id`) REFERENCES `employee` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `schedule`
--

LOCK TABLES `schedule` WRITE;
/*!40000 ALTER TABLE `schedule` DISABLE KEYS */;
/*!40000 ALTER TABLE `schedule` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_role`
--

DROP TABLE IF EXISTS `user_role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_role` (
  `user_id` bigint NOT NULL,
  `role_id` int NOT NULL,
  PRIMARY KEY (`user_id`,`role_id`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `fk_user_role_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `user_role_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `user_role_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `role` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_role`
--

LOCK TABLES `user_role` WRITE;
/*!40000 ALTER TABLE `user_role` DISABLE KEYS */;
INSERT INTO `user_role` VALUES (1000,1000),(1002,1000),(1003,1000),(1006,1000),(1007,1000),(1008,1000),(1009,1000),(1010,1000),(1011,1000),(1012,1000),(1013,1000),(1014,1000),(1015,1000),(1001,1001),(1004,1001),(1005,1002);
/*!40000 ALTER TABLE `user_role` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `username` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `height` float DEFAULT NULL,
  `weight` float DEFAULT NULL,
  `goal_type` enum('GIAM_CAN','GIU_DANG','SUC_KHOE','TANG_CO') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `availability_slots` json DEFAULT NULL,
  `average_rating` double DEFAULT NULL,
  `pt_specialty` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `verification_code` int DEFAULT NULL,
  `enabled` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=1016 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (999,'test_fk','$2a$10$9fQofWMwmGkpi36poUcPwuVaWn852JhaI.zzxlqsI3Oax10N.D3im','test_fk@gmail.com',NULL,NULL,NULL,NULL,NULL,NULL,'[]',NULL,NULL,NULL,1),(1000,'tannhat','$2a$10$Ckd4KB4z98m7xjPEYDJpWOC4XvYT2/0vSfW4qjK3kprDVw2ZJPdyu','tan@gmail.com','Le Ngoc Nhat Tan',NULL,NULL,175,70,'TANG_CO','[]',NULL,NULL,NULL,1),(1001,'pt_pro','$2a$10$Cm1Sk/nwGLMiQ/wzXWVQP.XKMlroXvTFyo9vEeL8V5llDlyIPl5TS','pt_pro@example.com','Tran Van Coach','0988777666',NULL,180,85,'TANG_CO','[\"TUE_MORNING\", \"THU_MORNING\"]',NULL,'Yoga, HIIT',NULL,1),(1002,'member01','$2a$10$1F3kRaXR8j7tS5GnvPpqP.YJUXv.IUW.pjdc8Fg9MpUlWPTcvcXBu','member01@example.com','Nguyen Van A','0901234567',NULL,170.5,65,'GIAM_CAN','[\"MON_MORNING\", \"WED_EVENING\"]',NULL,NULL,NULL,1),(1003,'member02','$2a$10$/Ixuhx01nPgfeaslGFTgj.cfrAD.N1yCpJ2zDSCDhQ51vEPuGEKDe','member02@example.com','Nguyen Van B','0901234568',NULL,170.5,65,'TANG_CO','[\"MON_MORNING\", \"WED_EVENING\"]',NULL,NULL,NULL,1),(1004,'pt_pro_02','$2a$10$iwm6ThON1.MlDD.q4Z2S1udg1l.n72J335kWU0xgKDfAGPB5FJ0IG','pt_pro_02@example.com','Tran Van Coach B','0988777667',NULL,180,85,'GIAM_CAN','[\"TUE_MORNING\", \"THU_MORNING\"]',NULL,'Yoga, HIIT',NULL,1),(1005,'admin','$2a$10$YvjTAhs3a2DidCVzy6t7y.Ed0xvdquQgv8sdWIt3zajuHj3R/qH0S','admin@gmail.com',NULL,NULL,NULL,NULL,NULL,NULL,'[]',NULL,NULL,NULL,1),(1006,'member03','$2a$10$7caqjtXqBZURMSLCaFKzPOmhrv6Xzflfpd4yBXPALApmXM.vRfHf6','member03@gmail.com','Nguyễn Văn C','0123456003',NULL,170,65,'GIAM_CAN','[\"MON_MORNING\", \"WED_EVENING\"]',NULL,NULL,NULL,1),(1007,'member04','$2a$10$cWssedq4MXKhy6AhwkB.mu5DSXT8H26nTVVOKz2gz8TfoOtP8yZcC','member04@gmail.com','Nguyễn Văn D','0123456004',NULL,NULL,NULL,NULL,'[]',NULL,NULL,NULL,1),(1008,'member05','$2a$10$u9ZFFZ879AbjjXg34SicZOga/ske4ZmNqw5Io6qH6FkokfIjbrE7K','member05@gmail.com','Nguyễn Văn E','0123456005',NULL,NULL,NULL,NULL,'[]',NULL,NULL,198312,0),(1009,'member06','$2a$10$N./08pfiiUmZ0pr6aRAKOeuHZC1XeUE1a0Tavoge6TQxBktfXG2Be','member06@gmail.com','Nguyễn Văn F','0123456006',NULL,NULL,NULL,NULL,'[]',NULL,NULL,NULL,1),(1010,'member07','$2a$10$Yj1k7H.pjgYHcIJ/Osh1f.MMKfLP5/jIZyO6pAWaYZQ1oV8kK1eNW','member07@gmail.com','Nguyễn Văn G','0123456007',NULL,NULL,NULL,NULL,'[]',NULL,NULL,710464,0),(1011,'member08','$2a$10$lib5usuZLBPj2gNoJgOBKuteGLy1iK6/X4QeMRI06EoI/gFrruxsa','member08@gmail.com','Nguyễn Văn H','0123456008',NULL,NULL,NULL,NULL,'[]',NULL,NULL,920092,0),(1012,'member09','$2a$10$XYuQTQdQCTZpJmCVybAMHOZt4oY7/A.cHbzGfhOOwoYMg0Q9vmy3S','member09@gmail.com','Nguyễn Văn I','0123456009',NULL,NULL,NULL,NULL,'[]',NULL,NULL,484211,0),(1013,'member10','$2a$10$Dolov8USvSZ4UCYfBOyZC.yb93BNlJ5bnSLlLLzKj8Qq4XTsZgvI6','member10@gmail.com','Nguyễn Văn J','0123456010',NULL,NULL,NULL,NULL,'[]',NULL,NULL,384701,0),(1014,'member11','$2a$10$D0ChkZLngIzCLZ5Lpa7fFe4i50cfudUcaZA8cTnA43HVz9Z.JCtXG','member11@gmail.com','Nguyễn Văn K','0123456011',NULL,NULL,NULL,NULL,'[]',NULL,NULL,642526,0),(1015,'member12','$2a$10$uDXolu1buw5VGy8r1SFOEeVuSyEzHrZDslV7kRkXPVK1kRdTmsOS2','member12@gmail.com','Nguyễn Văn L','0123456012',NULL,NULL,NULL,NULL,'[]',NULL,NULL,537195,0);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `workout_session`
--

DROP TABLE IF EXISTS `workout_session`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `workout_session` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `schedule_id` bigint NOT NULL,
  `exercise` text COLLATE utf8mb4_unicode_ci,
  `duration` int DEFAULT NULL,
  `calories_burned` int DEFAULT NULL,
  `evaluation` text COLLATE utf8mb4_unicode_ci,
  `rating` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `schedule_id` (`schedule_id`),
  CONSTRAINT `workout_session_ibfk_1` FOREIGN KEY (`schedule_id`) REFERENCES `schedule` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `workout_session`
--

LOCK TABLES `workout_session` WRITE;
/*!40000 ALTER TABLE `workout_session` DISABLE KEYS */;
/*!40000 ALTER TABLE `workout_session` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-05 22:47:38
