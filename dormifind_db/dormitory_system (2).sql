-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 21, 2026 at 08:27 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `dormitory_system`
--

-- --------------------------------------------------------

--
-- Table structure for table `amenities`
--

CREATE TABLE `amenities` (
  `id` int(11) NOT NULL,
  `dormitory_id` int(11) NOT NULL,
  `amenity_name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `amenities`
--

INSERT INTO `amenities` (`id`, `dormitory_id`, `amenity_name`) VALUES
(1, 4, 'WiFi'),
(2, 4, 'Laundry'),
(3, 4, 'Curfew'),
(4, 4, 'CCTV'),
(5, 4, 'Study Area'),
(6, 5, 'WiFi'),
(7, 5, 'CCTV'),
(8, 5, 'Study Area'),
(9, 7, 'WiFi'),
(10, 7, 'Study Area'),
(11, 7, 'CCTV'),
(12, 7, 'Aircon'),
(13, 9, 'WiFi'),
(14, 9, 'CCTV'),
(15, 9, 'Study Area');

-- --------------------------------------------------------

--
-- Table structure for table `announcements`
--

CREATE TABLE `announcements` (
  `id` int(11) NOT NULL,
  `admin_id` int(11) NOT NULL,
  `title` varchar(200) NOT NULL,
  `content` text NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `announcements`
--

INSERT INTO `announcements` (`id`, `admin_id`, `title`, `content`, `is_active`, `created_at`, `updated_at`) VALUES
(2, 10, 'sample', 'sammple announce', 1, '2026-05-18 23:40:50', '2026-05-18 23:40:50');

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `id` int(11) NOT NULL,
  `room_id` int(11) NOT NULL,
  `tenant_id` int(11) NOT NULL,
  `owner_id` int(11) NOT NULL,
  `move_in_date` date NOT NULL,
  `move_out_date` date DEFAULT NULL,
  `due_date` date NOT NULL,
  `status` enum('pending','accepted','declined','cancelled','completed') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `decline_reason` varchar(500) DEFAULT NULL,
  `feedback` text DEFAULT NULL,
  `terms_accepted` tinyint(1) DEFAULT 0,
  `terms_accepted_date` timestamp NULL DEFAULT NULL,
  `feedback_date` timestamp NULL DEFAULT NULL,
  `move_out_requested` tinyint(1) DEFAULT 0,
  `move_out_status` enum('pending','approved') DEFAULT 'pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bookings`
--

INSERT INTO `bookings` (`id`, `room_id`, `tenant_id`, `owner_id`, `move_in_date`, `move_out_date`, `due_date`, `status`, `created_at`, `updated_at`, `decline_reason`, `feedback`, `terms_accepted`, `terms_accepted_date`, `feedback_date`, `move_out_requested`, `move_out_status`) VALUES
(2, 1, 4, 3, '2026-05-08', NULL, '2026-06-08', 'cancelled', '2026-05-07 11:05:16', '2026-05-07 11:22:06', NULL, NULL, 0, NULL, NULL, 0, 'pending'),
(3, 1, 4, 3, '2026-05-08', NULL, '2026-07-01', 'accepted', '2026-05-07 11:27:18', '2026-05-07 11:30:51', NULL, NULL, 0, NULL, NULL, 0, 'pending'),
(7, 3, 7, 3, '2026-05-16', NULL, '2026-07-01', 'completed', '2026-05-15 11:20:57', '2026-05-15 20:29:31', NULL, NULL, 0, NULL, NULL, 0, 'pending'),
(9, 6, 7, 8, '2026-05-17', '2026-06-16', '2026-06-17', 'completed', '2026-05-16 07:25:49', '2026-05-16 09:25:42', NULL, NULL, 0, NULL, NULL, 1, 'approved'),
(10, 6, 4, 8, '2026-05-17', NULL, '2026-06-17', 'declined', '2026-05-16 07:36:26', '2026-05-16 07:37:02', 'jfdjefoekfoioef', NULL, 0, NULL, NULL, 0, 'pending'),
(11, 6, 4, 8, '2026-05-17', '2026-06-17', '2026-06-17', 'completed', '2026-05-16 10:12:13', '2026-05-17 06:46:34', NULL, NULL, 0, NULL, NULL, 1, 'approved'),
(13, 6, 9, 8, '2026-05-18', NULL, '2026-06-18', 'accepted', '2026-05-17 16:28:37', '2026-05-17 16:29:20', NULL, NULL, 0, NULL, NULL, 0, 'pending'),
(14, 15, 9, 14, '2026-05-20', NULL, '2026-06-20', 'accepted', '2026-05-19 17:50:59', '2026-05-19 17:52:05', NULL, NULL, 0, NULL, NULL, 0, 'pending'),
(15, 16, 7, 14, '2026-05-20', NULL, '2026-06-20', 'accepted', '2026-05-19 18:22:36', '2026-05-19 18:23:06', NULL, NULL, 0, NULL, NULL, 0, 'pending'),
(16, 1, 7, 3, '2026-05-20', NULL, '2026-06-20', 'accepted', '2026-05-19 18:36:30', '2026-05-19 18:36:48', NULL, NULL, 0, NULL, NULL, 0, 'pending'),
(17, 9, 9, 3, '2026-05-20', NULL, '2026-06-20', 'accepted', '2026-05-19 18:42:40', '2026-05-19 18:43:03', NULL, NULL, 0, NULL, NULL, 0, 'pending'),
(18, 9, 15, 3, '2026-05-20', NULL, '2026-06-20', 'completed', '2026-05-19 18:59:15', '2026-05-19 19:03:16', NULL, NULL, 0, NULL, NULL, 0, 'pending'),
(19, 9, 17, 3, '2026-05-20', NULL, '2026-06-20', 'accepted', '2026-05-19 19:44:44', '2026-05-19 19:45:25', NULL, NULL, 0, NULL, NULL, 0, 'pending'),
(20, 10, 19, 3, '2026-05-20', NULL, '2026-06-20', 'accepted', '2026-05-19 19:57:44', '2026-05-19 19:58:45', NULL, NULL, 0, NULL, NULL, 0, 'pending'),
(21, 9, 20, 3, '2026-05-20', NULL, '2026-06-20', 'accepted', '2026-05-19 20:10:44', '2026-05-19 20:11:07', NULL, NULL, 0, NULL, NULL, 0, 'pending'),
(22, 1, 21, 3, '2026-05-20', NULL, '2026-06-20', 'completed', '2026-05-19 21:52:06', '2026-05-19 21:54:37', NULL, NULL, 0, NULL, NULL, 0, 'pending'),
(23, 6, 22, 8, '2026-05-20', NULL, '2026-06-20', 'accepted', '2026-05-19 22:23:48', '2026-05-19 22:24:42', NULL, NULL, 0, NULL, NULL, 0, 'pending'),
(24, 19, 25, 24, '2026-05-20', NULL, '2026-06-20', 'completed', '2026-05-19 23:54:44', '2026-05-19 23:57:56', NULL, NULL, 0, NULL, NULL, 0, 'pending');

-- --------------------------------------------------------

--
-- Table structure for table `dormitories`
--

CREATE TABLE `dormitories` (
  `id` int(11) NOT NULL,
  `owner_id` int(11) NOT NULL,
  `name` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `location` varchar(255) NOT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `price_per_month` decimal(10,2) NOT NULL,
  `advance_payment` decimal(10,2) DEFAULT 0.00,
  `total_rooms` int(11) DEFAULT 1,
  `available_rooms` int(11) DEFAULT 1,
  `image_url` varchar(500) DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `qr_code_url` varchar(500) DEFAULT NULL,
  `deposit_amount` decimal(10,2) DEFAULT 0.00,
  `advance_months` int(11) DEFAULT 1,
  `terms_text` text DEFAULT NULL,
  `is_verified` tinyint(1) DEFAULT 0,
  `verified_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `dormitories`
--

INSERT INTO `dormitories` (`id`, `owner_id`, `name`, `description`, `location`, `latitude`, `longitude`, `price_per_month`, `advance_payment`, `total_rooms`, `available_rooms`, `image_url`, `status`, `created_at`, `updated_at`, `qr_code_url`, `deposit_amount`, `advance_months`, `terms_text`, `is_verified`, `verified_at`) VALUES
(1, 3, 'gabriella\'s dormitory', 'This dormitory offers a safe, comfortable, and affordable living space for female residents only. It is located near schools, making it ideal for students who want a convenient place to stay. The dorm provides well-ventilated rooms, clean shared facilities, and a quiet environment suitable for studying and resting. Amenities include free Wi-Fi, 24/7 security, and laundry access. Residents can enjoy both comfort and convenience in their daily routines.', 'so. mabuhay brgy. tayamaan mamburao', NULL, NULL, 1000.00, 0.00, 3, 1, 'uploads/dormitories/dorm_1_1778181457.jpg', 'active', '2026-05-06 10:24:41', '2026-05-19 21:54:37', 'uploads/qr_codes/owner_qr_1_1778146630.png', 1000.00, 1, NULL, 0, NULL),
(4, 8, 'Anna dormitory', 'nrjehrutorutierjg', 'so. mabuhay brgy. tayamaan mamburao', NULL, NULL, 1000.00, 0.00, 3, 0, 'uploads/dormitories/dorm_4_1778916218.jpg', 'active', '2026-05-16 07:23:18', '2026-05-19 22:24:42', 'uploads/qr_codes/owner_qr_4_1778916303.png', 1000.00, 1, 'DORMITORY BOOKING TERMS AND CONDITIONS\n\n1. PAYMENT TERMS\nMonthly rent is due on or before the 5th day of each month. Late payment penalty: ₱50 per day after due date.\n\n2. SECURITY DEPOSIT\nA security deposit of ₱{deposit} is required. Refundable upon move-out, subject to inspection.\n\n3. MOVE-IN PAYMENT\n1 Month Advance Rent + Security Deposit.\n\n4. MONTHLY RENT (starting 2nd month)\nMonthly rent amount.\n\n5. CANCELLATION POLICY\nCancellation before move-in: Full refund of deposit. Cancellation after move-in: Deposit forfeited.\n\n6. MOVE-OUT REQUIREMENTS\n30 days written notice required before moving out. Deposit will be applied to last month\'s rent.', 0, NULL),
(5, 3, 'ELLA DORMITORY', 'EME', 'MAMBURAO', NULL, NULL, 1000.00, 0.00, 4, 0, 'uploads/dormitories/dorm_1_1779168768.png', 'active', '2026-05-19 12:14:07', '2026-05-19 21:16:35', 'uploads/qr_codes/owner_qr_5_1779225395.png', 1000.00, 1, NULL, 1, '2026-05-19 12:14:07'),
(6, 13, 'John Dormitory', 'sample lang', 'mamburao', NULL, NULL, 1000.00, 0.00, 2, 2, 'uploads/dormitories/dorm_2_1779205522.png', 'active', '2026-05-19 15:46:16', '2026-05-19 23:05:55', NULL, 1000.00, 1, NULL, 1, '2026-05-19 15:46:16'),
(7, 14, 'syrel dormitory', 'eme lang jejhfjehfjhn\r\ndjfksjfsdfldkg', 'mamburao', NULL, NULL, 2000.00, 0.00, 2, 0, 'uploads/dormitories/dorm_7_1779212871.png', 'active', '2026-05-19 17:46:05', '2026-05-19 18:23:06', 'uploads/qr_codes/owner_qr_7_1779212924.png', 1000.00, 1, NULL, 1, '2026-05-19 17:46:05'),
(8, 23, 'VeriDorm', 'A dormitory (dorm) is a residential building primarily for students, offering shared living spaces like bedrooms, bathrooms, and common lounges. It provides basic furnishings, easy access to campus facilities, and a community-focused environment that encourages social interaction and studying.', 'mamburao', NULL, NULL, 1000.00, 0.00, 1, 1, 'uploads/dormitories/dorm_8_1779231228.jpg', 'active', '2026-05-19 22:50:53', '2026-05-19 22:53:48', NULL, 1000.00, 1, NULL, 1, '2026-05-19 22:50:53'),
(9, 24, 'Bandol Dormitory', 'A dormitory (dorm) is a residential building primarily for students, offering shared living spaces like bedrooms, bathrooms, and common lounges. It provides basic furnishings, easy access to campus facilities, and a community-focused environment that encourages social interaction and studying.', 'so. mabuhay brgy. tayamaan mamburao', NULL, NULL, 1000.00, 0.00, 2, 2, 'uploads/dormitories/dorm_9_1779234683.png', 'active', '2026-05-19 23:48:58', '2026-05-19 23:57:56', NULL, 1000.00, 1, NULL, 1, '2026-05-19 23:48:58');

-- --------------------------------------------------------

--
-- Table structure for table `dormitory_images`
--

CREATE TABLE `dormitory_images` (
  `id` int(11) NOT NULL,
  `dormitory_id` int(11) NOT NULL,
  `image_url` varchar(500) NOT NULL,
  `caption` varchar(200) DEFAULT NULL,
  `is_featured` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `room_id` int(11) DEFAULT NULL,
  `room_name` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `dormitory_images`
--

INSERT INTO `dormitory_images` (`id`, `dormitory_id`, `image_url`, `caption`, `is_featured`, `created_at`, `room_id`, `room_name`) VALUES
(2, 1, 'uploads/dormitories/dorm_1_1778180982_0.jpg', NULL, 1, '2026-05-07 19:09:42', NULL, NULL),
(3, 1, 'uploads/dormitories/dorm_1_1778181822_0.jpg', NULL, 1, '2026-05-07 19:23:42', NULL, NULL),
(6, 4, 'uploads/dormitories/dorm_4_1778916227_0.jpg', NULL, 1, '2026-05-16 07:23:47', NULL, NULL),
(7, 4, 'uploads/dormitories/dorm_4_1778925127_0.jpg', NULL, 1, '2026-05-16 09:52:07', NULL, NULL),
(8, 1, 'uploads/rooms/room_1_1779146823_0.png', NULL, 0, '2026-05-18 23:27:03', 1, 'Room 1'),
(9, 1, 'uploads/rooms/room_1_1779146831_0.png', NULL, 0, '2026-05-18 23:27:11', 1, 'Room 1'),
(10, 1, 'uploads/rooms/room_1_1779146848_0.png', NULL, 0, '2026-05-18 23:27:28', 1, 'Room 1'),
(11, 5, 'uploads/rooms/room_9_1779196632_0.png', NULL, 0, '2026-05-19 13:17:12', 9, 'Room 1'),
(12, 5, 'uploads/rooms/room_9_1779196639_0.png', NULL, 0, '2026-05-19 13:17:19', 9, 'Room 1'),
(13, 5, 'uploads/rooms/room_10_1779196667_0.png', NULL, 0, '2026-05-19 13:17:47', 10, 'Room 2'),
(14, 5, 'uploads/rooms/room_10_1779196684_0.png', NULL, 0, '2026-05-19 13:18:04', 10, 'Room 2'),
(15, 5, 'uploads/dormitories/dorm_5_1779196740_0.png', NULL, 1, '2026-05-19 13:19:00', NULL, NULL),
(16, 7, 'uploads/rooms/room_15_1779212811_0.png', NULL, 0, '2026-05-19 17:46:51', 15, 'Room 1'),
(17, 7, 'uploads/rooms/room_15_1779212819_0.png', NULL, 0, '2026-05-19 17:46:59', 15, 'Room 1'),
(18, 7, 'uploads/rooms/room_16_1779212827_0.png', NULL, 0, '2026-05-19 17:47:07', 16, 'Room 2'),
(19, 7, 'uploads/rooms/room_16_1779212855_0.png', NULL, 0, '2026-05-19 17:47:35', 16, 'Room 2'),
(20, 9, 'uploads/rooms/room_19_1779234612_0.png', NULL, 0, '2026-05-19 23:50:12', 19, 'Room 1'),
(21, 9, 'uploads/rooms/room_19_1779234621_0.png', NULL, 0, '2026-05-19 23:50:21', 19, 'Room 1');

-- --------------------------------------------------------

--
-- Table structure for table `dorm_applications`
--

CREATE TABLE `dorm_applications` (
  `id` int(11) NOT NULL,
  `owner_id` int(11) NOT NULL,
  `name` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `location` varchar(255) NOT NULL,
  `price_per_month` decimal(10,2) NOT NULL,
  `deposit_amount` decimal(10,2) DEFAULT 0.00,
  `total_rooms` int(11) DEFAULT 1,
  `capacity_per_room` int(11) DEFAULT 1,
  `image_url` varchar(500) DEFAULT NULL,
  `proof_document` varchar(500) NOT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `admin_remarks` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `business_permit` varchar(500) DEFAULT NULL,
  `barangay_clearance` varchar(500) DEFAULT NULL,
  `gov_id` varchar(500) DEFAULT NULL,
  `utility_bill` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `dorm_applications`
--

INSERT INTO `dorm_applications` (`id`, `owner_id`, `name`, `description`, `location`, `price_per_month`, `deposit_amount`, `total_rooms`, `capacity_per_room`, `image_url`, `proof_document`, `status`, `admin_remarks`, `created_at`, `updated_at`, `business_permit`, `barangay_clearance`, `gov_id`, `utility_bill`) VALUES
(1, 3, 'ELLA DORMITORY', 'EME', 'MAMBURAO', 1000.00, 1000.00, 4, 4, 'uploads/dormitories/dorm_1_1779168768.png', '', 'approved', '', '2026-05-19 05:32:48', '2026-05-19 12:14:07', 'uploads/proofs/business_1_1779168768.png', 'uploads/proofs/barangay_1_1779168768.png', 'uploads/proofs/govid_1_1779168768.png', 'uploads/proofs/utility_1_1779168768.png'),
(2, 13, 'John Dormitory', 'sample lang', 'mamburao', 1000.00, 1000.00, 2, 3, 'uploads/dormitories/dorm_2_1779205522.png', '', 'approved', '', '2026-05-19 15:45:22', '2026-05-19 15:46:16', 'uploads/proofs/business_2_1779205522.png', 'uploads/proofs/barangay_2_1779205522.png', 'uploads/proofs/govid_2_1779205522.png', 'uploads/proofs/utility_2_1779205522.png'),
(3, 14, 'syrel dormitory', 'eme lang jejhfjehfjhn\r\ndjfksjfsdfldkg', 'mamburao', 2000.00, 1000.00, 2, 2, 'uploads/dormitories/dorm_3_1779212572.png', '', 'approved', '', '2026-05-19 17:42:52', '2026-05-19 17:46:05', 'uploads/proofs/business_3_1779212572.png', 'uploads/proofs/barangay_3_1779212572.png', 'uploads/proofs/govid_3_1779212572.png', 'uploads/proofs/utility_3_1779212572.png'),
(4, 23, 'VeriDorm', 'A dormitory (dorm) is a residential building primarily for students, offering shared living spaces like bedrooms, bathrooms, and common lounges. It provides basic furnishings, easy access to campus facilities, and a community-focused environment that encourages social interaction and studying.', 'mamburao', 1000.00, 1000.00, 2, 3, 'uploads/dormitories/dorm_4_1779231009.png', '', 'approved', '', '2026-05-19 22:50:09', '2026-05-19 22:50:53', 'uploads/proofs/business_4_1779231009.png', 'uploads/proofs/barangay_4_1779231009.png', 'uploads/proofs/govid_4_1779231009.png', 'uploads/proofs/utility_4_1779231009.png'),
(5, 24, 'Bandol Dormitory', 'A dormitory (dorm) is a residential building primarily for students, offering shared living spaces like bedrooms, bathrooms, and common lounges. It provides basic furnishings, easy access to campus facilities, and a community-focused environment that encourages social interaction and studying.', 'so. mabuhay brgy. tayamaan mamburao', 1000.00, 1000.00, 2, 3, 'uploads/dormitories/dorm_5_1779234486.png', '', 'approved', '', '2026-05-19 23:48:06', '2026-05-19 23:48:58', 'uploads/proofs/business_5_1779234486.png', 'uploads/proofs/barangay_5_1779234486.png', 'uploads/proofs/govid_5_1779234486.png', 'uploads/proofs/utility_5_1779234486.png');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `title` varchar(200) NOT NULL,
  `message` text NOT NULL,
  `type` enum('booking','payment','maintenance','system') DEFAULT 'system',
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `created_at`) VALUES
(4, 4, 'Booking Accepted', 'Your booking has been accepted! You can now move in on 2026-05-08', 'booking', 1, '2026-05-07 11:06:12'),
(5, 3, 'Booking Cancelled', 'A booking has been cancelled.', 'booking', 1, '2026-05-07 11:22:06'),
(7, 4, 'Booking Accepted', 'Your booking has been accepted! You can now make your first payment.', 'booking', 1, '2026-05-07 11:28:01'),
(9, 4, 'Payment Verified', 'Your payment has been verified. Thank you!', 'payment', 1, '2026-05-07 11:30:51'),
(19, 7, 'Booking Accepted', 'Your booking has been accepted! You can now make your first payment.', 'booking', 1, '2026-05-15 11:26:55'),
(20, 7, 'Payment Verified', 'Your payment has been verified. Thank you!', 'payment', 1, '2026-05-15 20:29:31'),
(21, 3, 'New Booking Request', 'A tenant wants to book gabriella\'s dormitory - Room Room 1', 'booking', 1, '2026-05-15 21:05:20'),
(23, 3, 'Payment Uploaded', 'A tenant has uploaded a payment QR code for verification.', 'payment', 1, '2026-05-15 21:55:47'),
(30, 7, 'Move-Out Approved', 'Your move-out request has been approved.', 'booking', 1, '2026-05-16 09:25:27'),
(31, 8, 'New Booking Request', 'A tenant wants to book Anna dormitory - Room Room 1', 'booking', 1, '2026-05-16 10:12:13'),
(32, 4, 'Booking Accepted', '1', 'booking', 1, '2026-05-16 10:13:28'),
(33, 8, 'Move-Out Request', 'Tenant has requested move-out on 2026-06-17', 'booking', 1, '2026-05-17 06:42:15'),
(35, 4, 'Move-Out Approved', 'Your move-out request has been approved.', 'booking', 1, '2026-05-17 06:46:20'),
(40, 9, 'Payment Verified', 'Your payment has been verified. Thank you!', 'payment', 1, '2026-05-17 17:00:54'),
(41, 4, 'Payment Verified', 'Your payment has been verified. Thank you!', 'payment', 1, '2026-05-17 20:23:58'),
(42, 7, 'Payment Verified', 'Your payment has been verified. Thank you!', 'payment', 1, '2026-05-17 20:24:00'),
(43, 3, 'New Announcement', 'sample - sammple announce', 'system', 1, '2026-05-18 23:40:50'),
(44, 4, 'New Announcement', 'sample - sammple announce', 'system', 1, '2026-05-18 23:40:50'),
(45, 7, 'New Announcement', 'sample - sammple announce', 'system', 0, '2026-05-18 23:40:50'),
(46, 8, 'New Announcement', 'sample - sammple announce', 'system', 1, '2026-05-18 23:40:50'),
(48, 11, 'New Announcement', 'sample - sammple announce', 'system', 0, '2026-05-18 23:40:50'),
(49, 3, 'Dormitory Approved', 'Your dormitory application has been approved. Your dorm is now listed.', 'system', 1, '2026-05-19 12:14:07'),
(50, 13, 'Dormitory Approved', 'Your dormitory application has been approved. Your dorm is now listed.', 'system', 1, '2026-05-19 15:46:16'),
(54, 14, 'Dormitory Approved', 'Your dormitory application has been approved. Your dorm is now listed.', 'system', 0, '2026-05-19 17:46:05'),
(55, 14, 'New Booking Request', 'A tenant has requested to book syrel dormitory - Room Room 1. Move-in date: 2026-05-20. Please review and approve/decline the request.', 'booking', 1, '2026-05-19 17:50:59'),
(56, 9, 'Booking Accepted', '1', 'booking', 1, '2026-05-19 17:52:05'),
(57, 14, 'New Booking Request', 'A tenant has requested to book syrel dormitory - Room Room 2. Move-in date: 2026-05-20. Please review and approve/decline the request.', 'booking', 0, '2026-05-19 18:22:36'),
(58, 7, 'Booking Accepted', '1', 'booking', 1, '2026-05-19 18:23:06'),
(59, 3, 'New Booking Request', 'A tenant has requested to book gabriella\'s dormitory - Room Room 1. Move-in date: 2026-05-20. Please review and approve/decline the request.', 'booking', 1, '2026-05-19 18:36:30'),
(60, 7, 'Booking Accepted', '1', 'booking', 0, '2026-05-19 18:36:48'),
(61, 7, 'Payment Verified', 'Your payment has been verified. Thank you!', 'payment', 0, '2026-05-19 18:37:50'),
(62, 3, 'New Booking Request', 'A tenant has requested to book ELLA DORMITORY - Room Room 1. Move-in date: 2026-05-20. Please review and approve/decline the request.', 'booking', 1, '2026-05-19 18:42:41'),
(63, 9, 'Booking Accepted', '1', 'booking', 0, '2026-05-19 18:43:03'),
(64, 3, 'New Booking Request', 'A tenant has requested to book ELLA DORMITORY - Room Room 1. Move-in date: 2026-05-20. Please review and approve/decline the request.', 'booking', 1, '2026-05-19 18:59:15'),
(65, 15, 'Booking Accepted', '1', 'booking', 1, '2026-05-19 18:59:40'),
(66, 15, 'Payment Verified', 'Your payment has been verified. Thank you!', 'payment', 0, '2026-05-19 19:03:06'),
(67, 3, 'New Booking Request', 'A tenant has requested to book ELLA DORMITORY - Room Room 1. Move-in date: 2026-05-20. Please review and approve/decline the request.', 'booking', 1, '2026-05-19 19:44:44'),
(68, 17, 'Booking Accepted', '1', 'booking', 0, '2026-05-19 19:45:25'),
(69, 17, 'Payment Verified', 'Your payment has been verified. Thank you!', 'payment', 0, '2026-05-19 19:47:55'),
(70, 3, 'New Booking Request', 'A tenant has requested to book ELLA DORMITORY - Room Room 2. Move-in date: 2026-05-20. Please review and approve/decline the request.', 'booking', 1, '2026-05-19 19:57:44'),
(71, 19, 'Booking Accepted', '1', 'booking', 0, '2026-05-19 19:58:45'),
(72, 3, 'New Booking Request', 'A tenant has requested to book ELLA DORMITORY - Room Room 1. Move-in date: 2026-05-20. Please review and approve/decline the request.', 'booking', 1, '2026-05-19 20:10:44'),
(73, 20, 'Booking Accepted', '1', 'booking', 1, '2026-05-19 20:11:07'),
(74, 3, 'New Booking Request', 'A tenant has requested to book gabriella\'s dormitory - Room Room 1. Move-in date: 2026-05-20. Please review and approve/decline the request.', 'booking', 1, '2026-05-19 21:52:06'),
(75, 21, 'Booking Accepted', '1', 'booking', 1, '2026-05-19 21:53:08'),
(76, 21, 'Payment Verified', 'Your payment has been verified. Thank you!', 'payment', 0, '2026-05-19 21:54:25'),
(77, 8, 'New Booking Request', 'A tenant has requested to book Anna dormitory - Room Room 1. Move-in date: 2026-05-20. Please review and approve/decline the request.', 'booking', 1, '2026-05-19 22:23:48'),
(78, 22, 'Booking Accepted', '1', 'booking', 1, '2026-05-19 22:24:42'),
(79, 22, 'Payment Verified', 'Your payment has been verified. Thank you!', 'payment', 0, '2026-05-19 22:25:58'),
(80, 23, 'Dormitory Approved', 'Your dormitory application has been approved. Your dorm is now listed.', 'system', 1, '2026-05-19 22:50:53'),
(81, 24, 'Dormitory Approved', 'Your dormitory application has been approved. Your dorm is now listed.', 'system', 1, '2026-05-19 23:48:58'),
(82, 24, 'New Booking Request', 'A tenant has requested to book Bandol Dormitory - Room Room 1. Move-in date: 2026-05-20. Please review and approve/decline the request.', 'booking', 1, '2026-05-19 23:54:44'),
(83, 25, 'Booking Accepted', '1', 'booking', 0, '2026-05-19 23:55:17'),
(84, 25, 'Payment Verified', 'Your payment has been verified. Thank you!', 'payment', 0, '2026-05-19 23:57:49'),
(85, 20, 'Payment Verified', 'Your payment has been verified. Thank you!', 'payment', 0, '2026-05-20 00:21:31');

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` int(11) NOT NULL,
  `booking_id` int(11) NOT NULL,
  `tenant_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_type` enum('monthly','advance','deposit') DEFAULT 'monthly',
  `payment_month` date DEFAULT NULL,
  `qr_code_image` varchar(500) DEFAULT NULL,
  `reference_number` varchar(100) DEFAULT NULL,
  `status` enum('pending','paid','verified','failed') DEFAULT 'pending',
  `payment_date` timestamp NULL DEFAULT NULL,
  `verified_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`id`, `booking_id`, `tenant_id`, `amount`, `payment_type`, `payment_month`, `qr_code_image`, `reference_number`, `status`, `payment_date`, `verified_at`, `created_at`) VALUES
(1, 3, 4, 1000.00, 'monthly', '2026-05-01', 'uploads/qr_codes/payment_1_1778153370.jpg', NULL, 'verified', NULL, '2026-05-07 11:30:51', '2026-05-07 11:28:01'),
(4, 7, 7, 1000.00, 'monthly', '2026-05-01', NULL, NULL, 'verified', NULL, '2026-05-15 20:29:31', '2026-05-15 11:26:55'),
(6, 9, 7, 2100.00, '', '2026-05-01', NULL, NULL, 'verified', NULL, '2026-05-17 20:24:00', '2026-05-16 07:26:29'),
(7, 11, 4, 2000.00, '', '2026-05-01', NULL, NULL, 'verified', NULL, '2026-05-17 20:23:58', '2026-05-16 10:13:28'),
(9, 13, 9, 2000.00, '', '2026-05-01', 'uploads/qr_codes/payment_9_1779036120.jpg', NULL, 'verified', NULL, '2026-05-17 17:00:53', '2026-05-17 16:29:20'),
(10, 14, 9, 3000.00, '', '2026-05-01', NULL, NULL, 'pending', NULL, NULL, '2026-05-19 17:52:05'),
(11, 15, 7, 3000.00, '', '2026-05-01', NULL, NULL, 'pending', NULL, NULL, '2026-05-19 18:23:06'),
(29, 16, 7, 2000.00, '', '2026-05-01', NULL, NULL, 'verified', NULL, '2026-05-19 18:37:50', '2026-05-19 18:36:48'),
(30, 17, 9, 2000.00, '', '2026-05-01', NULL, NULL, 'pending', NULL, NULL, '2026-05-19 18:43:03'),
(32, 18, 15, 2000.00, '', '2026-05-01', NULL, NULL, 'verified', NULL, '2026-05-19 19:03:06', '2026-05-19 18:59:40'),
(34, 19, 17, 2000.00, '', '2026-05-01', NULL, NULL, 'verified', NULL, '2026-05-19 19:47:55', '2026-05-19 19:45:25'),
(36, 20, 19, 2000.00, '', '2026-05-01', NULL, NULL, 'pending', NULL, NULL, '2026-05-19 19:58:45'),
(39, 21, 20, 2000.00, '', '2026-05-01', NULL, NULL, 'verified', NULL, '2026-05-20 00:21:31', '2026-05-19 20:11:07'),
(82, 22, 21, 2000.00, '', '2026-05-01', NULL, NULL, 'verified', NULL, '2026-05-19 21:54:25', '2026-05-19 21:53:08'),
(84, 23, 22, 2000.00, '', '2026-05-01', NULL, NULL, 'verified', NULL, '2026-05-19 22:25:58', '2026-05-19 22:24:42'),
(86, 24, 25, 2000.00, '', '2026-05-01', NULL, NULL, 'verified', NULL, '2026-05-19 23:57:48', '2026-05-19 23:55:17');

-- --------------------------------------------------------

--
-- Table structure for table `ratings`
--

CREATE TABLE `ratings` (
  `id` int(11) NOT NULL,
  `dormitory_id` int(11) NOT NULL,
  `tenant_id` int(11) NOT NULL,
  `rating` int(11) NOT NULL CHECK (`rating` >= 1 and `rating` <= 5),
  `review` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `reports`
--

CREATE TABLE `reports` (
  `id` int(11) NOT NULL,
  `reporter_id` int(11) NOT NULL,
  `reported_user_id` int(11) NOT NULL,
  `reported_dorm_id` int(11) DEFAULT NULL,
  `reason` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `evidence_url` varchar(500) DEFAULT NULL,
  `status` enum('pending','resolved','dismissed') DEFAULT 'pending',
  `admin_notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `resolved_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reports`
--

INSERT INTO `reports` (`id`, `reporter_id`, `reported_user_id`, `reported_dorm_id`, `reason`, `description`, `evidence_url`, `status`, `admin_notes`, `created_at`, `resolved_at`) VALUES
(1, 9, 13, 6, 'Fake listing', 'SAMPLE REPORT', 'uploads/reports/report_1779209773_7746.png', 'resolved', '', '2026-05-19 16:56:13', '2026-05-19 16:56:30'),
(2, 9, 13, 6, 'Fake listing', 'EME LANG', 'uploads/reports/report_1779209850_3016.png', 'dismissed', '', '2026-05-19 16:57:30', '2026-05-19 16:58:27'),
(3, 9, 13, 6, 'Fake listing', 'EME REPORT', 'uploads/reports/report_1779210679_6520.png', 'resolved', 'THANK YOU', '2026-05-19 17:11:19', '2026-05-19 17:11:46'),
(4, 22, 13, 6, 'Scam', 'djfhgksjg', NULL, 'pending', NULL, '2026-05-19 22:37:39', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `rooms`
--

CREATE TABLE `rooms` (
  `id` int(11) NOT NULL,
  `dormitory_id` int(11) NOT NULL,
  `room_number` varchar(50) NOT NULL,
  `capacity` int(11) DEFAULT 1,
  `current_occupants` int(11) DEFAULT 0,
  `is_available` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `tenant_ids` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `rooms`
--

INSERT INTO `rooms` (`id`, `dormitory_id`, `room_number`, `capacity`, `current_occupants`, `is_available`, `created_at`, `tenant_ids`) VALUES
(1, 1, 'Room 1', 4, 2, 1, '2026-05-06 10:24:41', '[7]'),
(2, 1, 'Room 2', 4, 0, 1, '2026-05-06 10:24:41', NULL),
(3, 1, 'Room 3', 4, 0, 1, '2026-05-06 10:24:41', NULL),
(6, 4, 'Room 1', 4, 3, 0, '2026-05-16 07:23:18', '[2,9,22]'),
(7, 4, 'Room 2', 4, 0, 1, '2026-05-16 07:23:18', NULL),
(8, 4, 'Room 3', 4, 0, 1, '2026-05-16 07:23:18', NULL),
(9, 5, 'Room 1', 4, 3, 0, '2026-05-19 12:14:07', '[9,17,20]'),
(10, 5, 'Room 2', 4, 1, 1, '2026-05-19 12:14:07', '[19]'),
(11, 5, 'Room 3', 4, 0, 1, '2026-05-19 12:14:07', NULL),
(12, 5, 'Room 4', 4, 0, 1, '2026-05-19 12:14:07', NULL),
(13, 6, 'Room 1', 3, 0, 1, '2026-05-19 15:46:16', NULL),
(14, 6, 'Room 2', 3, 0, 1, '2026-05-19 15:46:16', NULL),
(15, 7, 'Room 1', 2, 1, 0, '2026-05-19 17:46:05', '[9]'),
(16, 7, 'Room 2', 2, 1, 0, '2026-05-19 17:46:05', '[7]'),
(17, 8, 'Room 1', 3, 0, 1, '2026-05-19 22:50:53', NULL),
(19, 9, 'Room 1', 3, 0, 1, '2026-05-19 23:48:58', '[]'),
(20, 9, 'Room 2', 3, 0, 1, '2026-05-19 23:48:58', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `rules`
--

CREATE TABLE `rules` (
  `id` int(11) NOT NULL,
  `dormitory_id` int(11) NOT NULL,
  `rule_title` varchar(200) NOT NULL,
  `rule_description` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `rules`
--

INSERT INTO `rules` (`id`, `dormitory_id`, `rule_title`, `rule_description`, `created_at`, `updated_at`) VALUES
(1, 1, 'For Female Residents Only', 'This dormitory is strictly for female residents to maintain safety and privacy.', '2026-05-06 10:26:26', '2026-05-06 10:26:26'),
(7, 4, 'ehrrijr', 'ekjrkieroi', '2026-05-16 07:24:18', '2026-05-16 07:24:18'),
(8, 7, 'hsjjss', 'bawal tomboy', '2026-05-19 17:49:07', '2026-05-19 17:49:07'),
(9, 9, 'sample', 'for girls only', '2026-05-19 23:52:11', '2026-05-19 23:52:11');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `address` text DEFAULT NULL,
  `user_type` enum('tenant','owner','admin') NOT NULL,
  `profile_image` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_token_expiry` datetime DEFAULT NULL,
  `is_banned` tinyint(1) DEFAULT 0,
  `ban_reason` varchar(500) DEFAULT NULL,
  `banned_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `phone`, `address`, `user_type`, `profile_image`, `created_at`, `updated_at`, `reset_token`, `reset_token_expiry`, `is_banned`, `ban_reason`, `banned_at`) VALUES
(3, 'Rafaella Ramos', 'rafaellaramos@gmail.com', '$2y$10$DK5tpgbpoOfkNYIYGrIPde4KgiQz8nlUqo3odmvjbohAm14zHNThO', '09396234684', 'mamburao', 'owner', 'uploads/profiles/user_3_1778185138.jpg', '2026-05-06 10:10:16', '2026-05-07 20:18:58', NULL, NULL, 0, NULL, NULL),
(4, 'Rafaella Ramos', 'gracegarcia@gmail.com', '$2y$10$ZgBdnyhTT/jPbuKVe8PEFeS3iJl4Asm3NNYrMlyy7HfPlfW8JVU72', '09396234684', 'mamburao', 'tenant', 'uploads/profiles/user_4_1778185092.jpg', '2026-05-07 09:52:21', '2026-05-07 20:18:17', NULL, NULL, 0, NULL, NULL),
(7, 'maria maria', 'maria@gmail.com', '$2y$10$/RxRXjsndMqqqcmwGNBKC.G8PR.bRkFumySoTIKPh2.pzmQvYteWW', '09754388059', 'mamburao', 'tenant', NULL, '2026-05-15 11:01:23', '2026-05-15 11:01:23', NULL, NULL, 0, NULL, NULL),
(8, 'Anna Cruz', 'AnnaCruz@gmail.com', '$2y$10$EUhkPbU5NFTDsqvS2W3r8us8aMA5wS3xTGH8aeY1OCzKnHp71tJAe', '09396234684', 'MAMBURAO', 'owner', NULL, '2026-05-16 00:45:31', '2026-05-16 00:45:31', NULL, NULL, 0, NULL, NULL),
(9, 'joy ulala', 'test2@test.com', '$2y$10$zUWa7ElCH.g.uDHPdFAvbedZ6W.kW0rEckksaK5AZYy5FNMWEEz96', '09550385985', 'MAMBURAO', 'tenant', NULL, '2026-05-17 16:27:42', '2026-05-17 16:27:42', NULL, NULL, 0, NULL, NULL),
(10, 'System Admin', 'admin@dormifind.com', '$2a$12$IYVgHTGx7ID3kcfwM6y16uvse3vkx6siKeYUkKT3ebbU/XRveJrzS', '', NULL, 'admin', NULL, '2026-05-18 08:49:36', '2026-05-19 00:21:33', NULL, NULL, 0, NULL, NULL),
(11, 'own', 'own@gmail.com', '$2y$10$nVWLG6bZ27dl7jwlWB73Buxszf.heOvjAs2QE.aIQHmcl.bU3Xqbu', '0975438059', 'mamburao', 'owner', NULL, '2026-05-18 21:58:47', '2026-05-18 21:58:47', NULL, NULL, 0, NULL, NULL),
(12, 'rjtjrgr', 'ella@gmail.com', '$2y$10$n2R15ua.azoerRN2vvb34uHeYAbinW3gHkXqtzRh296fyARSBqw3i', '094758738', 'mamburao', 'owner', NULL, '2026-05-19 01:27:07', '2026-05-19 01:27:07', NULL, NULL, 0, NULL, NULL),
(13, 'John Garcia', 'JohnGarcia@gmail.com', '$2y$10$y5.p65KnZyqnZMWmjCZCDe5Xe56Aa0fEztHgtYI0/F63cx2CCir0m', '0909090909', 'mamburao', 'owner', NULL, '2026-05-19 03:35:08', '2026-05-19 03:35:08', NULL, NULL, 0, NULL, NULL),
(14, 'SYREL TAPALES', 'syrel@gmail.com', '$2y$10$1ZHdA991zmcgXxt65YIYnONvL7V/aVvsAuHecZ9TVx2wvpvLqNrmy', '09999999', 'mamburao', 'owner', NULL, '2026-05-19 17:41:09', '2026-05-19 17:41:09', NULL, NULL, 0, NULL, NULL),
(15, 'Usersample', 'Usersample1@gmail.com', '$2y$10$47ih/8uwtZOt9pNs45I4deQgILsjCZPVBrI2eJ4uNg6UWHJGkknea', '09999999', 'mamburao', 'tenant', NULL, '2026-05-19 18:58:47', '2026-05-19 18:58:47', NULL, NULL, 0, NULL, NULL),
(17, 'Usersample', 'UserSample3@gmail.com', '$2y$10$0EO8taIbCXMnypNQdrP00uupxZaQQA7xIymfOEU6a3T6xL6LKXvt2', '099999999', 'mamburao', 'tenant', NULL, '2026-05-19 19:42:54', '2026-05-19 19:42:54', NULL, NULL, 0, NULL, NULL),
(18, 'Usersampol', 'Usersampol4@gmail.com', '$2y$10$akECdLw7mRFn10tJZEA0sOZsSrZcYVDNnQ0CcW0uxfW6vdDCPVjhy', '0925546526', 'mamburao', 'owner', NULL, '2026-05-19 19:52:44', '2026-05-19 19:52:44', NULL, NULL, 0, NULL, NULL),
(19, 'yusir', 'Yusir@gmail.com', '$2y$10$c5uvYZ/teRfGDwxz65JS.Ofcey9YrVN53fRxDqWCN6652bqCQ6VsK', '0975438883', 'mamburao', 'tenant', NULL, '2026-05-19 19:55:30', '2026-05-19 19:55:30', NULL, NULL, 0, NULL, NULL),
(20, 'milka', 'Milka1@gmail.com', '$2y$10$kBhKn3aOAfcjbJASWilP7uQ8MXZNj4UQxZcJS0QxBu1Mr8aRJsYxG', '0962346273', 'mamburao', 'tenant', NULL, '2026-05-19 20:10:04', '2026-05-19 20:10:04', NULL, NULL, 0, NULL, NULL),
(21, 'Danica', 'Danica1@gmail.com', '$2y$10$5qHMTbBndY8rqxY4a264putjA2fMyfRg3wekcKsM4GcE3qQAGftMm', '097878787', 'mamburao', 'tenant', NULL, '2026-05-19 21:51:03', '2026-05-19 21:51:03', NULL, NULL, 0, NULL, NULL),
(22, 'lala', 'Lala1@gmail.com', '$2y$10$hi6bWQ8tiGMEr32WkYFjT.DrmltqQ1Y5KP9XDMRul3QLASwbUrf9i', '0975438057', 'mamburao', 'tenant', NULL, '2026-05-19 22:22:19', '2026-05-19 22:22:19', NULL, NULL, 0, NULL, NULL),
(23, 'testingveri', 'Testingveri@gmail.com', '$2y$10$W6mhDJgz5/8X3BsAKJRwXebPHdSInd1UyFoFZyy5eWbm6Qqv2OYwK', '09135363785', 'maburao', 'owner', NULL, '2026-05-19 22:42:20', '2026-05-19 22:42:20', NULL, NULL, 0, NULL, NULL),
(24, 'Bandol', 'Bandol1@gmail.com', '$2y$10$kJkSrXRJ5Qtfmz.0fnz4P.77gH4TEVnyQkPUSBSBnT1rQ3J00f4YK', '09783858575', 'tayamaan, mamburao', 'owner', NULL, '2026-05-19 23:45:23', '2026-05-19 23:45:23', NULL, NULL, 0, NULL, NULL),
(25, 'Magada', 'Magada1@gmail.com', '$2y$10$80aeYLP8jCyUWgu1i9k0GurLGJkODRJee7gnAsYU7xZmszP63R.qO', '09754382647', 'mamburao', 'tenant', NULL, '2026-05-19 23:53:25', '2026-05-19 23:53:25', NULL, NULL, 0, NULL, NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `amenities`
--
ALTER TABLE `amenities`
  ADD PRIMARY KEY (`id`),
  ADD KEY `dormitory_id` (`dormitory_id`);

--
-- Indexes for table `announcements`
--
ALTER TABLE `announcements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `admin_id` (`admin_id`);

--
-- Indexes for table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `room_id` (`room_id`),
  ADD KEY `tenant_id` (`tenant_id`),
  ADD KEY `owner_id` (`owner_id`);

--
-- Indexes for table `dormitories`
--
ALTER TABLE `dormitories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `owner_id` (`owner_id`);

--
-- Indexes for table `dormitory_images`
--
ALTER TABLE `dormitory_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `dormitory_id` (`dormitory_id`);

--
-- Indexes for table `dorm_applications`
--
ALTER TABLE `dorm_applications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `owner_id` (`owner_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `booking_id` (`booking_id`),
  ADD KEY `tenant_id` (`tenant_id`);

--
-- Indexes for table `ratings`
--
ALTER TABLE `ratings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_rating` (`dormitory_id`,`tenant_id`),
  ADD KEY `tenant_id` (`tenant_id`);

--
-- Indexes for table `reports`
--
ALTER TABLE `reports`
  ADD PRIMARY KEY (`id`),
  ADD KEY `reporter_id` (`reporter_id`),
  ADD KEY `reported_user_id` (`reported_user_id`),
  ADD KEY `reported_dorm_id` (`reported_dorm_id`);

--
-- Indexes for table `rooms`
--
ALTER TABLE `rooms`
  ADD PRIMARY KEY (`id`),
  ADD KEY `dormitory_id` (`dormitory_id`);

--
-- Indexes for table `rules`
--
ALTER TABLE `rules`
  ADD PRIMARY KEY (`id`),
  ADD KEY `dormitory_id` (`dormitory_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `amenities`
--
ALTER TABLE `amenities`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `announcements`
--
ALTER TABLE `announcements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `bookings`
--
ALTER TABLE `bookings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `dormitories`
--
ALTER TABLE `dormitories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `dormitory_images`
--
ALTER TABLE `dormitory_images`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `dorm_applications`
--
ALTER TABLE `dorm_applications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=86;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=88;

--
-- AUTO_INCREMENT for table `ratings`
--
ALTER TABLE `ratings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `reports`
--
ALTER TABLE `reports`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `rooms`
--
ALTER TABLE `rooms`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `rules`
--
ALTER TABLE `rules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `amenities`
--
ALTER TABLE `amenities`
  ADD CONSTRAINT `amenities_ibfk_1` FOREIGN KEY (`dormitory_id`) REFERENCES `dormitories` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `announcements`
--
ALTER TABLE `announcements`
  ADD CONSTRAINT `announcements_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`),
  ADD CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`tenant_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `bookings_ibfk_3` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `dormitories`
--
ALTER TABLE `dormitories`
  ADD CONSTRAINT `dormitories_ibfk_1` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `dormitory_images`
--
ALTER TABLE `dormitory_images`
  ADD CONSTRAINT `dormitory_images_ibfk_1` FOREIGN KEY (`dormitory_id`) REFERENCES `dormitories` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `dorm_applications`
--
ALTER TABLE `dorm_applications`
  ADD CONSTRAINT `dorm_applications_ibfk_1` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`),
  ADD CONSTRAINT `payments_ibfk_2` FOREIGN KEY (`tenant_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `ratings`
--
ALTER TABLE `ratings`
  ADD CONSTRAINT `ratings_ibfk_1` FOREIGN KEY (`dormitory_id`) REFERENCES `dormitories` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ratings_ibfk_2` FOREIGN KEY (`tenant_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `reports`
--
ALTER TABLE `reports`
  ADD CONSTRAINT `reports_ibfk_1` FOREIGN KEY (`reporter_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `reports_ibfk_2` FOREIGN KEY (`reported_user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `reports_ibfk_3` FOREIGN KEY (`reported_dorm_id`) REFERENCES `dormitories` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `rooms`
--
ALTER TABLE `rooms`
  ADD CONSTRAINT `rooms_ibfk_1` FOREIGN KEY (`dormitory_id`) REFERENCES `dormitories` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `rules`
--
ALTER TABLE `rules`
  ADD CONSTRAINT `rules_ibfk_1` FOREIGN KEY (`dormitory_id`) REFERENCES `dormitories` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
