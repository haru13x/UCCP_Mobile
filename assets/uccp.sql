-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 02, 2025 at 03:16 PM
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
-- Database: `uccp`
--

-- --------------------------------------------------------

--
-- Table structure for table `account_groups`
--

CREATE TABLE `account_groups` (
  `id` int(11) NOT NULL,
  `code` varchar(20) NOT NULL,
  `description` varchar(255) NOT NULL,
  `created_by` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `is_active` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `account_groups`
--

INSERT INTO `account_groups` (`id`, `code`, `description`, `created_by`, `created_at`, `updated_at`, `is_active`) VALUES
(1, 'CGRP', 'Church Worker', 'system', '2025-07-14 13:06:49', '2025-07-26 12:47:53', 1),
(2, 'CBRD', 'Church Board', 'system', '2025-07-14 13:06:49', '2025-07-14 13:06:49', 1),
(3, 'CMEM', 'Church Member', 'system', '2025-07-14 13:06:49', '2025-07-14 13:06:49', 1);

-- --------------------------------------------------------

--
-- Table structure for table `account_types`
--

CREATE TABLE `account_types` (
  `id` int(11) NOT NULL,
  `group_id` int(11) NOT NULL,
  `code` varchar(20) NOT NULL,
  `description` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `is_active` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `account_types`
--

INSERT INTO `account_types` (`id`, `group_id`, `code`, `description`, `created_at`, `updated_at`, `is_active`) VALUES
(1, 1, 'ORDAIN', 'Ordained', '2025-07-14 13:06:49', '2025-07-14 13:06:49', 1),
(2, 1, 'LICENT', 'Licentiates', '2025-07-14 13:06:49', '2025-07-14 13:06:49', 1),
(3, 1, 'RETCWK', 'Retired Church Workers', '2025-07-14 13:06:49', '2025-07-14 13:06:49', 1),
(4, 2, 'ELDER', 'Elder', '2025-07-14 13:06:49', '2025-07-14 13:06:49', 1),
(5, 2, 'EDUCA', 'Christian Educator', '2025-07-14 13:06:49', '2025-07-14 13:06:49', 1),
(6, 2, 'DEACON', 'Deacon', '2025-07-14 13:06:49', '2025-07-14 13:06:49', 1),
(7, 2, 'TRUSTE', 'Trustee', '2025-07-14 13:06:49', '2025-07-14 13:06:49', 1),
(8, 3, 'SSTEAC', 'Sunday School Teacher', '2025-07-14 13:06:49', '2025-07-14 13:06:49', 1),
(9, 3, 'VCSTEAC', 'VCS Teacher', '2025-07-14 13:06:49', '2025-07-14 13:06:49', 1);

-- --------------------------------------------------------

--
-- Table structure for table `events`
--

CREATE TABLE `events` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `image` varchar(500) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `start_time` time DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `category` varchar(255) DEFAULT NULL,
  `organizer` varchar(255) DEFAULT NULL,
  `contact` varchar(255) DEFAULT NULL,
  `attendees` int(11) DEFAULT NULL,
  `venue` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `latitude` decimal(10,7) DEFAULT NULL,
  `longitude` decimal(10,7) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `barcode` varchar(50) DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `status_id` bigint(20) UNSIGNED NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `events`
--

INSERT INTO `events` (`id`, `title`, `image`, `start_date`, `start_time`, `end_date`, `end_time`, `category`, `organizer`, `contact`, `attendees`, `venue`, `address`, `latitude`, `longitude`, `description`, `barcode`, `created_by`, `status_id`, `created_at`, `updated_at`) VALUES
(12, 'TEST2555', 'event-images/1752504791.jfif', '2025-07-31', '06:00:00', '2025-07-31', '18:00:00', 'Church Group', 'TESt', 'null', NULL, 'Cebu Doctors’ University Hospital', 'Osmeña Blvd, Cebu City, 6000 Cebu, Philippines', 10.3144559, 123.8920288, 'TEst', '20250714_14531112', 8, 1, '2025-07-14 06:53:11', '2025-07-16 04:27:59'),
(13, 'TEST Account Type', 'event-images/1752660240.jpg', '2025-07-25', '06:00:00', '2025-07-26', '18:00:00', 'Church Board', 'TEST TEST', 'null', NULL, 'UCCP Church', 'FJPX+Q4R, Abellanosa St, Cagayan De Oro City, Misamis Oriental, Philippines', 8.4869860, 124.6477562, ' Join us for the Annual Tech Innovation Summit 2025, a day filled with insightful talks, hands-on workshops,  and networking opportunities with industry leaders. Discover the latest trends in AI, blockchain, and cloud computing while connecting with fellow tech enthusiasts.', '20250730_14300420', 8, 1, '2025-07-16 02:04:00', '2025-07-20 03:14:26'),
(14, 'TEStrrr', 'event-images/1753010038.png', '2025-07-22', '07:11:00', '2025-07-23', '07:11:00', 'Church Group', 'TEst', NULL, NULL, 'USTP Science Complex Building', 'FMP4+7C2, Cagayan De Oro City, Misamis Oriental, Philippines', 8.4856414, 124.6560284, ' const renderFilterButton = (label, value) => (\n    <TouchableOpacity\n      key={value}\n      style={[styles.tab, filter === value && styles.tabActive]}\n      onPress={() => setFilter(value)}\n    >\n      <Text style={[styles.tabText, filter === value && styles.tabTextActive]}>{label}</Text>\n    </TouchableOpacity>\n  );', '20250726_12383714', 8, 2, '2025-07-20 03:13:58', '2025-07-28 04:52:46'),
(15, 'TESTWHJJEH', 'event-images/1753010134.png', '2025-07-23', '06:44:00', '2025-07-24', '18:00:00', 'Church Group', 'test', NULL, NULL, 'UCCP Ellinwood Malate Church', '1660 Vasquez St, Malate, Manila, 1004 Metro Manila, Philippines', 14.5749097, 120.9873238, 'TESt', '20250720_11153415', 8, 1, '2025-07-20 03:15:34', '2025-07-20 03:15:34'),
(16, 'TEST  07-26-2525-08-29', 'event-images/1753533044.png', '2025-07-27', '06:00:00', '2025-07-27', '14:00:00', 'Church Group', 'TEST', 'null', NULL, 'UCCP Church', 'FJPX+Q4R, Abellanosa St, Cagayan De Oro City, Misamis Oriental, Philippines', 8.4869860, 124.6477562, '❌ When Internet Is Not Needed:\r\nAfter building a standalone app (eas build or expo build) — the app runs offline unless it depends on online APIs.\r\n\r\nWhen accessing locally bundled assets.\r\n\r\nIf using LAN connection, Expo can work over the same local network without internet.', '20250726_12304416', 8, 1, '2025-07-26 04:30:44', '2025-07-28 05:05:18'),
(17, 'Event Elder', 'event-images/1753534540.png', '2025-07-27', '08:00:00', '2025-07-27', '20:00:00', 'Church Board', 'Event Elder', 'null', NULL, 'XH5V+G86', 'XH5V+G86, Butuan City, Agusan Del Norte, Philippines', 8.9593248, 125.5937261, '❌ When Internet Is Not Needed:\r\nAfter building a standalone app (eas build or expo build) — the app runs offline unless it depends on online APIs.\r\n\r\nWhen accessing locally bundled assets.\r\n\r\nIf using LAN connection, Expo can work over the same local network without internet.', '20250726_12554017', 8, 1, '2025-07-26 04:55:40', '2025-07-26 05:03:51'),
(18, 'TEST', 'event-images/1753873687.png', '2025-07-31', '07:00:00', '2025-07-31', '19:00:00', 'Church Worker', 'TEST', NULL, NULL, 'UCCP Shalom Center', '415 Bonifacio St, Poblacion District, Davao City, 8000 Davao del Sur, Philippines', 7.0686642, 125.6075177, 'To add a “Register” button only if the user is not registered (event.is_registered !== 1) and to create a function that allows registering for the event, here’s how to modify your EventDetailsScreen:\r\n\r\n✅ 1. Add the Register button\r\nAdd this just below the About section, before hasEventEnded():', '20250730_11080718', 8, 1, '2025-07-30 03:08:07', '2025-07-30 03:08:07'),
(19, 'TEST EvENT', 'event-images/1753885423.jfif', '2025-07-30', '23:22:00', '2025-07-31', '10:23:00', 'Church Worker', 'TEST', NULL, NULL, 'Uccle', '1180 Uccle, Belgium', 50.7956957, 4.3736365, 'Result\r\nIf the event is registered\r\n\r\nAnd the event starts within the next hour\r\n\r\n➡️ You’ll see a blue \"Attend Event\" button', '20250730_14234319', 8, 1, '2025-07-30 06:23:43', '2025-07-30 06:23:43'),
(20, 'TESTING ACCOUNT TYPE', 'event-images/1753885804.png', '2025-07-31', '22:31:00', '2025-07-31', '22:31:00', 'Church Member', 'TEST', 'null', NULL, 'UCCP Shalom Center', '415 Bonifacio St, Poblacion District, Davao City, 8000 Davao del Sur, Philippines', 7.0686642, 125.6075177, 'TEST', '20250730_14310820', 8, 1, '2025-07-30 06:30:04', '2025-07-30 06:31:08'),
(21, 'TESTING', 'event-images/1753960021.jfif', '2025-07-31', '20:06:00', '2025-07-31', '12:06:00', 'Church Worker', 'TEST', NULL, NULL, 'UCCP Church', 'FJPX+Q4R, Abellanosa St, Cagayan De Oro City, Misamis Oriental, Philippines', 8.4869860, 124.6477562, 'You can modify your JSX to clearly handle the following three cases:\r\n\r\n✅ User can mark attendance and has not attended → show Attend button\r\n\r\n🎉 User already attended → show thank you message\r\n\r\n🕒 Attendance not yet available → show \"available soon\" message\r\n\r\nHere’s the clean, corrected version of your component logic:\r\n\r\njsx\r\nCopy\r\nEdit', '20250731_11070121', 8, 1, '2025-07-31 03:07:01', '2025-07-31 03:07:01'),
(22, 'TEST VALIDITY', 'event-images/1753961440.png', '2025-07-31', '23:34:00', '2025-07-31', '07:29:00', 'Church Worker', 'TEST', 'null', NULL, 'UCCP Congregational Church at the Crossroad', '415 Pelayo St, Poblacion District, Davao City, 8000 Davao del Sur, Philippines', 7.0685795, 125.6072898, '📌 Notes:\r\nisAttend → user has already marked attendance\r\n\r\ncanMarkAttendance() → current time is within attendance window\r\n\r\nhasEventEnded() → event is over\r\n\r\nattendanceNotYetAvailable() → it’s too early to mark\r\n\r\nThis should handle all edge cases, including:', '20250731_11341422', 8, 1, '2025-07-31 03:30:40', '2025-07-31 03:34:14');

-- --------------------------------------------------------

--
-- Table structure for table `event_modes`
--

CREATE TABLE `event_modes` (
  `id` int(11) NOT NULL,
  `account_type_id` int(11) NOT NULL,
  `event_id` int(11) NOT NULL,
  `status_id` int(11) DEFAULT 1,
  `account_group_id` int(11) NOT NULL,
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `event_modes`
--

INSERT INTO `event_modes` (`id`, `account_type_id`, `event_id`, `status_id`, `account_group_id`, `created_by`, `created_at`, `updated_at`) VALUES
(15, 0, 12, 2, 1, 1, '2025-07-16 04:30:57', '2025-07-16 04:32:12'),
(16, 0, 12, 2, 1, 1, '2025-07-16 04:32:12', '2025-07-16 04:48:32'),
(17, 1, 12, 1, 1, 1, '2025-07-16 04:48:32', '2025-07-16 04:48:32'),
(18, 2, 12, 1, 1, 1, '2025-07-16 04:48:32', '2025-07-16 04:48:57'),
(19, 3, 12, 1, 1, 1, '2025-07-16 04:48:57', '2025-07-16 04:48:57'),
(20, 4, 13, 2, 2, 1, '2025-07-16 07:23:01', '2025-07-20 03:14:26'),
(21, 1, 14, 1, 1, 8, '2025-07-20 03:13:58', '2025-07-20 03:13:58'),
(22, 1, 15, 1, 1, 8, '2025-07-20 03:15:34', '2025-07-20 03:15:34'),
(23, 2, 15, 1, 1, 8, '2025-07-20 03:15:34', '2025-07-20 03:15:34'),
(24, 1, 16, 1, 1, 8, '2025-07-26 04:30:44', '2025-07-26 04:30:44'),
(25, 2, 16, 1, 1, 8, '2025-07-26 04:30:44', '2025-07-28 05:05:27'),
(26, 4, 17, 1, 2, 8, '2025-07-26 04:55:40', '2025-07-26 04:55:40'),
(27, 5, 17, 2, 2, 8, '2025-07-26 05:03:51', '2025-07-26 05:04:39'),
(28, 6, 17, 1, 2, 8, '2025-07-26 05:03:51', '2025-07-26 05:03:51'),
(29, 7, 17, 2, 2, 8, '2025-07-26 05:03:51', '2025-07-26 05:04:39'),
(30, 3, 16, 1, 1, 8, '2025-07-28 05:05:27', '2025-07-28 05:05:27'),
(31, 1, 18, 1, 1, 8, '2025-07-30 03:08:07', '2025-07-30 03:08:07'),
(32, 2, 18, 1, 1, 8, '2025-07-30 03:08:07', '2025-07-30 03:08:07'),
(33, 3, 18, 1, 1, 8, '2025-07-30 03:08:07', '2025-07-30 03:08:07'),
(34, 1, 19, 1, 1, 8, '2025-07-30 06:23:43', '2025-07-30 06:23:43'),
(35, 2, 19, 1, 1, 8, '2025-07-30 06:23:43', '2025-07-30 06:23:43'),
(36, 3, 19, 1, 1, 8, '2025-07-30 06:23:43', '2025-07-30 06:23:43'),
(37, 8, 20, 1, 3, 8, '2025-07-30 06:30:04', '2025-07-30 06:30:04'),
(38, 9, 20, 1, 3, 8, '2025-07-30 06:30:04', '2025-07-30 06:30:04'),
(39, 1, 21, 1, 1, 8, '2025-07-31 03:07:01', '2025-07-31 03:07:01'),
(40, 2, 21, 1, 1, 8, '2025-07-31 03:07:01', '2025-07-31 03:07:01'),
(41, 3, 21, 1, 1, 8, '2025-07-31 03:07:01', '2025-07-31 03:07:01'),
(42, 1, 22, 1, 1, 8, '2025-07-31 03:30:40', '2025-07-31 03:30:40'),
(43, 2, 22, 1, 1, 8, '2025-07-31 03:30:40', '2025-07-31 03:30:40'),
(44, 3, 22, 1, 1, 8, '2025-07-31 03:30:40', '2025-07-31 03:30:40');

-- --------------------------------------------------------

--
-- Table structure for table `event_programs`
--

CREATE TABLE `event_programs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `event_id` bigint(20) UNSIGNED NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `activity` varchar(255) NOT NULL,
  `speaker` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `event_qrcodes`
--

CREATE TABLE `event_qrcodes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `event_id` bigint(20) UNSIGNED NOT NULL,
  `qr_path` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `event_registrations`
--

CREATE TABLE `event_registrations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `event_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `statusId` bigint(20) UNSIGNED DEFAULT NULL,
  `registered_time` timestamp NULL DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `time_in` time DEFAULT NULL,
  `registeredtypeId` bigint(20) UNSIGNED DEFAULT NULL,
  `attendTypeId` bigint(20) UNSIGNED DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `attend_time` datetime DEFAULT NULL,
  `is_attend` tinyint(1) NOT NULL DEFAULT 0,
  `updated_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `event_registrations`
--

INSERT INTO `event_registrations` (`id`, `event_id`, `user_id`, `statusId`, `registered_time`, `created_by`, `time_in`, `registeredtypeId`, `attendTypeId`, `remarks`, `attend_time`, `is_attend`, `updated_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 12, 8, 1, '2025-07-14 03:24:52', 31, '11:24:52', NULL, NULL, NULL, NULL, 0, NULL, '2025-07-14 03:24:52', '2025-07-14 03:24:52', NULL),
(2, 13, 10, 1, '2025-07-14 03:25:26', 31, '11:25:26', NULL, NULL, NULL, NULL, 0, NULL, '2025-07-14 03:25:26', '2025-07-14 03:25:26', NULL),
(3, 14, 8, 1, '2025-07-14 03:29:23', 31, '11:29:23', NULL, 2, NULL, '2025-07-14 11:29:37', 1, NULL, '2025-07-14 03:29:23', '2025-07-14 03:29:37', NULL),
(4, 12, 31, 1, '2025-07-26 03:24:52', 31, '11:24:52', NULL, NULL, NULL, NULL, 0, NULL, '2025-07-26 02:56:19', '2025-07-26 03:24:52', NULL),
(5, 14, 31, 1, '2025-07-26 04:38:27', 8, '12:38:27', NULL, NULL, NULL, '2025-07-26 20:39:28', 1, NULL, '2025-07-26 04:38:27', '2025-07-26 04:38:27', NULL),
(6, 17, 33, 1, '2025-07-26 05:11:38', 8, '13:11:38', NULL, NULL, NULL, '2025-07-26 21:11:57', 1, NULL, '2025-07-26 05:11:38', '2025-07-26 05:11:38', NULL),
(13, 18, 31, 1, '2025-07-30 06:10:46', 31, '14:10:46', NULL, NULL, NULL, NULL, 0, NULL, '2025-07-30 06:10:46', '2025-07-30 06:10:46', NULL),
(14, 19, 31, 1, '2025-07-30 06:24:26', 31, '14:24:26', NULL, NULL, NULL, NULL, 0, NULL, '2025-07-30 06:24:26', '2025-07-30 06:24:26', NULL),
(15, 21, 31, 1, '2025-07-31 03:07:14', 31, '11:07:14', NULL, 2, NULL, '2025-07-31 11:15:25', 1, NULL, '2025-07-31 03:07:14', '2025-07-31 03:15:25', NULL),
(16, 22, 31, 1, '2025-07-31 03:36:54', 31, '11:36:54', NULL, NULL, NULL, NULL, 0, NULL, '2025-07-31 03:36:54', '2025-07-31 03:36:54', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `event_sponsors`
--

CREATE TABLE `event_sponsors` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `event_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `donated` varchar(255) DEFAULT NULL,
  `logo` varchar(255) DEFAULT NULL,
  `contact_person` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `meetings`
--

CREATE TABLE `meetings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `time` time DEFAULT NULL,
  `category` varchar(255) DEFAULT NULL,
  `organizer` varchar(255) DEFAULT NULL,
  `contact` varchar(255) DEFAULT NULL,
  `attendees` int(11) DEFAULT NULL,
  `venue` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `latitude` decimal(10,7) DEFAULT NULL,
  `longitude` decimal(10,7) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `status_id` bigint(20) UNSIGNED NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `meetings`
--

INSERT INTO `meetings` (`id`, `title`, `start_date`, `end_date`, `time`, `category`, `organizer`, `contact`, `attendees`, `venue`, `address`, `latitude`, `longitude`, `description`, `created_by`, `status_id`, `created_at`, `updated_at`) VALUES
(1, 'UCCP CELEBRATION MEETING', '2025-06-26', '2025-06-27', NULL, NULL, 'Janice Conde', 'TEST', 5, 'UCCP Church', 'FJPX+Q4R, Abellanosa St, Cagayan De Oro City, Misamis Oriental, Philippines', 8.4869860, 124.6477562, 'meeting fot the UCCP Celebration', NULL, 1, '2025-06-23 04:41:21', '2025-06-24 02:57:35'),
(2, 'TEST TODAY MEETING', '2025-06-24', '2025-06-24', NULL, NULL, 'TEST', 'TEST', 10, 'USTP Science Complex Building', 'FMP4+7C2, Cagayan De Oro City, Misamis Oriental, Philippines', 8.4856414, 124.6560284, 'TEST', NULL, 1, '2025-06-24 02:56:38', '2025-06-24 02:56:38');

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '2014_10_12_000000_create_users_table', 1),
(2, '2014_10_12_100000_create_password_resets_table', 1),
(3, '2019_08_19_000000_create_failed_jobs_table', 1),
(4, '2019_12_14_000001_create_personal_access_tokens_table', 1),
(5, '2025_06_18_000002_create_statuses', 1),
(6, '2025_06_18_122336_create_user_details', 1),
(7, '2025_06_18_122354_create_roles', 1),
(8, '2025_06_18_122442_create_permissions', 1),
(9, '2025_06_18_122525_create_role_permission', 1),
(10, '2025_06_18_123504_create_sex', 1),
(11, '2025_06_19_123227_create_events', 2),
(12, '2025_06_23_123308_meeting_table', 3),
(14, '2025_06_23_125838_create_event_qrcodes_table', 4),
(15, '2025_06_28_053011_create_event_programs_table', 5),
(16, '2025_06_28_053106_create_event_sponsors_table', 5),
(17, '2025_07_10_115554_create_event_registrations_table', 6);

-- --------------------------------------------------------

--
-- Table structure for table `nationality`
--

CREATE TABLE `nationality` (
  `id` int(11) NOT NULL,
  `description` varchar(100) NOT NULL,
  `isactive1` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `nationality`
--

INSERT INTO `nationality` (`id`, `description`, `isactive1`) VALUES
(1, 'Filipino', 1),
(2, 'American', 1),
(3, 'Japanese', 1),
(4, 'British', 1),
(5, 'Canadian', 1);

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `body` text DEFAULT NULL,
  `event_id` bigint(20) UNSIGNED DEFAULT NULL,
  `type` varchar(50) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `password_resets`
--

CREATE TABLE `password_resets` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `code` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `status_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `group_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `permissions`
--

INSERT INTO `permissions` (`id`, `name`, `code`, `description`, `created_by`, `status_id`, `created_at`, `updated_at`, `group_id`) VALUES
(6, 'View Users', 'view_users', 'Can view user list', 1, 0, NULL, NULL, 1),
(7, 'Add User', 'add_user', 'Can add new users', 1, 0, NULL, NULL, 1),
(8, 'Edit User', 'edit_user', 'Can update users', 1, 0, NULL, NULL, 1),
(9, 'Delete User', 'delete_user', 'Can delete users', 1, 0, NULL, NULL, 1),
(10, 'Generate User Report', 'report_users', 'Can generate user reports', 1, 0, NULL, NULL, 1),
(11, 'View Events', 'view_events', 'Can view event list', 1, 0, NULL, NULL, 2),
(12, 'Add Event', 'add_event', 'Can add new events', 1, 0, NULL, NULL, 2),
(13, 'Edit Event', 'edit_event', 'Can edit events', 1, 0, NULL, NULL, 2),
(14, 'Delete Event', 'delete_event', 'Can delete events', 1, 0, NULL, NULL, 2),
(15, 'Generate Event Report', 'report_events', 'Can generate event reports', 1, 0, NULL, NULL, 2),
(16, 'View Dashboard', 'view_dashboard', 'Can access the dashboard', 1, 0, NULL, NULL, 3),
(17, 'can view roles', 'view_roles', 'can view Roles Components', 1, 1, '2025-07-01 12:31:52', '2025-07-01 12:31:52', 7),
(18, 'Can View Report', 'view_report', 'Can View report', 1, 1, NULL, NULL, 4),
(19, 'View My Event', 'view_my_events', 'Can view My Events', 1, 1, NULL, NULL, 5),
(20, 'Event List', 'view_event_list', 'Can view Event List', 1, 1, NULL, NULL, 6);

-- --------------------------------------------------------

--
-- Table structure for table `permission_groups`
--

CREATE TABLE `permission_groups` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `code` varchar(50) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `status_id` tinyint(4) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `permission_groups`
--

INSERT INTO `permission_groups` (`id`, `name`, `code`, `description`, `created_by`, `status_id`, `created_at`, `updated_at`) VALUES
(1, 'User Management', 'user_mgmt', 'Manage user accounts and roles', 1, 1, '2025-07-01 11:35:00', '2025-07-01 11:35:00'),
(2, 'Event Management', 'event_mgmt', 'Manage event data and schedules', 1, 1, '2025-07-01 11:35:00', '2025-07-01 11:35:00'),
(3, 'Dashboard', 'dashboard', 'Access dashboard only', 1, 1, '2025-07-01 11:35:00', '2025-07-01 11:35:00'),
(4, 'Report', 'report', 'Reports Group', 1, 1, '2025-07-05 10:04:21', '2025-07-05 10:04:21'),
(5, 'My Events', 'my_events', 'My Events List', 1, 1, '2025-07-12 06:42:05', '2025-07-12 06:42:21'),
(6, 'Event List', 'events', 'Event List', 1, 1, '2025-07-12 06:43:41', '2025-07-12 06:43:41'),
(7, 'Setting', 'setting', 'Settings', 1, 1, '2025-07-12 06:43:41', '2025-07-12 06:43:41');

-- --------------------------------------------------------

--
-- Table structure for table `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `qrcodes`
--

CREATE TABLE `qrcodes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `event_id` int(11) NOT NULL,
  `barcode` varchar(20) NOT NULL,
  `qr_path` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `qrcodes`
--

INSERT INTO `qrcodes` (`id`, `event_id`, `barcode`, `qr_path`, `created_at`, `updated_at`) VALUES
(2, 1, '20250714_1048511', 'qrcodes/event-20250714_1048511.png', '2025-07-14 02:48:51', '2025-07-14 02:48:51'),
(3, 2, '20250714_1124392', 'qrcodes/event-20250714_1124392.png', '2025-07-14 03:24:39', '2025-07-14 03:24:39'),
(4, 3, '20250714_1348343', 'qrcodes/event-20250714_1348343.png', '2025-07-14 05:48:35', '2025-07-14 05:48:35'),
(5, 4, '20250714_1425534', 'qrcodes/event-20250714_1425534.png', '2025-07-14 06:25:53', '2025-07-14 06:25:53'),
(6, 12, '20250714_14531112', 'qrcodes/event-20250714_14531112.png', '2025-07-14 06:53:11', '2025-07-14 06:53:11'),
(7, 13, '20250716_10040013', 'qrcodes/event-20250716_10040013.png', '2025-07-16 02:04:01', '2025-07-16 02:04:01'),
(8, 14, '20250720_11135814', 'qrcodes/event-20250720_11135814.png', '2025-07-20 03:13:59', '2025-07-20 03:13:59'),
(9, 15, '20250720_11153415', 'qrcodes/event-20250720_11153415.png', '2025-07-20 03:15:34', '2025-07-20 03:15:34'),
(10, 16, '20250726_12304416', 'qrcodes/event-20250726_12304416.png', '2025-07-26 04:30:45', '2025-07-26 04:30:45'),
(11, 14, '20250726_12383714', 'qrcodes/event-20250726_12383714.png', '2025-07-26 04:38:37', '2025-07-26 04:38:37'),
(12, 17, '20250726_12554017', 'qrcodes/event-20250726_12554017.png', '2025-07-26 04:55:40', '2025-07-26 04:55:40'),
(13, 18, '20250730_11080718', 'qrcodes/event-20250730_11080718.png', '2025-07-30 03:08:08', '2025-07-30 03:08:08'),
(14, 19, '20250730_14234319', 'qrcodes/event-20250730_14234319.png', '2025-07-30 06:23:44', '2025-07-30 06:23:44'),
(15, 20, '20250730_14300420', 'qrcodes/event-20250730_14300420.png', '2025-07-30 06:30:04', '2025-07-30 06:30:04'),
(16, 20, '20250730_14310820', 'qrcodes/event-20250730_14310820.png', '2025-07-30 06:31:08', '2025-07-30 06:31:08'),
(17, 21, '20250731_11070121', 'qrcodes/event-20250731_11070121.png', '2025-07-31 03:07:02', '2025-07-31 03:07:02'),
(18, 22, '20250731_11304022', 'qrcodes/event-20250731_11304022.png', '2025-07-31 03:30:40', '2025-07-31 03:30:40'),
(19, 22, '20250731_11341422', 'qrcodes/event-20250731_11341422.png', '2025-07-31 03:34:14', '2025-07-31 03:34:14');

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `status_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `name`, `slug`, `description`, `created_by`, `status_id`, `created_at`, `updated_at`) VALUES
(1, 'SUPER ADMIN', 'SA', 'SUPER ADMIN', 1, 1, '2025-07-01 03:47:01', '2025-07-01 03:47:01'),
(2, 'User', 'User', 'User', 1, 1, '2025-07-11 05:17:59', '2025-07-11 05:17:59'),
(11, 'Event Creator', 'Event Creator', 'Can Add Event View Generate Report', 1, 1, '2025-07-07 05:20:24', '2025-07-07 05:20:24'),
(12, 'User Creator', 'User Creator', 'Can add user and edit user', 1, 1, '2025-07-07 05:34:54', '2025-07-07 05:34:54');

-- --------------------------------------------------------

--
-- Table structure for table `role_permission`
--

CREATE TABLE `role_permission` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `role_id` bigint(20) UNSIGNED NOT NULL,
  `permission_id` bigint(20) UNSIGNED NOT NULL,
  `status_id` bigint(20) UNSIGNED NOT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `role_permission`
--

INSERT INTO `role_permission` (`id`, `role_id`, `permission_id`, `status_id`, `created_by`, `created_at`, `updated_at`) VALUES
(28, 2, 11, 2, 1, '2025-07-05 02:21:46', '2025-07-12 00:20:20'),
(55, 11, 11, 1, 1, '2025-07-07 05:20:24', '2025-07-07 05:20:24'),
(56, 11, 13, 1, 1, '2025-07-07 05:20:24', '2025-07-07 05:20:24'),
(57, 11, 15, 1, 1, '2025-07-07 05:20:24', '2025-07-07 05:20:24'),
(58, 11, 12, 1, 1, '2025-07-07 05:20:24', '2025-07-07 05:20:24'),
(59, 11, 14, 1, 1, '2025-07-07 05:20:24', '2025-07-07 05:20:24'),
(60, 11, 16, 1, 1, '2025-07-07 05:33:25', '2025-07-07 05:33:25'),
(61, 12, 6, 1, 1, '2025-07-07 05:34:54', '2025-07-07 05:34:54'),
(62, 12, 7, 1, 1, '2025-07-07 05:34:54', '2025-07-07 05:34:54'),
(63, 12, 9, 1, 1, '2025-07-07 05:34:54', '2025-07-07 05:34:54'),
(64, 12, 10, 1, 1, '2025-07-07 05:34:54', '2025-07-07 05:34:54'),
(65, 12, 8, 1, 1, '2025-07-07 05:34:54', '2025-07-07 05:34:54'),
(70, 1, 6, 1, 1, '2025-07-11 23:00:33', '2025-07-11 23:00:33'),
(71, 1, 7, 1, 1, '2025-07-11 23:00:33', '2025-07-11 23:00:33'),
(72, 1, 8, 1, 1, '2025-07-11 23:00:33', '2025-07-11 23:00:33'),
(73, 1, 9, 1, 1, '2025-07-11 23:00:33', '2025-07-11 23:00:33'),
(74, 1, 10, 1, 1, '2025-07-11 23:00:33', '2025-07-11 23:00:33'),
(75, 1, 11, 1, 1, '2025-07-11 23:00:33', '2025-07-11 23:00:33'),
(76, 1, 12, 1, 1, '2025-07-11 23:00:33', '2025-07-11 23:00:33'),
(77, 1, 13, 1, 1, '2025-07-11 23:00:33', '2025-07-11 23:00:33'),
(78, 1, 14, 1, 1, '2025-07-11 23:00:33', '2025-07-11 23:00:33'),
(79, 1, 15, 1, 1, '2025-07-11 23:00:33', '2025-07-11 23:00:33'),
(80, 1, 16, 1, 1, '2025-07-11 23:00:33', '2025-07-11 23:00:33'),
(81, 1, 18, 1, 1, '2025-07-11 23:00:33', '2025-07-11 23:00:33'),
(82, 1, 19, 1, 1, '2025-07-11 23:00:33', '2025-07-11 23:00:33'),
(83, 1, 20, 1, 1, '2025-07-11 23:00:33', '2025-07-11 23:00:33'),
(84, 1, 17, 1, 1, '2025-07-11 23:00:33', '2025-07-11 23:00:33'),
(85, 2, 19, 1, 1, '2025-07-12 00:20:20', '2025-07-12 00:20:20'),
(86, 2, 20, 1, 1, '2025-07-12 00:20:20', '2025-07-12 00:20:20');

-- --------------------------------------------------------

--
-- Table structure for table `sexes`
--

CREATE TABLE `sexes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `code` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `status_id` bigint(20) UNSIGNED NOT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sexes`
--

INSERT INTO `sexes` (`id`, `name`, `code`, `description`, `status_id`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 'male', 'm', 'male', 1, 8, NULL, NULL),
(2, 'Female', 'F', 'Female', 1, 8, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `statuses`
--

CREATE TABLE `statuses` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `code` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `statuses`
--

INSERT INTO `statuses` (`id`, `name`, `code`, `description`, `created_at`, `updated_at`) VALUES
(1, 'Active', 'active', 'Active', '2025-06-18 13:38:39', '2025-06-18 13:38:39'),
(2, 'Inactive', 'inactive', 'Inactive', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `Portal_UID` varchar(150) DEFAULT NULL,
  `api_token` varchar(80) DEFAULT NULL,
  `role_id` int(11) NOT NULL,
  `status_id` int(11) NOT NULL,
  `is_request` int(10) NOT NULL DEFAULT 0,
  `created_by` int(11) DEFAULT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `push_token` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `username`, `email`, `email_verified_at`, `password`, `Portal_UID`, `api_token`, `role_id`, `status_id`, `is_request`, `created_by`, `remember_token`, `push_token`, `created_at`, `updated_at`) VALUES
(8, 'Super Admin', 'sa', 'sa', NULL, '$2y$10$eos/KOXXU.NibuBhfsn5oObmEgdxZ8eZLkJIsyfch.p5Z6jqUzgA.', NULL, 'TZqSzzFLxLAlhorhI687avFcOwp6ckhbKNl1kxETFTu2QZmldgII6DoWEOCt', 1, 1, 0, NULL, NULL, NULL, '2025-06-19 04:25:56', '2025-07-26 05:39:29'),
(30, 'eventCreator', 'eventCreator', 'eventCreator', NULL, '$2y$10$egEiAvi4.teS9WzhqI2tFuZXGNR8uCCJenI0lGcCydLmhttYjsWOe', NULL, 'kXY3JtJuBJr4d0IXWTjnksOsISo6EUBZ2r6YIZ5FzEwseJUxOm6xqpsTaBwP', 11, 1, 0, NULL, NULL, NULL, '2025-07-14 03:11:26', '2025-07-14 03:11:39'),
(31, 'UserTest1', 'UserTest1', 'UserTest1@gmail.com', NULL, '$2y$10$VAqtzcQy69QUihHa3SCvkOtkVrX4E3l6qFLOf/FtBiTxEMOTXnkZi', NULL, 'ACPk9WvFIFUExohjT5DX0v4xyzyI7wwEPFPB323C91y7OH4B0lx58MigJtgf', 2, 1, 0, NULL, NULL, NULL, '2025-07-14 03:23:01', '2025-07-26 04:32:34'),
(32, 'userTest2', 'userTest2', 'userTest2@gmail.com', NULL, '$2y$10$VwUE7me2ytHaxllZuOso.OzkHVeZDITsCSy0RnEA5YT8.fhuiv8qm', NULL, 'z8gTCYXuxOT6cJalx5yQ1KzbIlSj4f10Q5wyEUGO3G9rrA4bYa8oHwa899cA', 2, 1, 0, NULL, NULL, NULL, '2025-07-15 04:18:50', '2025-07-15 04:20:18'),
(33, 'Elder', 'Elder@gmail.com', 'Elder', NULL, '$2y$10$4QsEUrKRnIYw0syJK8SFsui4pCM4pIZc9z2oPPWLMnZCZ.Y8dULzu', NULL, 'BOkd9mEog0OJ0iyesqQqRwUOmIiLI4G2IRrEPXtRaI7dCkt4krwsM6mrGqdD', 2, 1, 0, NULL, NULL, NULL, '2025-07-26 04:50:12', '2025-07-29 06:12:54'),
(34, 'TEST', 'TEST', 'test09@gmail.com', NULL, '$2y$10$jLvatZm25SBI2NWLQxXWvOVauKHKgsACReBuHBmnLjvs8v2XrmDmy', NULL, 'RIMrgQCEPsZmviDEYeZRN2Yj791WNEQVzHvL1gUOkBDmRm8isLvQBI0QSb9I', 2, 0, 1, NULL, NULL, NULL, '2025-07-27 01:32:42', '2025-07-27 01:32:42'),
(35, 'TEST1', 'TEST1', 'TEST1@a.com', NULL, '$2y$10$zXJ1V10Z4O66VwcIUlc5LOAgLguPXhthpe.mnfzZNDyF9gUqgcsSO', NULL, NULL, 2, 0, 1, NULL, NULL, NULL, '2025-07-27 01:34:15', '2025-07-27 01:34:15'),
(37, 'TEST', 'TEST', 'test4@gmail.com', NULL, '$2y$10$gLssA1HeSUsj0z5wpnMIKeBlSzMw1.0QbuqlN47Bq6DH8pGtrGAki', NULL, NULL, 11, 0, 1, NULL, NULL, NULL, '2025-07-28 04:02:12', '2025-07-28 04:02:12'),
(38, 'TEST', 'TEST5', 'test5@gmail.com', NULL, '$2y$10$RFNQUd7AIsg6dz1o6/69h.pZh0ZFKYFreZ1RZb2GRzwDB2KdanuP.', NULL, NULL, 2, 0, 1, NULL, NULL, NULL, '2025-07-28 04:04:52', '2025-07-28 04:04:52'),
(39, 'TEST6', 'TEST6', 'test6@gmail.com', NULL, '$2y$10$SVsSSIBDO7pI8sn0d/8tsOsLVYHRP4rC7pR0BpKFKSxM0CI7ltKJq', NULL, '0nSNhVw97QVc3uDDf3tkzgAT6oncFuG7iEMZGTXHntHssOgEkYuCzVCLmuR8', 2, 1, 0, NULL, NULL, NULL, '2025-07-28 04:05:59', '2025-07-28 04:22:07'),
(44, 'John Doe', 'jdoe', 'j@x.com', NULL, '$2y$10$d9ihhD33doeu8NJgRPcHfe9cVJPLWmEnbla.J.A1BMQffWOIZOVu.', NULL, 'In5oQ3xuyBGMc5vUnCYo42KcDVPyulkYJo4jTY9djtqSoWE1NR9r9D1tBZgX', 2, 1, 0, NULL, NULL, NULL, '2025-07-28 07:37:36', '2025-07-28 07:37:36'),
(45, 'Omandam', 'rheymaromandam10@gmail.com', 'rheymaromandam10@gmail.com', NULL, '$2y$10$rBjvMLA7zY6cXJ6mwH8dsu.2FAQdSxwzfwYEMRkIMJolUEhA0YCJ6', NULL, 'LHq8dh8eHKJ270Xmgw43010w99WEmD2Rk48SAYNp5VT6No0siqDNG8dIzriz', 2, 1, 0, NULL, NULL, NULL, '2025-08-01 21:36:39', '2025-08-01 21:38:12'),
(46, 'Test1234', 'Test@gmail.com', 'Test@gmail.com', NULL, '$2y$10$TNeBl2vGUMTNft8tsZavOO6QgcKbwofsomo97FEOVKMMvjwVGyve6', NULL, NULL, 2, 0, 1, NULL, NULL, NULL, '2025-08-01 22:19:55', '2025-08-01 22:19:55'),
(47, 'Test099', 'rheymaromandam91@gmail.com', 'rheymaromandam91@gmail.com', NULL, '$2y$10$V8eXHVhmJ5qeMpHzTnV7ue7p/L8.58flT1LSzN5NdcQYpJ0U7YC2i', NULL, NULL, 2, 0, 1, NULL, NULL, NULL, '2025-08-01 22:22:26', '2025-08-01 22:22:26'),
(50, 'Testquwuuw', 'rheymaromandam91h1@gmail.com', 'rheymaromandam91h1@gmail.com', NULL, '$2y$10$XR45GF/FipyJbYjBc7JKmONTRCWyM4KrkZT24j7U0AOHpmIb/JYwm', NULL, NULL, 2, 0, 1, NULL, NULL, NULL, '2025-08-01 22:39:46', '2025-08-01 22:39:46'),
(51, 'Test', 'test12344@gmail.com', 'test12344@gmail.com', NULL, '$2y$10$VcKF2pcl9ZsB8AL/RFhNDuF/j3JCZgsApzaJW9pOezkYz91cokIP2', NULL, NULL, 2, 0, 1, NULL, NULL, NULL, '2025-08-01 22:48:33', '2025-08-01 22:48:33'),
(52, 'TESt', 'TEST08', 'TEST08@gmail.com', NULL, '$2y$10$kIEfTOyw39pdfSX1wn/4m.lGOuR3dTeRr9vDvr0x2tRm1UQZN8P1K', NULL, 'XeupE2DPjSCRhMLQDW6aERwO9JCKa2cI6FwLDZ4097WFiOyLjlSIUfELHeQM', 2, 1, 0, NULL, NULL, NULL, '2025-08-02 05:11:33', '2025-08-02 05:11:50');

-- --------------------------------------------------------

--
-- Table structure for table `user_account_type`
--

CREATE TABLE `user_account_type` (
  `id` int(11) NOT NULL,
  `group_id` int(11) NOT NULL,
  `user_id` int(20) DEFAULT NULL,
  `account_type_id` int(11) NOT NULL,
  `status` tinyint(4) DEFAULT 1,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_account_type`
--

INSERT INTO `user_account_type` (`id`, `group_id`, `user_id`, `account_type_id`, `status`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 1, 31, 1, 1, 1, '2025-07-15 11:49:23', '2025-07-30 03:06:22'),
(2, 1, 8, 1, 2, 1, '2025-07-16 01:53:19', '2025-07-16 01:56:00'),
(3, 1, 8, 3, 2, 1, '2025-07-16 01:53:19', '2025-07-16 01:54:08'),
(4, 2, 8, 7, 1, 1, '2025-07-16 01:56:00', '2025-07-16 01:56:00'),
(5, 2, 8, 6, 1, 1, '2025-07-16 01:56:00', '2025-07-16 01:56:00'),
(6, 1, 31, 2, 1, 1, '2025-07-16 02:04:44', '2025-07-30 03:06:22'),
(7, 2, 33, 4, 1, 8, '2025-07-26 05:02:30', '2025-07-26 05:05:06'),
(8, 2, 33, 5, 1, 8, '2025-07-26 05:03:17', '2025-07-26 05:03:17'),
(9, 1, 37, 1, 1, 1, '2025-07-28 04:02:13', '2025-07-28 04:02:13'),
(10, 1, 37, 2, 1, 1, '2025-07-28 04:02:13', '2025-07-28 04:02:13'),
(11, 1, 37, 3, 1, 1, '2025-07-28 04:02:13', '2025-07-28 04:02:13'),
(12, 2, 38, 4, 1, 1, '2025-07-28 04:04:52', '2025-07-28 04:04:52'),
(13, 2, 38, 5, 1, 1, '2025-07-28 04:04:52', '2025-07-28 04:04:52'),
(14, 2, 38, 6, 1, 1, '2025-07-28 04:04:52', '2025-07-28 04:04:52'),
(15, 2, 38, 7, 1, 1, '2025-07-28 04:04:52', '2025-07-28 04:04:52'),
(16, 2, 39, 4, 1, 1, '2025-07-28 04:05:59', '2025-07-28 04:05:59'),
(17, 2, 39, 5, 1, 1, '2025-07-28 04:05:59', '2025-07-28 04:05:59'),
(18, 2, 39, 6, 1, 1, '2025-07-28 04:05:59', '2025-07-28 04:05:59'),
(19, 2, 39, 7, 1, 1, '2025-07-28 04:05:59', '2025-07-28 04:05:59'),
(25, 2, 44, 4, 2, 8, '2025-07-28 07:37:36', '2025-07-28 07:40:07'),
(26, 1, 44, 1, 1, 8, '2025-07-28 07:40:07', '2025-07-28 07:40:07'),
(27, 1, 44, 3, 1, 8, '2025-07-28 07:40:07', '2025-07-28 07:40:07'),
(28, 1, 44, 2, 1, 8, '2025-07-28 07:40:07', '2025-07-28 07:40:07'),
(29, 3, 31, 8, 2, 8, '2025-07-30 03:05:32', '2025-07-30 03:06:22'),
(30, 3, 31, 9, 2, 8, '2025-07-30 03:05:32', '2025-07-30 03:06:22'),
(31, 1, 31, 3, 1, 8, '2025-07-30 03:06:22', '2025-07-30 03:06:22'),
(32, 1, 45, 1, 1, 8, '2025-08-01 21:38:58', '2025-08-01 21:38:58'),
(33, 1, 45, 3, 1, 8, '2025-08-01 21:38:58', '2025-08-01 21:38:58'),
(34, 1, 45, 2, 1, 8, '2025-08-01 21:38:58', '2025-08-01 21:38:58'),
(35, 1, 51, 1, 1, 1, '2025-08-01 22:48:33', '2025-08-01 22:48:33'),
(36, 1, 51, 2, 1, 1, '2025-08-01 22:48:33', '2025-08-01 22:48:33'),
(37, 1, 51, 3, 1, 1, '2025-08-01 22:48:33', '2025-08-01 22:48:33'),
(38, 1, 52, 1, 1, 1, '2025-08-02 05:11:33', '2025-08-02 05:11:33'),
(39, 1, 52, 2, 1, 1, '2025-08-02 05:11:33', '2025-08-02 05:11:33'),
(40, 1, 52, 3, 1, 1, '2025-08-02 05:11:33', '2025-08-02 05:11:33');

-- --------------------------------------------------------

--
-- Table structure for table `user_details`
--

CREATE TABLE `user_details` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `first_name` varchar(255) NOT NULL,
  `middle_name` varchar(255) DEFAULT NULL,
  `last_name` varchar(255) NOT NULL,
  `birthdate` date DEFAULT NULL,
  `age` int(11) DEFAULT NULL,
  `sex_id` int(11) DEFAULT NULL,
  `phone_number` varchar(255) DEFAULT NULL,
  `civil_status` varchar(255) DEFAULT NULL,
  `nationality` varchar(255) DEFAULT NULL,
  `religion` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `barangay` varchar(255) DEFAULT NULL,
  `municipal` varchar(255) DEFAULT NULL,
  `province` varchar(255) DEFAULT NULL,
  `church` varchar(255) DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `status_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_details`
--

INSERT INTO `user_details` (`id`, `user_id`, `first_name`, `middle_name`, `last_name`, `birthdate`, `age`, `sex_id`, `phone_number`, `civil_status`, `nationality`, `religion`, `address`, `barangay`, `municipal`, `province`, `church`, `created_by`, `status_id`, `created_at`, `updated_at`) VALUES
(4, 8, 'Super', 'admin', 'ADMIN', NULL, NULL, 1, '09556246587', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 8, 1, '2025-06-19 04:25:56', '2025-06-19 04:25:56'),
(21, 30, 'eventCreator', NULL, 'eventCreator', '2025-07-14', NULL, 1, '096334329730', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 30, 1, '2025-07-14 03:11:26', '2025-07-14 03:11:26'),
(22, 31, 'UserTest1', 'UserTest1', 'UserTest1', '2025-07-03', NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 31, 1, '2025-07-14 03:23:01', '2025-07-14 03:43:14'),
(23, 32, 'userTest2', 'userTest2', 'userTest2', NULL, NULL, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 32, 1, '2025-07-15 04:18:50', '2025-07-15 04:18:50'),
(24, 33, 'Elder', '', 'Elder', '2001-05-20', NULL, 1, '095562468745', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 33, 1, '2025-07-26 04:50:12', '2025-07-26 05:02:30'),
(25, 34, 'TEST', 'TEST', 'TEST', NULL, NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 34, 1, '2025-07-27 01:32:42', '2025-07-27 01:32:42'),
(26, 35, 'TEST1', 'TEST1', 'TEST1', NULL, NULL, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 35, 1, '2025-07-27 01:34:15', '2025-07-27 01:34:15'),
(28, 37, 'TEST', 'TEST', 'TEST', NULL, NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 37, 1, '2025-07-28 04:02:12', '2025-07-28 04:02:12'),
(29, 38, 'TEST', 'TEST', 'TEST', NULL, NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 38, 1, '2025-07-28 04:04:52', '2025-07-28 04:04:52'),
(30, 39, 'TEST6', 'TEST6', 'TEST6', NULL, NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 39, 1, '2025-07-28 04:05:59', '2025-07-28 04:05:59'),
(34, 44, 'John', 'Test', 'Doe', '1990-05-02', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 8, 1, '2025-07-28 07:37:36', '2025-07-28 07:37:36'),
(35, 45, 'Janice', 'Conde', 'Omandam', '2013-05-13', NULL, 1, '09556246754', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 45, 1, '2025-08-01 21:36:39', '2025-08-01 21:36:39'),
(36, 46, 'Test1234', 'Test1234', 'Test1234', '2025-08-01', NULL, 2, '09556248522', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 46, 1, '2025-08-01 22:19:55', '2025-08-01 22:19:55'),
(37, 47, 'Test099', 'Test099', 'Test099', '2025-08-02', NULL, 1, '095568462458', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 47, 1, '2025-08-01 22:22:26', '2025-08-01 22:22:26'),
(40, 50, 'Test616116', '53wusua', 'Testquwuuw', '2025-08-03', NULL, NULL, '09556842757', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 50, 1, '2025-08-01 22:39:46', '2025-08-01 22:39:46'),
(41, 51, 'Test', 'Test', 'Test', '2025-08-19', NULL, 2, '09588885', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 51, 1, '2025-08-01 22:48:33', '2025-08-01 22:48:33'),
(42, 52, 'TEST', 'TEST', 'TESt', NULL, NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 52, 1, '2025-08-02 05:11:33', '2025-08-02 05:11:33');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `account_groups`
--
ALTER TABLE `account_groups`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Indexes for table `account_types`
--
ALTER TABLE `account_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `group_id` (`group_id`);

--
-- Indexes for table `events`
--
ALTER TABLE `events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `events_created_by_foreign` (`created_by`),
  ADD KEY `events_status_id_foreign` (`status_id`);

--
-- Indexes for table `event_modes`
--
ALTER TABLE `event_modes`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `event_programs`
--
ALTER TABLE `event_programs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `event_programs_event_id_foreign` (`event_id`);

--
-- Indexes for table `event_qrcodes`
--
ALTER TABLE `event_qrcodes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `event_qrcodes_event_id_foreign` (`event_id`);

--
-- Indexes for table `event_registrations`
--
ALTER TABLE `event_registrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `event_sponsors`
--
ALTER TABLE `event_sponsors`
  ADD PRIMARY KEY (`id`),
  ADD KEY `event_sponsors_event_id_foreign` (`event_id`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indexes for table `meetings`
--
ALTER TABLE `meetings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `meetings_created_by_foreign` (`created_by`),
  ADD KEY `meetings_status_id_foreign` (`status_id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `nationality`
--
ALTER TABLE `nationality`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `password_resets`
--
ALTER TABLE `password_resets`
  ADD KEY `password_resets_email_index` (`email`);

--
-- Indexes for table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `permissions_name_unique` (`name`),
  ADD UNIQUE KEY `permissions_code_unique` (`code`),
  ADD KEY `permissions_created_by_foreign` (`created_by`),
  ADD KEY `permissions_status_id_foreign` (`status_id`),
  ADD KEY `group_id` (`group_id`);

--
-- Indexes for table `permission_groups`
--
ALTER TABLE `permission_groups`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`);

--
-- Indexes for table `qrcodes`
--
ALTER TABLE `qrcodes`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `roles_name_unique` (`name`),
  ADD UNIQUE KEY `roles_slug_unique` (`slug`),
  ADD KEY `roles_created_by_foreign` (`created_by`),
  ADD KEY `roles_status_id_foreign` (`status_id`);

--
-- Indexes for table `role_permission`
--
ALTER TABLE `role_permission`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `role_permission_role_id_permission_id_unique` (`role_id`,`permission_id`),
  ADD KEY `role_permission_permission_id_foreign` (`permission_id`),
  ADD KEY `role_permission_status_id_foreign` (`status_id`),
  ADD KEY `role_permission_created_by_foreign` (`created_by`);

--
-- Indexes for table `sexes`
--
ALTER TABLE `sexes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `sexes_name_unique` (`name`),
  ADD UNIQUE KEY `sexes_code_unique` (`code`),
  ADD KEY `sexes_status_id_foreign` (`status_id`),
  ADD KEY `sexes_created_by_foreign` (`created_by`);

--
-- Indexes for table `statuses`
--
ALTER TABLE `statuses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `statuses_name_unique` (`name`),
  ADD UNIQUE KEY `statuses_code_unique` (`code`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`),
  ADD UNIQUE KEY `users_api_token_unique` (`api_token`);

--
-- Indexes for table `user_account_type`
--
ALTER TABLE `user_account_type`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `user_details`
--
ALTER TABLE `user_details`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_details_user_id_foreign` (`user_id`),
  ADD KEY `user_details_created_by_foreign` (`created_by`),
  ADD KEY `user_details_status_id_foreign` (`status_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `account_groups`
--
ALTER TABLE `account_groups`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `account_types`
--
ALTER TABLE `account_types`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `events`
--
ALTER TABLE `events`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `event_modes`
--
ALTER TABLE `event_modes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;

--
-- AUTO_INCREMENT for table `event_programs`
--
ALTER TABLE `event_programs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `event_qrcodes`
--
ALTER TABLE `event_qrcodes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `event_registrations`
--
ALTER TABLE `event_registrations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `event_sponsors`
--
ALTER TABLE `event_sponsors`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `meetings`
--
ALTER TABLE `meetings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `nationality`
--
ALTER TABLE `nationality`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `permission_groups`
--
ALTER TABLE `permission_groups`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `qrcodes`
--
ALTER TABLE `qrcodes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `role_permission`
--
ALTER TABLE `role_permission`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=87;

--
-- AUTO_INCREMENT for table `sexes`
--
ALTER TABLE `sexes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `statuses`
--
ALTER TABLE `statuses`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=53;

--
-- AUTO_INCREMENT for table `user_account_type`
--
ALTER TABLE `user_account_type`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT for table `user_details`
--
ALTER TABLE `user_details`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `account_types`
--
ALTER TABLE `account_types`
  ADD CONSTRAINT `account_types_ibfk_1` FOREIGN KEY (`group_id`) REFERENCES `account_groups` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `events`
--
ALTER TABLE `events`
  ADD CONSTRAINT `events_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `events_status_id_foreign` FOREIGN KEY (`status_id`) REFERENCES `statuses` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `event_qrcodes`
--
ALTER TABLE `event_qrcodes`
  ADD CONSTRAINT `event_qrcodes_event_id_foreign` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `event_sponsors`
--
ALTER TABLE `event_sponsors`
  ADD CONSTRAINT `event_sponsors_event_id_foreign` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `meetings`
--
ALTER TABLE `meetings`
  ADD CONSTRAINT `meetings_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `meetings_status_id_foreign` FOREIGN KEY (`status_id`) REFERENCES `statuses` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `role_permission`
--
ALTER TABLE `role_permission`
  ADD CONSTRAINT `role_permission_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `role_permission_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `role_permission_status_id_foreign` FOREIGN KEY (`status_id`) REFERENCES `statuses` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `sexes`
--
ALTER TABLE `sexes`
  ADD CONSTRAINT `sexes_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `sexes_status_id_foreign` FOREIGN KEY (`status_id`) REFERENCES `statuses` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_details`
--
ALTER TABLE `user_details`
  ADD CONSTRAINT `user_details_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `user_details_status_id_foreign` FOREIGN KEY (`status_id`) REFERENCES `statuses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_details_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
