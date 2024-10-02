DROP DATABASE IF EXISTS STJDA;
CREATE DATABASE STJDA;
USE STJDA;

CREATE TABLE Camper (
    ID INT AUTO_INCREMENT PRIMARY KEY UNIQUE,
    Photo TEXT,
    Banner TEXT,
    Email VARCHAR(255),
    Password VARCHAR(255),
    Notifications BOOLEAN DEFAULT FALSE,
    Phone VARCHAR(20),
    Notes TEXT,
    CareDataID INT UNIQUE,
    OriginsID INT UNIQUE
);

CREATE TABLE CareData (
    ID INT AUTO_INCREMENT PRIMARY KEY UNIQUE NOT NULL,
    CamperID INT UNIQUE,
    CareType VARCHAR(255),
    TargetBG INT,
    CorrectionFactor VARCHAR(255),
    MDI BOOLEAN,
    CGM VARCHAR(255),
    InsulinPump BOOLEAN,
    InsulinPumpModel VARCHAR(255),
    InsulinType VARCHAR(255),
    Allergies VARCHAR(255),
    EmergencyContact VARCHAR(255),
    FOREIGN KEY (CamperID) REFERENCES Camper(ID)
);

CREATE TABLE OriginsData (
    ID INT AUTO_INCREMENT PRIMARY KEY UNIQUE NOT NULL,
    CamperID INT UNIQUE,
    FirstName VARCHAR(255),
    LastName VARCHAR(255),
    Gender VARCHAR(255),
    Age INT,
    DateOfBirth DATE,
    Mother VARCHAR(255),
    Father VARCHAR(255),
    FOREIGN KEY (CamperID) REFERENCES Camper(ID)
);

-- Add foreign keys to Camper table after creating CareData and OriginsData
ALTER TABLE Camper ADD FOREIGN KEY (CareDataID) REFERENCES CareData(ID);
ALTER TABLE Camper ADD FOREIGN KEY (OriginsID) REFERENCES OriginsData(ID);

CREATE TABLE Volunteers (
    ID INT AUTO_INCREMENT PRIMARY KEY UNIQUE,
    Photo TEXT,
    Banner TEXT,
    Email VARCHAR(100) NOT NULL UNIQUE,
    Password VARCHAR(255) NOT NULL,
    VolunteerType VARCHAR(25),
    FirstName VARCHAR(25),
    LastName VARCHAR(25),
    DateOfBirth DATE,
    Notifications BOOLEAN DEFAULT FALSE,
    Phone VARCHAR(25)
);

CREATE TABLE CamperAssignedVolunteers (
    PK INT AUTO_INCREMENT PRIMARY KEY,
    CamperID INT,
    VolunteerID VARCHAR(255),
    VolunteerType VARCHAR(255),
    FOREIGN KEY (CamperID) REFERENCES Camper(ID)
);

CREATE TABLE Camps (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(255),
    Description VARCHAR(255)
);

CREATE TABLE CamperCamps (
    CamperID INT,
    CampID INT,
    PRIMARY KEY (CamperID, CampID),
    FOREIGN KEY (CamperID) REFERENCES Camper(ID),
    FOREIGN KEY (CampID) REFERENCES Camps(ID)
);

CREATE TABLE BGTargets (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    CareDataID INT UNIQUE,
    TimeLabel VARCHAR(50),
    BGTargetBreakfast VARCHAR(50),
    BGTargetLunch VARCHAR(50),
    BGTargetDinner VARCHAR(50),
    BGTargetOther VARCHAR(50),
    FOREIGN KEY (CareDataID) REFERENCES CareData(ID)
);

CREATE TABLE InsulinCarbRatios (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    CareDataID INT UNIQUE,
    TimeLabel VARCHAR(50),
    RatioBreakfast VARCHAR(50),
    RatioLunch VARCHAR(50),
    RatioDinner VARCHAR(50),
    FOREIGN KEY (CareDataID) REFERENCES CareData(ID)
);

CREATE TABLE MealReadings (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    CareDataID INT UNIQUE, 
    CamperID INT UNIQUE,
    DateTaken DATE, 
    TimeLabel VARCHAR(50),
    UnixTime BIGINT, 
    CarbAmount INT, 
    GlucoseReading INT, 
    Meal VARCHAR(50), 
    ImageIdentifier VARCHAR(255), 
    FOREIGN KEY (CareDataID) REFERENCES CareData(ID),
    FOREIGN KEY (CamperID) REFERENCES Camper(ID)
);

CREATE TABLE LongActingInsulin (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    CareDataID INT UNIQUE,
    Dosage VARCHAR(255),
    LastAdministered TIMESTAMP,
    Name VARCHAR(25),
    FOREIGN KEY (CareDataID) REFERENCES CareData(ID)
);

CREATE TABLE RapidActingInsulin (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    CareDataID INT UNIQUE,
    Dosage VARCHAR(255),
    LastAdministered TIMESTAMP,
    Name VARCHAR(25),
    FOREIGN KEY (CareDataID) REFERENCES CareData(ID)
);

CREATE TABLE SpecialNeed (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    CareDataID INT UNIQUE,
    SpecialNeedType VARCHAR(100),
    Notes TEXT,
    SpecialNeedInstructions VARCHAR(255),
    FOREIGN KEY (CareDataID) REFERENCES CareData(ID)
);

CREATE TABLE `MedicalNotes` (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    CareDataID INT UNIQUE,
    CamperID INT UNIQUE,
    NoteType VARCHAR(100),
    Content TEXT,
    Injury TEXT,
    CreatedBy VARCHAR(100),
    CreatedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedBy VARCHAR(100),
    UpdatedDate DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (CareDataID) REFERENCES CareData(ID),
    FOREIGN KEY (CamperID) REFERENCES Camper(ID)
);

CREATE TABLE `OverTheCounterMedication` (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    CareDataID INT UNIQUE,
    CamperID INT UNIQUE,
    MedicationName VARCHAR(255),
    ActiveIngredients VARCHAR(255),
    DosageAdult VARCHAR(100),
    DosageChild VARCHAR(100),
    Uses VARCHAR(512),
    SideEffects VARCHAR(512),
    Warnings VARCHAR(512),
    CreatedBy VARCHAR(100),
    Instructions VARCHAR(255),
    CreatedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedBy VARCHAR(100),
    UpdatedDate DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (CareDataID) REFERENCES CareData(ID),
    FOREIGN KEY (CamperID) REFERENCES Camper(ID)
);

CREATE TABLE `Providers` (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    CareDataID INT UNIQUE,
    CamperID INT UNIQUE,
    Role VARCHAR(100),
    Name VARCHAR(255),
    Email VARCHAR(255),
    Phone VARCHAR(15),
    CreatedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedDate DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (CareDataID) REFERENCES CareData(ID),
    FOREIGN KEY (CamperID) REFERENCES Camper(ID)
);

CREATE TABLE `Prescriptions` (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    CareDataID INT UNIQUE,
    CamperID INT UNIQUE,
    MedicineName VARCHAR(255) NOT NULL,
    GenericName VARCHAR(255),
    Form VARCHAR(100), -- e.g., tablet, capsule, liquid
    Dosage VARCHAR(100), -- e.g., 500mg, 1g
    Frequency VARCHAR(100), -- e.g., once daily, every 8 hours
    PrescribedFor VARCHAR(255), -- e.g., condition or symptom treated
    SideEffects TEXT,
    Interactions TEXT,
    Refills INT,
    Instructions VARCHAR(255),
    PrescriptionDate DATE,
    CreatedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedDate DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (CareDataID) REFERENCES CareData(ID),
    FOREIGN KEY (CamperID) REFERENCES Camper(ID)
);
