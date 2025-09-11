-- SQL Dump for Domain Manager Application
-- version 1.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 29, 2023 at 10:00 AM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `domain_manager_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `applications`
--

CREATE TABLE `applications` (
  `id` varchar(255) NOT NULL,
  `domainName` varchar(255) NOT NULL,
  `opd` varchar(255) NOT NULL,
  `status` enum('pending_review','pending_approval','approved','rejected') NOT NULL,
  `submittedDate` date NOT NULL,
  `applicantName` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `documents` text DEFAULT NULL,
  `rejectionReason` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `applications`
--

INSERT INTO `applications` (`id`, `domainName`, `opd`, `status`, `submittedDate`, `applicantName`, `description`, `documents`, `rejectionReason`) VALUES
('APP001', 'dinkes.kalbarprov.go.id', 'Dinas Kesehatan', 'pending_approval', '2023-10-26', 'Dr. Siti Nurbaya', 'Portal utama untuk informasi kesehatan dan layanan publik Dinas Kesehatan Provinsi Kalimantan Barat. Akan menampilkan berita, artikel, dan data statistik kesehatan.', '["surat_permohonan_dinkes.pdf","kak_dinkes.pdf"]', NULL),
('APP002', 'inspektorat.kalbarprov.go.id', 'Inspektorat', 'approved', '2023-10-25', 'Ahmad Subarjo', 'Sistem Informasi Manajemen Pengawasan (SIM-P) untuk keperluan internal Inspektorat Daerah. Digunakan untuk pelaporan dan tindak lanjut hasil pengawasan.', '["surat_permohonan_inspektorat.pdf"]', NULL),
('APP003', 'disdukcapil.kalbarprov.go.id', 'Disdukcapil', 'pending_review', '2023-10-28', 'Budi Santoso', 'Layanan online untuk pengurusan dokumen kependudukan, seperti Akta Kelahiran, Kartu Keluarga, dan KTP. Memerlukan integrasi dengan data kependudukan pusat.', '["surat_permohonan_dukcapil.pdf"]', NULL),
('APP004', 'bkpsdm.kalbarprov.go.id', 'BKPSDM', 'rejected', '2023-10-22', 'Retno Wulandari', 'Portal e-learning untuk pelatihan dan pengembangan kompetensi ASN di lingkungan Pemprov Kalbar.', '["surat_permohonan_bkpsdm.pdf"]', 'Nama domain sudah terdaftar namun belum aktif. Mohon ajukan permohonan aktivasi.'),
('APP005', 'covid19.kalbarprov.go.id', 'Dinas Kesehatan', 'approved', '2023-09-15', 'Dr. Siti Nurbaya', 'Dashboard informasi real-time mengenai perkembangan kasus COVID-19 di Kalimantan Barat. Telah berkoordinasi dengan tim satgas.', '["surat_permohonan_covid.pdf"]', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` varchar(255) NOT NULL,
  `user` varchar(255) NOT NULL,
  `userRole` enum('Super Admin','Administrator','Operator','Auditor') NOT NULL,
  `action` varchar(255) NOT NULL,
  `timestamp` datetime NOT NULL,
  `details` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `audit_logs`
--

INSERT INTO `audit_logs` (`id`, `user`, `userRole`, `action`, `timestamp`, `details`) VALUES
('LOG001', 'Administrator', 'Administrator', 'APPROVE_APPLICATION', '2023-10-28 14:30:15', 'Menyetujui permohonan untuk inspektorat.kalbarprov.go.id'),
('LOG002', 'Super Admin', 'Super Admin', 'UPDATE_DOMAIN_INFO', '2023-10-28 14:05:00', 'Memperbarui record DNS untuk diskominfo.kalbarprov.go.id'),
('LOG003', 'Ahmad Subarjo', 'Operator', 'SUBMIT_APPLICATION', '2023-10-28 11:15:45', 'Mengajukan permohonan untuk disdukcapil.kalbarprov.go.id'),
('LOG004', 'Administrator', 'Administrator', 'REJECT_APPLICATION', '2023-10-27 10:00:00', 'Menolak permohonan untuk bkpsdm.kalbarprov.go.id'),
('LOG005', 'Auditor Utama', 'Auditor', 'VIEW_AUDIT_TRAIL', '2023-10-27 09:00:00', 'Melihat log aktivitas sistem'),
('LOG006', 'Super Admin', 'Super Admin', 'ADD_USER', '2023-10-26 16:00:00', 'Menambahkan pengguna baru: Budi Santoso (Operator)');

-- --------------------------------------------------------

--
-- Table structure for table `domains`
--

CREATE TABLE `domains` (
  `id` varchar(255) NOT NULL,
  `hostname` varchar(255) NOT NULL,
  `parentDomain` varchar(255) NOT NULL,
  `status` enum('active','inactive','pending','error') NOT NULL,
  `opd` varchar(255) NOT NULL,
  `activationDate` date NOT NULL,
  `expiryDate` date DEFAULT NULL,
  `ipAddress` varchar(45) DEFAULT NULL,
  `nameserver` varchar(255) DEFAULT NULL,
  `ttl` varchar(255) DEFAULT NULL,
  `recordType` varchar(50) DEFAULT NULL,
  `destination` varchar(255) DEFAULT NULL,
  `priority` varchar(50) DEFAULT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `domains`
--

INSERT INTO `domains` (`id`, `hostname`, `parentDomain`, `status`, `opd`, `activationDate`, `expiryDate`, `ipAddress`, `nameserver`, `ttl`, `recordType`, `destination`, `priority`, `description`) VALUES
('DOM001', 'dinkes.kalbarprov.go.id', 'kalbarprov.go.id', 'pending', 'Dinas Kesehatan', '2023-10-29', NULL, '103.120.30.40', NULL, '3600', 'A', '103.120.30.40', NULL, NULL),
('DOM002', 'inspektorat.kalbarprov.go.id', 'kalbarprov.go.id', 'active', 'Inspektorat', '2023-10-27', NULL, '103.120.30.41', NULL, '3600', 'A', '103.120.30.41', NULL, NULL),
('DOM003', 'diskominfo.kalbarprov.go.id', 'kalbarprov.go.id', 'active', 'Dinas Komunikasi dan Informatika', '2022-01-15', NULL, '103.120.30.30', NULL, '3600', 'A', '103.120.30.30', NULL, NULL),
('DOM004', 'bkpsdm.kalbarprov.go.id', 'kalbarprov.go.id', 'inactive', 'BKPSDM', '2023-01-20', '2024-01-20', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('DOM005', 'dpmptsp.kalbarprov.go.id', 'kalbarprov.go.id', 'error', 'DPMPTSP', '2023-05-10', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Nameserver conflict');

-- --------------------------------------------------------

--
-- Table structure for table `hosting_applications`
--

CREATE TABLE `hosting_applications` (
  `id` varchar(255) NOT NULL,
  `applicationName` varchar(255) NOT NULL,
  `domainName` varchar(255) NOT NULL,
  `opd` varchar(255) NOT NULL,
  `status` enum('pending_review','pending_approval','approved','rejected') NOT NULL,
  `submittedDate` date NOT NULL,
  `applicantName` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `framework` enum('Next.js','Laravel','CMS','Lainnya') NOT NULL,
  `rejectionReason` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `hosting_applications`
--

INSERT INTO `hosting_applications` (`id`, `applicationName`, `domainName`, `opd`, `status`, `submittedDate`, `applicantName`, `description`, `framework`, `rejectionReason`) VALUES
('HST001', 'SI-ASN Terpadu', 'bkpsdm.kalbarprov.go.id', 'BKPSDM', 'pending_review', '2023-10-29', 'Retno Wulandari', 'Membutuhkan hosting untuk aplikasi Sistem Informasi ASN Terpadu berbasis Laravel. Perkiraan database 5GB dan trafik sedang.', 'Laravel', NULL),
('HST002', 'Portal Utama Diskominfo', 'diskominfo.kalbarprov.go.id', 'Dinas Komunikasi dan Informatika', 'approved', '2023-09-01', 'Super Admin', 'Hosting untuk portal utama Diskominfo. Dibangun menggunakan Next.js dengan trafik tinggi.', 'Next.js', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `role` enum('Super Admin','Administrator','Operator','Auditor') NOT NULL,
  `status` enum('active','inactive') NOT NULL,
  `opd` varchar(255) DEFAULT NULL,
  `nip` varchar(255) DEFAULT NULL,
  `whatsapp` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `role`, `status`, `opd`, `nip`, `whatsapp`) VALUES
('USR001', 'Administrator', 'admin@diskominfo.go.id', 'Administrator', 'active', 'Dinas Komunikasi dan Informatika', '197001011990031001', '081234567890'),
('USR002', 'Super Admin', 'super.admin@diskominfo.go.id', 'Super Admin', 'active', 'Dinas Komunikasi dan Informatika', '197001011990031003', '081234567890'),
('USR003', 'Ahmad Subarjo', 'ahmad.s@inspektorat.go.id', 'Operator', 'active', 'Inspektorat', '198502022005011002', '081234567891'),
('USR004', 'Dr. Siti Nurbaya', 'siti.n@dinkes.go.id', 'Operator', 'active', 'Dinas Kesehatan', '198203032006042001', '081234567892'),
('USR005', 'Auditor Utama', 'auditor.utama@inspektorat.go.id', 'Auditor', 'active', 'Inspektorat', 'AUDITOR001', '081234567893'),
('USR006', 'Budi Santoso', 'budi.s@disdukcapil.go.id', 'Operator', 'active', 'Disdukcapil', '199004042010011003', '081234567894'),
('USR007', 'Retno Wulandari', 'retno.w@bkpsdm.go.id', 'Operator', 'inactive', 'BKPSDM', '198805052009022004', '081234567895'),
('USR008', 'Joko Susilo', 'joko.s@dpmptsp.go.id', 'Operator', 'active', 'DPMPTSP', '199206062014031005', '081234567896');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `applications`
--
ALTER TABLE `applications`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `domains`
--
ALTER TABLE `domains`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `hostname` (`hostname`);

--
-- Indexes for table `hosting_applications`
--
ALTER TABLE `hosting_applications`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
