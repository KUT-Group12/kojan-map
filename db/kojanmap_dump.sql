-- MySQL dump 10.13  Distrib 8.0.44, for Linux (x86_64)
--
-- Host: localhost    Database: kojanmap
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `ask`
--

DROP TABLE IF EXISTS `ask`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ask` (
  `askId` int NOT NULL AUTO_INCREMENT,
  `date` datetime NOT NULL,
  `subject` varchar(100) NOT NULL,
  `text` text NOT NULL,
  `userId` varchar(50) NOT NULL,
  `askFlag` tinyint(1) NOT NULL,
  PRIMARY KEY (`askId`),
  KEY `userId` (`userId`),
  CONSTRAINT `ask_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `user` (`googleId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ask`
--

LOCK TABLES `ask` WRITE;
/*!40000 ALTER TABLE `ask` DISABLE KEYS */;
/*!40000 ALTER TABLE `ask` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `block`
--

DROP TABLE IF EXISTS `block`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `block` (
  `blockId` int NOT NULL AUTO_INCREMENT,
  `blockerId` varchar(50) NOT NULL,
  `blockedId` varchar(50) NOT NULL,
  PRIMARY KEY (`blockId`),
  KEY `blockerId` (`blockerId`),
  KEY `blockedId` (`blockedId`),
  CONSTRAINT `block_ibfk_1` FOREIGN KEY (`blockerId`) REFERENCES `user` (`googleId`),
  CONSTRAINT `block_ibfk_2` FOREIGN KEY (`blockedId`) REFERENCES `user` (`googleId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `block`
--

LOCK TABLES `block` WRITE;
/*!40000 ALTER TABLE `block` DISABLE KEYS */;
/*!40000 ALTER TABLE `block` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `business`
--

DROP TABLE IF EXISTS `business`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `business` (
  `businessId` int NOT NULL AUTO_INCREMENT,
  `businessName` varchar(50) NOT NULL,
  `kanaBusinessName` varchar(50) NOT NULL,
  `zipCode` varchar(7) DEFAULT NULL,
  `address` varchar(100) NOT NULL,
  `phone` varchar(15) DEFAULT NULL,
  `registDate` datetime NOT NULL,
  `profileImage` blob,
  `userId` varchar(50) NOT NULL,
  `placeId` int NOT NULL,
  PRIMARY KEY (`businessId`),
  KEY `userId` (`userId`),
  KEY `business_ibfk_2` (`placeId`),
  CONSTRAINT `business_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `user` (`googleId`),
  CONSTRAINT `business_ibfk_2` FOREIGN KEY (`placeId`) REFERENCES `place` (`placeId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `business`
--

LOCK TABLES `business` WRITE;
/*!40000 ALTER TABLE `business` DISABLE KEYS */;
/*!40000 ALTER TABLE `business` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `businessReq`
--

DROP TABLE IF EXISTS `businessReq`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `businessReq` (
  `requestId` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `address` varchar(100) NOT NULL,
  `phone` varchar(15) DEFAULT NULL,
  `userId` varchar(50) NOT NULL,
  PRIMARY KEY (`requestId`),
  KEY `userId` (`userId`),
  CONSTRAINT `businessReq_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `user` (`googleId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `businessReq`
--

LOCK TABLES `businessReq` WRITE;
/*!40000 ALTER TABLE `businessReq` DISABLE KEYS */;
/*!40000 ALTER TABLE `businessReq` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `genre`
--

DROP TABLE IF EXISTS `genre`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `genre` (
  `genreId` int NOT NULL AUTO_INCREMENT,
  `genreName` enum('food','event','scene','store','emergency','other') NOT NULL,
  `color` varchar(6) NOT NULL,
  PRIMARY KEY (`genreId`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `genre`
--

LOCK TABLES `genre` WRITE;
/*!40000 ALTER TABLE `genre` DISABLE KEYS */;
INSERT INTO `genre` VALUES (1,'food','FF2E00'),(2,'event','FFA400'),(3,'scene','00E500'),(4,'store','008AFF'),(5,'emergency','B600FF'),(6,'other','CDCCD4');
/*!40000 ALTER TABLE `genre` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `place`
--

DROP TABLE IF EXISTS `place`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `place` (
  `placeId` int NOT NULL AUTO_INCREMENT,
  `numPost` int NOT NULL,
  `latitude` double NOT NULL,
  `longitude` double NOT NULL,
  PRIMARY KEY (`placeId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `place`
--

LOCK TABLES `place` WRITE;
/*!40000 ALTER TABLE `place` DISABLE KEYS */;
/*!40000 ALTER TABLE `place` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `post`
--

DROP TABLE IF EXISTS `post`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `post` (
  `postId` int NOT NULL AUTO_INCREMENT,
  `placeId` int NOT NULL,
  `userId` varchar(50) NOT NULL,
  `postDate` datetime NOT NULL,
  `title` varchar(50) NOT NULL,
  `text` text NOT NULL,
  `postImage` blob,
  `numReaction` int NOT NULL,
  `numView` int NOT NULL,
  `genreId` int NOT NULL,
  PRIMARY KEY (`postId`),
  KEY `userId` (`userId`),
  KEY `post_ibfk_1` (`placeId`),
  KEY `post_ibfk_3` (`genreId`),
  CONSTRAINT `post_ibfk_1` FOREIGN KEY (`placeId`) REFERENCES `place` (`placeId`),
  CONSTRAINT `post_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `user` (`googleId`),
  CONSTRAINT `post_ibfk_3` FOREIGN KEY (`genreId`) REFERENCES `genre` (`genreId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `post`
--

LOCK TABLES `post` WRITE;
/*!40000 ALTER TABLE `post` DISABLE KEYS */;
/*!40000 ALTER TABLE `post` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reaction`
--

DROP TABLE IF EXISTS `reaction`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reaction` (
  `reactionId` int NOT NULL AUTO_INCREMENT,
  `userId` varchar(50) NOT NULL,
  `postId` int NOT NULL,
  PRIMARY KEY (`reactionId`),
  KEY `userId` (`userId`),
  KEY `reaction_ibfk_2` (`postId`),
  CONSTRAINT `reaction_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `user` (`googleId`),
  CONSTRAINT `reaction_ibfk_2` FOREIGN KEY (`postId`) REFERENCES `post` (`postId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reaction`
--

LOCK TABLES `reaction` WRITE;
/*!40000 ALTER TABLE `reaction` DISABLE KEYS */;
/*!40000 ALTER TABLE `reaction` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `report`
--

DROP TABLE IF EXISTS `report`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `report` (
  `reportId` int NOT NULL AUTO_INCREMENT,
  `userId` varchar(50) NOT NULL,
  `postId` int NOT NULL,
  `reason` text NOT NULL,
  `date` datetime NOT NULL,
  `reportFlag` tinyint(1) NOT NULL,
  `removeFlag` tinyint(1) NOT NULL,
  PRIMARY KEY (`reportId`),
  KEY `userId` (`userId`),
  KEY `report_ibfk_2` (`postId`),
  CONSTRAINT `report_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `user` (`googleId`),
  CONSTRAINT `report_ibfk_2` FOREIGN KEY (`postId`) REFERENCES `post` (`postId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `report`
--

LOCK TABLES `report` WRITE;
/*!40000 ALTER TABLE `report` DISABLE KEYS */;
/*!40000 ALTER TABLE `report` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `session`
--

DROP TABLE IF EXISTS `session`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `session` (
  `sessionId` varchar(255) NOT NULL,
  `googleId` varchar(50) NOT NULL,
  `expiry` datetime NOT NULL,
  PRIMARY KEY (`sessionId`),
  KEY `googleId` (`googleId`),
  CONSTRAINT `session_ibfk_1` FOREIGN KEY (`googleId`) REFERENCES `user` (`googleId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `session`
--

LOCK TABLES `session` WRITE;
/*!40000 ALTER TABLE `session` DISABLE KEYS */;
/*!40000 ALTER TABLE `session` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `googleId` varchar(50) NOT NULL,
  `gmail` varchar(100) NOT NULL,
  `role` enum('user','business','admin') NOT NULL,
  `registrationDate` datetime NOT NULL,
  PRIMARY KEY (`googleId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-19 16:59:48
