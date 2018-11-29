-- MySQL dump 10.13  Distrib 5.7.24, for Linux (x86_64)
--
-- Host: localhost    Database: GSagrav2
-- ------------------------------------------------------
-- Server version	5.7.24-0ubuntu0.16.04.1-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `ads`
--

DROP TABLE IF EXISTS `ads`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ads` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `desc` varchar(32) DEFAULT NULL,
  `rank` int(11) NOT NULL,
  `visualized` int(11) NOT NULL DEFAULT '0',
  `image_src` varchar(64) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ads_id_uindex` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ads`
--

LOCK TABLES `ads` WRITE;
/*!40000 ALTER TABLE `ads` DISABLE KEYS */;
INSERT INTO `ads` VALUES (1,'sampa',2,2,'/ads/%sampa.png'),(3,'coin',1,1,'/ads/%coin.png'),(5,'bsfc',3,1,'/ads/%bsfc.png');
/*!40000 ALTER TABLE `ads` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `allowed_access`
--

DROP TABLE IF EXISTS `allowed_access`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `allowed_access` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_funzione` int(11) NOT NULL,
  `id_previlegio` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `allowed_access_id_uindex` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `allowed_access`
--

LOCK TABLES `allowed_access` WRITE;
/*!40000 ALTER TABLE `allowed_access` DISABLE KEYS */;
INSERT INTO `allowed_access` VALUES (1,1,1),(3,1,2),(5,1,4),(7,2,1),(9,3,5);
/*!40000 ALTER TABLE `allowed_access` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categoria`
--

DROP TABLE IF EXISTS `categoria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `categoria` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(32) DEFAULT NULL,
  `icona` varchar(16) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  UNIQUE KEY `categoria_id_uindex` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categoria`
--

LOCK TABLES `categoria` WRITE;
/*!40000 ALTER TABLE `categoria` DISABLE KEYS */;
INSERT INTO `categoria` VALUES (1,'Cassa',''),(3,'Risorse',''),(5,'Amministrazione',''),(7,'Macros','');
/*!40000 ALTER TABLE `categoria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cupons`
--

DROP TABLE IF EXISTS `cupons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cupons` (
  `id` int(11) NOT NULL,
  `tipo` int(11) NOT NULL,
  `valore` float DEFAULT NULL,
  `minimo` float DEFAULT NULL,
  `usato` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `cupons_id_uindex` (`id`),
  KEY `cupons_cupons_types_id_fk` (`tipo`),
  CONSTRAINT `cupons_cupons_types_id_fk` FOREIGN KEY (`tipo`) REFERENCES `cupons_types` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cupons`
--

LOCK TABLES `cupons` WRITE;
/*!40000 ALTER TABLE `cupons` DISABLE KEYS */;
INSERT INTO `cupons` VALUES (12548,1,-1,10,0),(45885,5,32,15.5,0),(52484,3,20,100,0);
/*!40000 ALTER TABLE `cupons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cupons_types`
--

DROP TABLE IF EXISTS `cupons_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cupons_types` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `descrizione` varchar(32) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Cupons_types_id_uindex` (`id`),
  UNIQUE KEY `Cupons_types_descrizione_uindex` (`descrizione`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cupons_types`
--

LOCK TABLES `cupons_types` WRITE;
/*!40000 ALTER TABLE `cupons_types` DISABLE KEYS */;
INSERT INTO `cupons_types` VALUES (3,'FIXED'),(1,'FULL'),(5,'PERCENTAGE');
/*!40000 ALTER TABLE `cupons_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `details`
--

DROP TABLE IF EXISTS `details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `details` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `json` text NOT NULL,
  `human_dec` varchar(32) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `details_id_uindex` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `details`
--

LOCK TABLES `details` WRITE;
/*!40000 ALTER TABLE `details` DISABLE KEYS */;
INSERT INTO `details` VALUES (1,'{\"display\": false}','NULL'),(3,'{\"display\": true, \"dialog\": {\"choose\": [\"frizzante\", \"naturale\"]}, \"title\": \"Ancora alcuni dettagli...\"}','vini'),(5,'{\"display\": true, \"dialog\": {\"select\": [\"ketchup\", \"senape\", \"mayo\"]}, \"title\": \"Ancora alcuni dettagli...\"}','panini');
/*!40000 ALTER TABLE `details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `funzioni`
--

DROP TABLE IF EXISTS `funzioni`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `funzioni` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `titolo` varchar(64) NOT NULL,
  `descrizione` varchar(64) NOT NULL DEFAULT '',
  `categoria` int(11) DEFAULT NULL,
  `icona` varchar(16) NOT NULL,
  `req_prev` int(11) NOT NULL DEFAULT '0',
  `to` varchar(32) NOT NULL,
  `tooltip` varchar(64) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `funzioni_id_uindex` (`id`),
  UNIQUE KEY `funzioni_titolo_uindex` (`titolo`),
  KEY `funzioni_categoria_id_fk` (`categoria`),
  CONSTRAINT `funzioni_categoria_id_fk` FOREIGN KEY (`categoria`) REFERENCES `categoria` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `funzioni`
--

LOCK TABLES `funzioni` WRITE;
/*!40000 ALTER TABLE `funzioni` DISABLE KEYS */;
INSERT INTO `funzioni` VALUES (1,'Cassa','',1,'\'\'',1,'/newOrdine',NULL),(3,'Magazzino','Gestione magazzino e risorse',3,'\'\'',5,'/magazzino',NULL),(5,'Statistiche','Andamenti e incassi',3,'\'\'',7,'/stats',NULL),(7,'Editor','Editor modelli pdf',5,'\'\'',11,'/editor',NULL);
/*!40000 ALTER TABLE `funzioni` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gruppi_cucina`
--

DROP TABLE IF EXISTS `gruppi_cucina`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `gruppi_cucina` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(20) NOT NULL,
  `bg` varchar(64) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `gruppi_cucina_id_uindex` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gruppi_cucina`
--

LOCK TABLES `gruppi_cucina` WRITE;
/*!40000 ALTER TABLE `gruppi_cucina` DISABLE KEYS */;
INSERT INTO `gruppi_cucina` VALUES (1,'PRIMI PIATTI','/bg/food.jpg'),(3,'SECONDI PIATTI','/bg/food.jpg'),(5,'ALL IN ONE','/bg/food.jpg'),(7,'DESSERT','/bg/food.jpg'),(9,'BIRRE','/bg/food.jpg'),(11,'VINI','/bg/food.jpg'),(13,'ALCOLICI','/bg/food.jpg');
/*!40000 ALTER TABLE `gruppi_cucina` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `magazzino`
--

DROP TABLE IF EXISTS `magazzino`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `magazzino` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `descrizione` varchar(64) NOT NULL,
  `info` text,
  `giacenza` int(11) NOT NULL DEFAULT '0',
  `prezzoEur` int(11) NOT NULL DEFAULT '0',
  `prezzoCents` int(11) NOT NULL DEFAULT '0',
  `gruppo` int(11) NOT NULL,
  `details` int(11) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `magazzino_id_uindex` (`id`),
  KEY `magazzino_gruppi_cucina_id_fk` (`gruppo`),
  KEY `magazzino_details_id_fk` (`details`),
  CONSTRAINT `magazzino_details_id_fk` FOREIGN KEY (`details`) REFERENCES `details` (`id`),
  CONSTRAINT `magazzino_gruppi_cucina_id_fk` FOREIGN KEY (`gruppo`) REFERENCES `gruppi_cucina` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `magazzino`
--

LOCK TABLES `magazzino` WRITE;
/*!40000 ALTER TABLE `magazzino` DISABLE KEYS */;
INSERT INTO `magazzino` VALUES (1,'Pane e salamella','Panino caldo con salamella di maiale',100,10,0,5,5),(3,'Pasta','Pomodoro',100,25,0,1,1),(5,'Filetto','Cavallo',30,50,0,3,1),(7,'Bionda Pills',NULL,100,10,50,9,1),(9,'Mora Polls',NULL,100,10,50,9,1),(11,'Sorbetto',NULL,100,11,5,7,1),(13,'Vino rosso','Vino amabile, da tavola, (Vino-schifo)',100,10,10,11,3),(15,'Vino bianco',NULL,3,10,10,11,3),(17,'Amaro montenegro','sapore vero',30,30,30,13,1),(19,'Barolo','Sei un cazzo di riccone di merda',100,50,50,11,3),(21,'vino1',NULL,100,10,0,11,3),(23,'vino2',NULL,100,10,0,11,1),(25,'vino3',NULL,100,10,0,11,1),(27,'vino4',NULL,100,10,0,11,1),(29,'vino5',NULL,100,10,0,11,1),(31,'vino6',NULL,100,10,0,11,1);
/*!40000 ALTER TABLE `magazzino` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `previlegi`
--

DROP TABLE IF EXISTS `previlegi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `previlegi` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `description` varchar(32) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `abilities_id_uindex` (`id`),
  UNIQUE KEY `abilities_description_uindex` (`description`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `previlegi`
--

LOCK TABLES `previlegi` WRITE;
/*!40000 ALTER TABLE `previlegi` DISABLE KEYS */;
INSERT INTO `previlegi` VALUES (9,'AZIONI'),(3,'BUONI'),(1,'CASSA'),(11,'EDITOR'),(5,'MAGAZZINO'),(13,'PRIV7'),(7,'STATISTICHE');
/*!40000 ALTER TABLE `previlegi` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `utenti`
--

DROP TABLE IF EXISTS `utenti`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `utenti` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(32) NOT NULL,
  `password` varchar(41) NOT NULL,
  `name` varchar(32) NOT NULL,
  `secure` tinyint(1) NOT NULL DEFAULT '0',
  `enabled` tinyint(1) NOT NULL DEFAULT '0',
  `admin` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `utenti_id_uindex` (`id`),
  UNIQUE KEY `utenti_username_uindex` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `utenti`
--

LOCK TABLES `utenti` WRITE;
/*!40000 ALTER TABLE `utenti` DISABLE KEYS */;
INSERT INTO `utenti` VALUES (1,'stefano','2866093772d6f50c923fb6a19f976bb22e87124c','Stefano',1,1,1),(3,'giovanni','d033e22ae348aeb5660fc2140aec35850c4da997','Enrichetto',1,1,0),(4,'luucaa','d033e22ae348aeb5660fc2140aec35850c4da997','Luca',0,1,1),(5,'luca','d033e22ae348aeb5660fc2140aec35850c4da997','Luca',0,1,0),(7,'matteo','0f6eb7fe64dc90c95a2e10db7f865825cad49c9b','cipo',1,1,0),(11,'pier','c44386c0d8a91e6dd5ec8dcc9120c23ad83cf827','Pierangelo',1,1,1);
/*!40000 ALTER TABLE `utenti` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `utenti_previlegi_assoc`
--

DROP TABLE IF EXISTS `utenti_previlegi_assoc`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `utenti_previlegi_assoc` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `utenti_FOREGIN` int(11) NOT NULL,
  `previlegi_FOREGIN` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `utenti_previlegi_assoc_id_uindex` (`id`),
  KEY `utenti_previlegi_assoc_abilities_id_fk` (`utenti_FOREGIN`),
  KEY `utenti_previlegi_assoc_previlegi_id_fk` (`previlegi_FOREGIN`),
  CONSTRAINT `utenti_previlegi_assoc_abilities_id_fk` FOREIGN KEY (`utenti_FOREGIN`) REFERENCES `previlegi` (`id`),
  CONSTRAINT `utenti_previlegi_assoc_previlegi_id_fk` FOREIGN KEY (`previlegi_FOREGIN`) REFERENCES `previlegi` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=90 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `utenti_previlegi_assoc`
--

LOCK TABLES `utenti_previlegi_assoc` WRITE;
/*!40000 ALTER TABLE `utenti_previlegi_assoc` DISABLE KEYS */;
INSERT INTO `utenti_previlegi_assoc` VALUES (51,3,1),(53,3,3),(55,3,5),(57,3,7),(59,3,11),(63,1,1),(65,1,3),(67,1,5),(69,1,7),(71,1,9),(73,1,11),(75,1,13),(77,5,1),(79,7,1),(85,11,1),(87,11,7),(89,11,13);
/*!40000 ALTER TABLE `utenti_previlegi_assoc` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2018-11-29  8:11:32
