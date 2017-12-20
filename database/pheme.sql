-- phpMyAdmin SQL Dump
-- version 4.0.4.1
-- http://www.phpmyadmin.net
--
-- Host: 127.0.0.1
-- Generation Time: Dec 20, 2017 at 03:22 PM
-- Server version: 5.6.11
-- PHP Version: 5.5.1

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `pheme`
--
CREATE DATABASE IF NOT EXISTS `pheme` DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci;
USE `pheme`;

-- --------------------------------------------------------

--
-- Table structure for table `customer`
--

CREATE TABLE IF NOT EXISTS `customer` (
  `customer_id` int(11) NOT NULL AUTO_INCREMENT,
  `customer_name` varchar(100) NOT NULL,
  `customer_gender_id` int(11) NOT NULL,
  `customer_date_added` datetime NOT NULL,
  PRIMARY KEY (`customer_id`),
  KEY `customer_gender_id` (`customer_gender_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `customer_order`
--

CREATE TABLE IF NOT EXISTS `customer_order` (
  `customer_order_id` int(11) NOT NULL AUTO_INCREMENT,
  `customer_id` int(11) NOT NULL,
  `customer_order_timestamp` datetime NOT NULL,
  `total_amount` double NOT NULL,
  `payment_type_id` int(11) NOT NULL,
  `payment_status_id` int(11) NOT NULL,
  `order_status_id` int(11) NOT NULL,
  PRIMARY KEY (`customer_order_id`),
  KEY `payment_type_id` (`payment_type_id`),
  KEY `customer_id` (`customer_id`),
  KEY `payment_status_id` (`payment_status_id`),
  KEY `order_status_id` (`order_status_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=3 ;

--
-- Dumping data for table `customer_order`
--

INSERT INTO `customer_order` (`customer_order_id`, `customer_id`, `customer_order_timestamp`, `total_amount`, `payment_type_id`, `payment_status_id`, `order_status_id`) VALUES
(2, 0, '2017-12-19 10:23:24', 100, 1, 1, 2);

-- --------------------------------------------------------

--
-- Table structure for table `customer_order_details`
--

CREATE TABLE IF NOT EXISTS `customer_order_details` (
  `customer_order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `product_quantity` int(11) NOT NULL,
  `amount` double NOT NULL COMMENT 'amount = product.price * quantity',
  UNIQUE KEY `rows_unique` (`customer_order_id`,`product_id`) COMMENT 'Duplicate products in same order are not allowed',
  KEY `customer_order_id` (`customer_order_id`),
  KEY `product_id` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `customer_order_details`
--

INSERT INTO `customer_order_details` (`customer_order_id`, `product_id`, `product_quantity`, `amount`) VALUES
(2, 1, 1, 10),
(2, 2, 2, 50);

-- --------------------------------------------------------

--
-- Table structure for table `customer_order_status`
--

CREATE TABLE IF NOT EXISTS `customer_order_status` (
  `customer_order_status_id` int(11) NOT NULL AUTO_INCREMENT,
  `customer_order_status_name` varchar(100) NOT NULL,
  `customer_order_status_desc` varchar(1000) NOT NULL,
  PRIMARY KEY (`customer_order_status_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=4 ;

--
-- Dumping data for table `customer_order_status`
--

INSERT INTO `customer_order_status` (`customer_order_status_id`, `customer_order_status_name`, `customer_order_status_desc`) VALUES
(1, 'New', 'Order has just been submitted into the system'),
(2, 'Preparing', 'Order is being prepared in the kitchen'),
(3, 'Ready', 'Order is ready for collection.');

-- --------------------------------------------------------

--
-- Table structure for table `employee`
--

CREATE TABLE IF NOT EXISTS `employee` (
  `employee_id` int(11) NOT NULL AUTO_INCREMENT,
  `employee_id_number` varchar(10) NOT NULL,
  `employee_name` varchar(50) NOT NULL,
  `employee_gender_id` int(11) NOT NULL,
  `employee_role_id` int(11) NOT NULL,
  `employee_code` varchar(10) NOT NULL,
  `employee_phone` varchar(10) NOT NULL,
  `employee_email` varchar(50) NOT NULL,
  `employee_password` varchar(1000) NOT NULL,
  `shift_id` int(11) NOT NULL,
  PRIMARY KEY (`employee_id`),
  UNIQUE KEY `employee_id_number` (`employee_id_number`),
  UNIQUE KEY `employee_code` (`employee_code`),
  UNIQUE KEY `employee_phone` (`employee_phone`),
  UNIQUE KEY `employee_email` (`employee_email`),
  KEY `employee_gender_id` (`employee_gender_id`),
  KEY `employee_role_id` (`employee_role_id`),
  KEY `shift_id` (`shift_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=13 ;

--
-- Dumping data for table `employee`
--

INSERT INTO `employee` (`employee_id`, `employee_id_number`, `employee_name`, `employee_gender_id`, `employee_role_id`, `employee_code`, `employee_phone`, `employee_email`, `employee_password`, `shift_id`) VALUES
(1, '1111112', 'Here', 1, 1, 'ABCDE12', '12121212', 'gh@g.com', '5694d08a2e53ffcae0c3103e5ad6f6076abd960eb1f8a56577040bc1028f702b', 0),
(2, '1111112bbb', 'Hervinhoiiii', 1, 2, 'ABCDE1', '2222222222', 'g@g.com', '5694d08a2e53ffcae0c3103e5ad6f6076abd960eb1f8a56577040bc1028f702b', 2);

-- --------------------------------------------------------

--
-- Table structure for table `gender`
--

CREATE TABLE IF NOT EXISTS `gender` (
  `gender_id` int(11) NOT NULL AUTO_INCREMENT,
  `gender_name` varchar(10) NOT NULL,
  PRIMARY KEY (`gender_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=5 ;

--
-- Dumping data for table `gender`
--

INSERT INTO `gender` (`gender_id`, `gender_name`) VALUES
(1, 'Male'),
(2, 'Female'),
(3, 'Unknown22'),
(4, 'Unknown11');

-- --------------------------------------------------------

--
-- Table structure for table `login_record`
--

CREATE TABLE IF NOT EXISTS `login_record` (
  `employee_id` int(11) NOT NULL,
  `login_timestamp` datetime NOT NULL,
  UNIQUE KEY `rows_unique` (`employee_id`,`login_timestamp`) COMMENT 'Employee cannot have identical login timestamp',
  KEY `employee_id` (`employee_id`),
  KEY `login_timestamp` (`login_timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `login_record`
--

INSERT INTO `login_record` (`employee_id`, `login_timestamp`) VALUES
(1, '2017-12-20 15:40:33'),
(1, '2017-12-20 15:41:17'),
(1, '2017-12-20 15:44:07');

-- --------------------------------------------------------

--
-- Table structure for table `payment_status`
--

CREATE TABLE IF NOT EXISTS `payment_status` (
  `payment_status_id` int(11) NOT NULL AUTO_INCREMENT,
  `payment_status_name` varchar(50) NOT NULL,
  `payment_status_desc` varchar(1000) NOT NULL,
  PRIMARY KEY (`payment_status_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=5 ;

--
-- Dumping data for table `payment_status`
--

INSERT INTO `payment_status` (`payment_status_id`, `payment_status_name`, `payment_status_desc`) VALUES
(1, 'Paid', 'When payment for a product has been successfully received.'),
(2, 'Unpaid', 'When payment for a product has NOT been successfully received.'),
(3, 'Try222', 'blablabla'),
(4, 'Try111', 'blablabla');

-- --------------------------------------------------------

--
-- Table structure for table `payment_type`
--

CREATE TABLE IF NOT EXISTS `payment_type` (
  `payment_type_id` int(11) NOT NULL AUTO_INCREMENT,
  `payment_type_name` varchar(20) NOT NULL,
  PRIMARY KEY (`payment_type_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=4 ;

--
-- Dumping data for table `payment_type`
--

INSERT INTO `payment_type` (`payment_type_id`, `payment_type_name`) VALUES
(1, 'Cash'),
(2, 'Card'),
(3, 'Try11');

-- --------------------------------------------------------

--
-- Table structure for table `product`
--

CREATE TABLE IF NOT EXISTS `product` (
  `product_id` int(11) NOT NULL AUTO_INCREMENT,
  `product_type_id` int(11) NOT NULL,
  `product_name` varchar(50) NOT NULL,
  `product_desc` varchar(1000) NOT NULL,
  `product_price` double NOT NULL,
  PRIMARY KEY (`product_id`),
  KEY `product_type_id` (`product_type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `product_type`
--

CREATE TABLE IF NOT EXISTS `product_type` (
  `product_type_id` int(11) NOT NULL AUTO_INCREMENT,
  `product_type_name` varchar(100) NOT NULL,
  `product_type_desc` varchar(1000) NOT NULL,
  PRIMARY KEY (`product_type_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=2 ;

--
-- Dumping data for table `product_type`
--

INSERT INTO `product_type` (`product_type_id`, `product_type_name`, `product_type_desc`) VALUES
(1, 'Try22', 'blablabla');

-- --------------------------------------------------------

--
-- Table structure for table `promotion`
--

CREATE TABLE IF NOT EXISTS `promotion` (
  `promotion_id` int(11) NOT NULL AUTO_INCREMENT,
  `promotion_name` varchar(50) NOT NULL,
  `promotion_desc` varchar(1000) NOT NULL,
  `promotion_status_id` int(11) NOT NULL,
  `valid_from_date` date NOT NULL,
  `valid_to_date` date NOT NULL,
  `promotion_price` double NOT NULL,
  PRIMARY KEY (`promotion_id`),
  KEY `promotion_status_id` (`promotion_status_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `promotion_status`
--

CREATE TABLE IF NOT EXISTS `promotion_status` (
  `promotion_status_id` int(11) NOT NULL AUTO_INCREMENT,
  `promotion_status_name` varchar(20) NOT NULL,
  `promotion_status_desc` varchar(1000) NOT NULL,
  PRIMARY KEY (`promotion_status_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=2 ;

--
-- Dumping data for table `promotion_status`
--

INSERT INTO `promotion_status` (`promotion_status_id`, `promotion_status_name`, `promotion_status_desc`) VALUES
(1, 'Try22', 'blablabla');

-- --------------------------------------------------------

--
-- Table structure for table `role`
--

CREATE TABLE IF NOT EXISTS `role` (
  `role_id` int(11) NOT NULL AUTO_INCREMENT,
  `role_name` varchar(20) NOT NULL,
  `role_desc` varchar(1000) NOT NULL,
  PRIMARY KEY (`role_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=3 ;

--
-- Dumping data for table `role`
--

INSERT INTO `role` (`role_id`, `role_name`, `role_desc`) VALUES
(1, 'Admin', 'Admin has rootlevel permission in the system, i.e. he/she can do everything.'),
(2, 'Regular User', 'Regular User can only do certain tasks in the system.');

-- --------------------------------------------------------

--
-- Table structure for table `shift`
--

CREATE TABLE IF NOT EXISTS `shift` (
  `shift_id` int(11) NOT NULL AUTO_INCREMENT,
  `shift_name` varchar(20) NOT NULL,
  `shift_start_time` time NOT NULL,
  `shift_end_time` time NOT NULL,
  PRIMARY KEY (`shift_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=5 ;

--
-- Dumping data for table `shift`
--

INSERT INTO `shift` (`shift_id`, `shift_name`, `shift_start_time`, `shift_end_time`) VALUES
(1, 'Morning Shift', '00:00:00', '07:59:59'),
(2, 'Day Shift', '08:00:00', '15:59:59'),
(3, 'Night Shift', '16:00:00', '23:59:59'),
(4, 'try11', '20:00:00', '21:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `supplier`
--

CREATE TABLE IF NOT EXISTS `supplier` (
  `supplier_id` int(11) NOT NULL AUTO_INCREMENT,
  `supplier_name` varchar(50) NOT NULL,
  `supplier_location` varchar(100) NOT NULL,
  `supplier_contact` varchar(100) NOT NULL,
  `supplier_email` varchar(100) NOT NULL,
  PRIMARY KEY (`supplier_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `customer`
--
ALTER TABLE `customer`
  ADD CONSTRAINT `customer_ibfk_1` FOREIGN KEY (`customer_gender_id`) REFERENCES `gender` (`gender_id`) ON UPDATE CASCADE;

--
-- Constraints for table `customer_order`
--
ALTER TABLE `customer_order`
  ADD CONSTRAINT `customer_order_ibfk_1` FOREIGN KEY (`payment_type_id`) REFERENCES `payment_type` (`payment_type_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `customer_order_ibfk_2` FOREIGN KEY (`payment_status_id`) REFERENCES `payment_status` (`payment_status_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `customer_order_ibfk_3` FOREIGN KEY (`order_status_id`) REFERENCES `customer_order_status` (`customer_order_status_id`) ON UPDATE CASCADE;

--
-- Constraints for table `employee`
--
ALTER TABLE `employee`
  ADD CONSTRAINT `employee_ibfk_1` FOREIGN KEY (`employee_gender_id`) REFERENCES `gender` (`gender_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `employee_ibfk_2` FOREIGN KEY (`employee_role_id`) REFERENCES `role` (`role_id`) ON UPDATE CASCADE;

--
-- Constraints for table `login_record`
--
ALTER TABLE `login_record`
  ADD CONSTRAINT `login_record_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employee` (`employee_id`) ON UPDATE CASCADE;

--
-- Constraints for table `product`
--
ALTER TABLE `product`
  ADD CONSTRAINT `product_ibfk_1` FOREIGN KEY (`product_type_id`) REFERENCES `product_type` (`product_type_id`) ON UPDATE CASCADE;

--
-- Constraints for table `promotion`
--
ALTER TABLE `promotion`
  ADD CONSTRAINT `promotion_ibfk_1` FOREIGN KEY (`promotion_status_id`) REFERENCES `promotion_status` (`promotion_status_id`) ON UPDATE CASCADE;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
