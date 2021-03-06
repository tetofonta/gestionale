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
  `desc` varchar(32) NOT NULL,
  `rank` int(11) NOT NULL,
  `visualized` int(11) NOT NULL DEFAULT '0',
  `image_src` varchar(64) NOT NULL,
  `total_visualization` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `ads_id_uindex` (`id`),
  UNIQUE KEY `ads_desc_uindex` (`desc`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ads`
--

LOCK TABLES `ads` WRITE;
/*!40000 ALTER TABLE `ads` DISABLE KEYS */;
INSERT INTO `ads` VALUES (1,'sampa',2,1,'/ads/%sampa.png',207),(3,'coin',1,1,'/ads/%coin.png',109),(5,'bsfc',3,0,'/ads/%bsfc.png',105);
/*!40000 ALTER TABLE `ads` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `answers`
--

DROP TABLE IF EXISTS `answers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `answers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `answer` varchar(10) DEFAULT NULL,
  `details` varchar(256) DEFAULT NULL,
  `question` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `answers_id_uindex` (`id`),
  KEY `answers_questions_id_fk` (`question`),
  CONSTRAINT `answers_questions_id_fk` FOREIGN KEY (`question`) REFERENCES `questions` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `answers`
--

LOCK TABLES `answers` WRITE;
/*!40000 ALTER TABLE `answers` DISABLE KEYS */;
INSERT INTO `answers` VALUES (1,'NO','1',1),(3,'3','-',3),(5,'-','nmb.',5),(7,'YES','1',1),(9,'4','-',3),(11,'-','-',5),(13,'YES','fyyuol',1),(15,'3','-',3),(17,'-','ryofgugogyug',5);
/*!40000 ALTER TABLE `answers` ENABLE KEYS */;
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
INSERT INTO `categoria` VALUES (1,'Cassa',''),(3,'Risorse',''),(5,'Amministrazione',''),(7,'Analisi','');
/*!40000 ALTER TABLE `categoria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `credentials`
--

DROP TABLE IF EXISTS `credentials`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `credentials` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user` varchar(32) NOT NULL,
  `passw_hash` varchar(41) NOT NULL,
  `client` varchar(40) DEFAULT NULL,
  `used` int(11) NOT NULL DEFAULT '0',
  `initiate` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `credentials_id_uindex` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `credentials`
--

LOCK TABLES `credentials` WRITE;
/*!40000 ALTER TABLE `credentials` DISABLE KEYS */;
INSERT INTO `credentials` VALUES (9,'6RgWJxCJl8','97e63bfd751badca93acc8815a85f7538fd966ef','127.0.0.1',1,1646173661),(17,'D2V7LH9YWz','c890fc5a4e47b2c9af26b8a0edd30fbece32e9a4',NULL,0,1548947704);
/*!40000 ALTER TABLE `credentials` ENABLE KEYS */;
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
  `valore_venduto` float DEFAULT '0',
  `accettato_usr` varchar(41) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cupons_id_uindex` (`id`),
  KEY `cupons_cupons_types_id_fk` (`tipo`),
  KEY `cupons_utenti_username_fk` (`accettato_usr`),
  CONSTRAINT `cupons_cupons_types_id_fk` FOREIGN KEY (`tipo`) REFERENCES `cupons_types` (`id`),
  CONSTRAINT `cupons_utenti_username_fk` FOREIGN KEY (`accettato_usr`) REFERENCES `utenti` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cupons`
--

LOCK TABLES `cupons` WRITE;
/*!40000 ALTER TABLE `cupons` DISABLE KEYS */;
INSERT INTO `cupons` VALUES (12548,2,10,10,0,11.23,'stefano'),(35091,2,50,50,1543672733,10,'pier'),(45885,2,32,15.5,0,11.5,'stefano'),(46904,3,50,50,1544706931,23,'stefano'),(52484,1,20,30,1544706831,105,'stefano');
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cupons_types`
--

LOCK TABLES `cupons_types` WRITE;
/*!40000 ALTER TABLE `cupons_types` DISABLE KEYS */;
INSERT INTO `cupons_types` VALUES (2,'FIXED'),(1,'FULL'),(3,'PERCENTAGE');
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
  `icona` varchar(48) NOT NULL,
  `req_prev` int(11) NOT NULL DEFAULT '0',
  `to` varchar(32) NOT NULL,
  `tooltip` varchar(64) DEFAULT NULL,
  `isPrivate` int(11) NOT NULL DEFAULT '1',
  `isPublic` int(11) NOT NULL DEFAULT '0',
  `moduleName` varchar(64) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  UNIQUE KEY `funzioni_id_uindex` (`id`),
  UNIQUE KEY `funzioni_titolo_uindex` (`titolo`),
  KEY `funzioni_categoria_id_fk` (`categoria`),
  KEY `funzioni_previlegi_id_fk` (`req_prev`),
  CONSTRAINT `funzioni_categoria_id_fk` FOREIGN KEY (`categoria`) REFERENCES `categoria` (`id`),
  CONSTRAINT `funzioni_previlegi_id_fk` FOREIGN KEY (`req_prev`) REFERENCES `previlegi` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `funzioni`
--

LOCK TABLES `funzioni` WRITE;
/*!40000 ALTER TABLE `funzioni` DISABLE KEYS */;
INSERT INTO `funzioni` VALUES (1,'Cassa','Crea il tuo ordine',1,'fas fa-money-bill-alt',1,'newOrdine','Crea il tuo ordine personalizzandolo come vuoi',1,1,'cassa'),(3,'Magazzino','Gestione magazzino e risorse',3,'fas fa-warehouse',5,'magazzino',NULL,1,0,'magazzino'),(5,'Statistiche','Andamenti e incassi',7,'fas fa-chart-bar',7,'stats',NULL,1,0,'statistica'),(7,'Editor','Editor modelli pdf',5,'fas fa-edit',11,'editor',NULL,0,0,'editor'),(9,'Gestione Buoni','Gestisci e crea buoni',5,'fas fa-piggy-bank',3,'buoni',NULL,1,0,'buoni'),(11,'Storico','Storico e gestione ordini',7,'fas fa-history',9,'storico',NULL,1,0,'storico'),(13,'Cassa Self','',1,'fas fa-barcode',1,'self',NULL,1,0,'cassa_self'),(15,'Feedback','Dicci cosa ne pensi',1,'fas fa-comments',1,'guestFeedback','Dicci come ti sei trovato',0,1,'feedback'),(17,'Gestione Ads','Permette di aggiungere, rimuovere e gestire gli advertisement',5,'fas fa-ad',15,'AdsManager',NULL,1,0,'adsmanager'),(19,'Gestione ordini magazzino','Permette di determinare il numero di ordine a seguire',5,'fas fa-sort-numeric-up',15,'OrderOptions',NULL,1,0,'ordermanager'),(21,'Accedi ad Internet','Fai un ordine, puoi navigare gratis!',1,'fas fa-ethernet',1,'nwlogin',NULL,0,1,'networklogin');
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
INSERT INTO `magazzino` VALUES (1,'Pane e salamella','Panino caldo con salamella di maiale',81,10,0,5,5),(3,'Pasta','Pomodoro',93,25,0,1,1),(5,'Filetto','Cavallo',11,50,0,3,1),(7,'Bionda Pills',NULL,92,10,50,9,1),(9,'Mora Polls',NULL,93,10,50,9,1),(11,'Sorbetto',NULL,95,11,5,7,1),(13,'Vino rosso','Vino amabile, da tavola, (Vino-schifo)',100,10,10,11,3),(15,'Vino bianco',NULL,3,10,10,11,3),(17,'Amaro montenegro','sapore vero',25,30,30,13,1),(19,'Barolo','Sei un cazzo di riccone di merda',97,50,50,11,3),(21,'vino1',NULL,97,10,0,11,3),(23,'vino2',NULL,90,10,0,11,1),(25,'vino3',NULL,91,10,0,11,1),(27,'vino4',NULL,91,10,0,11,1),(29,'vino5',NULL,99,10,0,11,1),(31,'vino6',NULL,97,10,0,11,1);
/*!40000 ALTER TABLE `magazzino` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ordini_dettagli`
--

DROP TABLE IF EXISTS `ordini_dettagli`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ordini_dettagli` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_distict` varchar(60) NOT NULL,
  `ordnum` varchar(10) NOT NULL,
  `message` text,
  `asporto` int(11) NOT NULL,
  `client` varchar(20) DEFAULT NULL,
  `timestamp` int(11) NOT NULL,
  `user` varchar(32) NOT NULL DEFAULT 'admin',
  PRIMARY KEY (`id`),
  UNIQUE KEY `ordini_dettagli_id_uindex` (`id`),
  KEY `ordini_dettagli_utenti_username_fk` (`user`),
  CONSTRAINT `ordini_dettagli_utenti_username_fk` FOREIGN KEY (`user`) REFERENCES `utenti` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=98 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ordini_dettagli`
--

LOCK TABLES `ordini_dettagli` WRITE;
/*!40000 ALTER TABLE `ordini_dettagli` DISABLE KEYS */;
INSERT INTO `ordini_dettagli` VALUES (13,'gtyufog','0001','',0,'192.168.178.23',1543766464,'pier'),(15,'vdhjlkb','0002','',0,'192.168.178.23',1543766526,'pier'),(17,'bgfgb','0003','',0,'192.168.178.23',1543780495,'pier'),(19,'gferwgteh','0004','',0,'192.168.178.23',1543780497,'pier'),(23,'edoyutoguni','0000','',0,'192.168.178.23',1543847294,'pier'),(25,'gferwgteh','0004',' ',0,'192.168.178.23',1543871925,'pier'),(27,'gferwgteh1543872016286','0004',' ',0,'192.168.178.23',1543872016,'pier'),(37,'bgfgb1543873938639','0003',' ',0,'192.168.178.23',1543873938,'reprint'),(39,'bgfgb1543874034702','0003',' ',0,'192.168.178.23',1543874034,'reprint'),(41,'gferwgteh1543914727286','0004','  ',0,'192.168.178.23',1543914727,'reprint'),(43,'gferwgteh1543915010177','0004',' ',0,'192.168.178.23',1543915010,'reprint'),(45,'emilubibuqo','0000','',0,'192.168.43.52',1543915161,'stefano'),(47,'ajiruyacece','0000','',0,'192.168.43.52',1544002853,'stefano'),(49,'ajiruyacece1544002900867','0000',' ',0,'192.168.43.52',1544002900,'reprint'),(51,'ajiruyacece1544004141264','0000',' ',0,'192.168.43.52',1544004141,'reprint'),(53,'ugevufofive','0000','',0,'192.168.178.23',1544113839,'stefano'),(55,'ovoyacakegi','0000','',0,'192.168.178.23',1544114083,'stefano'),(57,'utiyujayifi','0000','',0,'192.168.178.23',1544118242,'stefano'),(59,'ovoyacakegi1544120442496','0000',' ',0,'192.168.178.23',1544120442,'reprint'),(61,'ovoyacakegi1544120452521','0000',' ',0,'192.168.178.23',1544120452,'reprint'),(63,'utiyujayifi1544120516349','0000',' ',0,'192.168.178.23',1544120516,'reprint'),(65,'umaqiqupujo','0006','',0,'unavailable',1544302524,'stefano'),(67,'icagozotulo','0004','',0,'self',1544378937,'Operator self'),(69,'ihoyaqumali','0000','',0,'self',1544384126,'Operator self'),(71,'umuhutizaqu','0000','',0,'self',1544384315,'Operator self'),(73,'emegeverujo','0000','bvnbvnmxvnxh',1,'12222',1544736711,'stefano'),(75,'ulobeqotequ','0001','',0,'192.168.1.46',1544997229,'stefano'),(77,'ulobeqotequ','0001','',0,'192.168.1.46',1544997232,'stefano'),(79,'oqozilotahe','0003','',0,'192.168.1.46',1545059616,'stefano'),(81,'alecohacihi','0004','',0,'192.168.1.46',1545059896,'stefano'),(83,'uhamudiluqe','0005','',0,'192.168.1.46',1545060004,'stefano'),(85,'ecebiteluku','0005','',0,'self',1545129866,'Operator self'),(87,'ofilazutope','0005','',0,'::ffff:192.168.122.1',1545482415,'stefano'),(89,'opopoveyati','0005','',1,'192.168.122.1',1546426018,'stefano'),(91,'ehizunusali','0006','',1,'self',1546426052,'Operator self'),(93,'uyiforupoji','0006','',1,'192.168.122.1',1546702945,'stefano'),(95,'itagesuhame','0006','fff',1,'self',1547025965,'Operator self'),(97,'akezaledoli','0006','',0,'self',1547631719,'Operator self');
/*!40000 ALTER TABLE `ordini_dettagli` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ordini_prodotti`
--

DROP TABLE IF EXISTS `ordini_prodotti`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ordini_prodotti` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order` int(11) NOT NULL,
  `product` int(11) NOT NULL,
  `variant` text,
  `qta` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ordini_prodotti_id_uindex` (`id`),
  KEY `ordini_prodotti_ordini_dettagli_id_fk` (`order`),
  KEY `ordini_prodotti_magazzino_id_fk` (`product`),
  CONSTRAINT `ordini_prodotti_magazzino_id_fk` FOREIGN KEY (`product`) REFERENCES `magazzino` (`id`),
  CONSTRAINT `ordini_prodotti_ordini_dettagli_id_fk` FOREIGN KEY (`order`) REFERENCES `ordini_dettagli` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=250 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ordini_prodotti`
--

LOCK TABLES `ordini_prodotti` WRITE;
/*!40000 ALTER TABLE `ordini_prodotti` DISABLE KEYS */;
INSERT INTO `ordini_prodotti` VALUES (13,13,1,'NULL',3),(15,15,1,'[{\"qta\":3,\"var\":{\"select\":{\"values\":[null,true,true],\"labels\":[\"ketchup\",\"senape\",\"mayo\"]}}}]',3),(17,17,3,'NULL',2),(19,19,3,'NULL',2),(21,19,1,'[{\"qta\":3,\"var\":{\"select\":{\"values\":[null,true,true],\"labels\":[\"ketchup\",\"senape\",\"mayo\"]}}}]',2),(23,23,5,'NULL',1),(25,23,1,'[{\"qta\":2,\"var\":{\"select\":{\"values\":[null,true,true],\"labels\":[\"ketchup\",\"senape\",\"mayo\"]}}}]',2),(27,25,3,'NULL',2),(29,25,1,'[{\"qta\":3,\"var\":{\"select\":{\"values\":[null,true,true],\"labels\":[\"ketchup\",\"senape\",\"mayo\"]}}}]',2),(31,27,3,'NULL',2),(33,27,1,'[{\"qta\":3,\"var\":{\"select\":{\"values\":[null,true,true],\"labels\":[\"ketchup\",\"senape\",\"mayo\"]}}}]',2),(35,27,3,'NULL',2),(37,27,1,'[{\"qta\":3,\"var\":{\"select\":{\"values\":[null,true,true],\"labels\":[\"ketchup\",\"senape\",\"mayo\"]}}}]',2),(61,37,3,'NULL',2),(63,39,3,'NULL',2),(65,41,3,'NULL',2),(67,41,1,'[{\"qta\":3,\"var\":{\"select\":{\"values\":[null,true,true],\"labels\":[\"ketchup\",\"senape\",\"mayo\"]}}}]',2),(69,41,3,'NULL',2),(71,41,1,'[{\"qta\":3,\"var\":{\"select\":{\"values\":[null,true,true],\"labels\":[\"ketchup\",\"senape\",\"mayo\"]}}}]',2),(73,43,3,'NULL',2),(75,43,1,'[{\"qta\":3,\"var\":{\"select\":{\"values\":[null,true,true],\"labels\":[\"ketchup\",\"senape\",\"mayo\"]}}}]',2),(77,43,3,'NULL',2),(79,43,1,'[{\"qta\":3,\"var\":{\"select\":{\"values\":[null,true,true],\"labels\":[\"ketchup\",\"senape\",\"mayo\"]}}}]',2),(81,45,5,'NULL',2),(83,47,3,'NULL',2),(85,47,7,'NULL',2),(87,47,27,'NULL',2),(89,51,3,'NULL',2),(91,51,7,'NULL',2),(93,51,27,'NULL',2),(95,53,5,'NULL',2),(97,53,7,'NULL',2),(99,53,9,'NULL',1),(101,53,25,'NULL',2),(103,53,27,'NULL',2),(105,53,29,'NULL',1),(107,53,31,'NULL',1),(109,53,11,'NULL',3),(111,55,7,'NULL',2),(113,55,25,'NULL',2),(115,55,31,'NULL',2),(117,55,11,'NULL',2),(119,57,3,'NULL',2),(121,59,7,'NULL',2),(123,59,25,'NULL',2),(125,59,31,'NULL',2),(127,59,11,'NULL',2),(129,61,7,'NULL',2),(131,61,25,'NULL',2),(133,61,31,'NULL',2),(135,61,11,'NULL',2),(137,63,3,'NULL',2),(139,65,3,'NULL',2),(141,65,1,'[{\"qta\":2,\"var\":{\"select\":{\"values\":[true,null,true],\"labels\":[\"ketchup\",\"senape\",\"mayo\"]}}},{\"qta\":2,\"eur\":10,\"cents\":0,\"var\":{\"choose\":null,\"select\":{\"values\":[null,true],\"labels\":[\"ketchup\",\"senape\",\"mayo\"]}}}]',4),(143,65,9,'NULL',2),(145,65,27,'NULL',1),(147,65,25,'NULL',2),(149,65,19,'[{\"qta\":1,\"var\":{\"choose\":\"frizzante\",\"select\":{\"values\":[]}}}]',1),(151,65,11,'NULL',1),(153,67,27,'NULL',3),(155,67,25,'NULL',1),(157,67,19,'[{\"qta\":2,\"var\":{\"select\":{\"values\":[]}}}]',2),(159,69,5,'NULL',2),(161,69,7,'NULL',1),(163,69,9,'NULL',4),(165,69,17,'NULL',1),(167,69,23,'NULL',3),(169,69,25,'NULL',1),(171,71,5,'NULL',3),(173,71,7,'NULL',4),(175,73,3,'NULL',2),(177,73,1,'[{\"qta\":1,\"var\":{\"choose\":null,\"select\":{\"values\":[true,true],\"labels\":[\"ketchup\",\"senape\",\"mayo\"]}}},{\"qta\":2,\"eur\":10,\"cents\":0,\"var\":{\"choose\":null,\"select\":{\"values\":[null,true,true],\"labels\":[\"ketchup\",\"senape\",\"mayo\"]}}}]',3),(179,73,25,'NULL',1),(181,73,27,'NULL',3),(183,73,21,'[{\"qta\":3,\"var\":{\"choose\":\"naturale\",\"select\":{\"values\":[]}}}]',3),(185,73,31,'NULL',1),(187,75,5,'NULL',2),(189,75,23,'NULL',2),(191,75,25,'NULL',1),(193,77,5,'NULL',2),(195,77,23,'NULL',2),(197,77,25,'NULL',1),(199,81,3,'NULL',1),(201,81,1,'[{\"qta\":1,\"var\":{\"select\":{\"values\":[null,true,true],\"labels\":[\"ketchup\",\"senape\",\"mayo\"]}}},{\"qta\":2,\"eur\":10,\"cents\":0,\"var\":{\"choose\":null,\"select\":{\"values\":[true],\"labels\":[\"ketchup\",\"senape\",\"mayo\"]}}}]',3),(203,81,17,'NULL',1),(205,83,1,'[{\"qta\":1,\"var\":{\"select\":{\"values\":[],\"labels\":[\"ketchup\",\"senape\",\"mayo\"]}}},{\"qta\":1,\"eur\":10,\"cents\":0,\"var\":{\"choose\":null,\"select\":{\"values\":[true],\"labels\":[\"ketchup\",\"senape\",\"mayo\"]}}},{\"qta\":1,\"eur\":10,\"cents\":0,\"var\":{\"choose\":null,\"select\":{\"values\":[null,true],\"labels\":[\"ketchup\",\"senape\",\"mayo\"]}}},{\"qta\":1,\"eur\":10,\"cents\":0,\"var\":{\"choose\":null,\"select\":{\"values\":[null,null,true],\"labels\":[\"ketchup\",\"senape\",\"mayo\"]}}},{\"qta\":1,\"eur\":10,\"cents\":0,\"var\":{\"choose\":null,\"select\":{\"values\":[true,null,true],\"labels\":[\"ketchup\",\"senape\",\"mayo\"]}}}]',5),(207,85,7,'NULL',3),(209,87,5,'NULL',2),(211,87,1,'[{\"qta\":2,\"var\":{\"select\":{\"values\":[null,true,true],\"labels\":[\"ketchup\",\"senape\",\"mayo\"]}}}]',2),(213,87,17,'NULL',2),(215,89,3,'NULL',2),(217,89,5,'NULL',2),(219,89,1,'[{\"qta\":1,\"var\":{\"select\":{\"values\":[null,true,true],\"labels\":[\"ketchup\",\"senape\",\"mayo\"]}}}]',1),(221,89,23,'NULL',1),(223,89,25,'NULL',2),(225,91,5,'NULL',2),(227,91,1,'[{\"qta\":1,\"var\":{\"select\":{\"values\":[null,true,true],\"labels\":[\"ketchup\",\"senape\",\"mayo\"]}}}]',1),(229,91,11,'NULL',1),(231,93,9,'NULL',1),(233,93,27,'NULL',2),(235,93,29,'NULL',1),(237,93,31,'NULL',2),(239,93,11,'NULL',1),(241,95,5,'NULL',1),(243,95,23,'NULL',2),(245,95,17,'NULL',1),(247,95,11,'NULL',2),(249,97,5,'NULL',3);
/*!40000 ALTER TABLE `ordini_prodotti` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `previlegi`
--

LOCK TABLES `previlegi` WRITE;
/*!40000 ALTER TABLE `previlegi` DISABLE KEYS */;
INSERT INTO `previlegi` VALUES (15,'AMMINISTRAZIONE'),(3,'BUONI'),(1,'CASSA'),(11,'EDITOR'),(5,'MAGAZZINO'),(7,'STATISTICHE'),(9,'STORICO'),(13,'UTENTI');
/*!40000 ALTER TABLE `previlegi` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `question_type`
--

DROP TABLE IF EXISTS `question_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `question_type` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `desc` varchar(10) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `question_type_id_uindex` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `question_type`
--

LOCK TABLES `question_type` WRITE;
/*!40000 ALTER TABLE `question_type` DISABLE KEYS */;
INSERT INTO `question_type` VALUES (1,'YESNO'),(2,'STARS'),(3,'EMPTY');
/*!40000 ALTER TABLE `question_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `questions`
--

DROP TABLE IF EXISTS `questions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `questions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `testo` text NOT NULL,
  `answerType` int(11) NOT NULL,
  `details` int(11) NOT NULL,
  `title` varchar(64) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `questions_id_uindex` (`id`),
  KEY `questions_question_type_id_fk` (`answerType`),
  CONSTRAINT `questions_question_type_id_fk` FOREIGN KEY (`answerType`) REFERENCES `question_type` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `questions`
--

LOCK TABLES `questions` WRITE;
/*!40000 ALTER TABLE `questions` DISABLE KEYS */;
INSERT INTO `questions` VALUES (1,'Domanda 1?',1,1,'Domanda1'),(3,'Domanda 2?',2,0,'Domanda2'),(5,'Domanda 3?',3,0,'Domanda3');
/*!40000 ALTER TABLE `questions` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `utenti`
--

LOCK TABLES `utenti` WRITE;
/*!40000 ALTER TABLE `utenti` DISABLE KEYS */;
INSERT INTO `utenti` VALUES (1,'stefano','2866093772d6f50c923fb6a19f976bb22e87124c','Stefano',1,1,1),(3,'giovanni','d033e22ae348aeb5660fc2140aec35850c4da997','Enrichetto',1,1,0),(4,'luucaa','d033e22ae348aeb5660fc2140aec35850c4da997','Luca',0,1,1),(5,'luca','f9c0f8b91180c7d93028c79ef4993e4d5a5b3e59','Luca',1,1,1),(7,'matteo','b1b3773a05c0ed0176787a4f1574ff0075f7521e','cipo',0,1,0),(11,'pier','c44386c0d8a91e6dd5ec8dcc9120c23ad83cf827','Pierangelo',1,1,1),(13,'reprint','unloggable','reprint',1,0,0),(15,'Operator Self','unloggable','Operator Self',1,0,0),(17,'zGCUMaGmze','31d8555e87e3bab8c4eb3289addfee9ed3aedaa6','1',1,1,0),(19,'hZqv1ejqxp','dbd11b200cd0d5b9c122900399935a533d8374bd','2',1,1,0),(21,'bwC0R1Xzhs','999d55e79a6ef57f51f2bfeee9fa84aabfd34627','3',1,1,0),(23,'jZEd8rSlzz','b3edc979879e8156f5b804deac6d0bffd28e6098','4',1,1,0),(25,'crbofQFG90','531200c63562a613a09d54c38b889a66941cda20','5',1,1,0),(27,'tF4zBelNuu','faf12ce7f0fb4f8c5c93a5321283da41b80acfe4','6',1,1,0),(29,'vhl7gGF4GY','39a3a4b19ca47d5fedf72385faf39d3b36150c18','7',1,1,0),(31,'Jphx9LMutr','1fe3510b008eaeb5094253dc7d172758b2dda550','8',1,1,0);
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
  KEY `utenti_previlegi_assoc_previlegi_id_fk` (`previlegi_FOREGIN`),
  KEY `utenti_previlegi_assoc_abilities_id_fk` (`utenti_FOREGIN`),
  CONSTRAINT `utenti_previlegi_assoc_abilities_id_fk` FOREIGN KEY (`utenti_FOREGIN`) REFERENCES `utenti` (`id`),
  CONSTRAINT `utenti_previlegi_assoc_previlegi_id_fk` FOREIGN KEY (`previlegi_FOREGIN`) REFERENCES `previlegi` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=144 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `utenti_previlegi_assoc`
--

LOCK TABLES `utenti_previlegi_assoc` WRITE;
/*!40000 ALTER TABLE `utenti_previlegi_assoc` DISABLE KEYS */;
INSERT INTO `utenti_previlegi_assoc` VALUES (51,3,1),(53,3,3),(55,3,5),(57,3,7),(59,3,11),(85,11,1),(87,11,7),(89,11,13),(93,5,9),(95,5,3),(97,5,1),(99,5,11),(101,5,5),(103,5,13),(105,5,7),(111,7,1),(113,1,15),(115,1,3),(117,1,1),(119,1,11),(121,1,5),(123,1,7),(125,1,9),(127,1,13),(129,17,15),(131,19,3),(133,21,1),(135,23,11),(137,25,5),(139,27,7),(141,29,9),(143,31,13);
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

-- Dump completed on 2019-01-31 16:22:24
