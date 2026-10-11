-- MediSync Lite - Clinic Management System Database
-- Mini Project by Sanskar Shinde, Sarvesh Ghodke, Aamer Sayed, Rohan Tarke

CREATE DATABASE IF NOT EXISTS medisync;
USE medisync;

DROP TABLE IF EXISTS bill;
DROP TABLE IF EXISTS record;
DROP TABLE IF EXISTS appointment;
DROP TABLE IF EXISTS doctor;
DROP TABLE IF EXISTS patient;

-- [Practical 10] JDBC Tables
CREATE TABLE patient (
    id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    age INT NOT NULL,
    phone VARCHAR(15) NOT NULL,
    blood_group VARCHAR(5),
    allergies VARCHAR(100)
);

CREATE TABLE doctor (
    id INT PRIMARY KEY,
    name VARCHAR(40) NOT NULL,
    specialization VARCHAR(30) NOT NULL
);

CREATE TABLE appointment (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id VARCHAR(20) NOT NULL,
    doctor_id INT NOT NULL,
    slot_time VARCHAR(10) NOT NULL,
    status VARCHAR(15) NOT NULL,
    FOREIGN KEY (patient_id) REFERENCES patient(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctor(id)
);

CREATE TABLE record (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id VARCHAR(20) NOT NULL,
    diagnosis VARCHAR(200) NOT NULL,
    prescription VARCHAR(200) NOT NULL,
    doctor_name VARCHAR(40) NOT NULL,
    date_text VARCHAR(20) NOT NULL,
    FOREIGN KEY (patient_id) REFERENCES patient(id) ON DELETE CASCADE
);

CREATE TABLE bill (
    id INT PRIMARY KEY,
    patient_id VARCHAR(20) NOT NULL,
    consultation DOUBLE NOT NULL,
    medicine DOUBLE NOT NULL,
    test_fee DOUBLE NOT NULL,
    total DOUBLE NOT NULL,
    status VARCHAR(15) NOT NULL,
    FOREIGN KEY (patient_id) REFERENCES patient(id) ON DELETE CASCADE
);

-- Insert 3 sample doctors
INSERT INTO doctor (id, name, specialization) VALUES
(1, 'Dr. Mehta', 'General'),
(2, 'Dr. Rao', 'Cardiology'),
(3, 'Dr. Khan', 'Pediatrics');

-- Insert 3 sample patients
INSERT INTO patient (id, name, age, phone, blood_group, allergies) VALUES
('MS-2026-0001', 'Rahul Sharma', 28, '9876543210', 'B+', 'Penicillin'),
('MS-2026-0002', 'Pooja Patel', 34, '9822012345', 'O+', 'None'),
('MS-2026-0003', 'Amit Kulkarni', 45, '9890098900', 'A+', 'Dust');

-- Sample Initial Appointment
INSERT INTO appointment (id, patient_id, doctor_id, slot_time, status) VALUES
(1, 'MS-2026-0001', 1, '10:00', 'BOOKED');

-- Sample Medical Record
INSERT INTO record (id, patient_id, diagnosis, prescription, doctor_name, date_text) VALUES
(1, 'MS-2026-0001', 'Seasonal Viral Fever', 'Paracetamol 650mg TDS, Cetirizine 10mg HS', 'Dr. Mehta', '2026-10-10');

-- Sample Bill
INSERT INTO bill (id, patient_id, consultation, medicine, test_fee, total, status) VALUES
(1, 'MS-2026-0001', 300.0, 150.0, 0.0, 450.0, 'PAID');
