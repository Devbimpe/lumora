DROP DATABASE IF EXISTS LUMORA;
CREATE DATABASE LUMORA;

USE LUMORA;

CREATE TABLE Users(
    UserID INT PRIMARY KEY auto_increment,
    Username VARCHAR(50) NOT NULL UNIQUE,
    Password VARCHAR(100) NOT NULL,
    Email VARCHAR(100) NOT NULL UNIQUE,
    Role ENUM('Student', 'Admin') NOT NULL,
    PercentModulesCompleted DECIMAL(5,2) DEFAULT 0.00
);
-- Check if when creating database, the modules table have Heading and Subheading
CREATE TABLE Modules(
    ModuleID INT PRIMARY KEY auto_increment,
    Heading varchar(50) NOT NULL,
    Subheading varchar(50) NOT NULL
);

CREATE TABLE Content(
    ContentID INT PRIMARY KEY auto_increment,
    ModuleID INT NOT NULL,
    Overview TEXT,
    Reading TEXT,
    FOREIGN KEY (ModuleID) references Modules(ModuleID)
);

CREATE TABLE KnowledgeChecks (
    KnowledgeCheckID INT PRIMARY KEY AUTO_INCREMENT,
    ContentID INT NOT NULL,
    Question TEXT NOT NULL,
    Answer TEXT NOT NULL,
    FOREIGN KEY (ContentID) REFERENCES Content(ContentID)
);

CREATE TABLE StudentSubmissions (
    StudentSubmissionID INT PRIMARY KEY AUTO_INCREMENT,
    KnowledgeCheckID INT NOT NULL,
    StudentID INT NOT NULL,
    SubmissionAnswer TEXT NOT NULL, 
    Grade DECIMAL(5,2) DEFAULT NULL, 
    FOREIGN KEY (KnowledgeCheckID) REFERENCES KnowledgeChecks(KnowledgeCheckID),
    FOREIGN KEY (StudentID) REFERENCES Users(UserID) ON DELETE CASCADE
);

-- Insert into Users with PROPER passwords
INSERT INTO Users (Username, Password, Email, Role, PercentModulesCompleted) VALUES
('john_doe', 'Password123!', 'john.doe@example.com', 'Student', 50.00),
('jane_smith', 'Password456!', 'jane.smith@example.com', 'Student', 25.00),
('admin_user', 'AdminPass789!', 'admin@example.com', 'Admin', 0.00);

-- Insert into Modules
INSERT INTO Modules (Heading, Subheading) VALUES
('React Basics', 'What is React?'),
('Next.js Fundamentals', 'What is next.js?');

-- Insert into Content
INSERT INTO Content (ModuleID, Overview, Reading) VALUES
(1, 'Introduction to React components and JSX', 'React is a JavaScript library for building user interfaces...'),
(1, 'State and Props in React', 'Learn how to manage state and pass props in React components...'),
(2, 'Overview of Next.js features', 'Next.js is a React framework with server-side rendering...'),
(2, 'API Routes in Next.js', 'Create serverless APIs with Next.js...');

-- Insert into KnowledgeChecks
INSERT INTO KnowledgeChecks (ContentID, Question, Answer) VALUES
(1, 'What is JSX in React?', 'JSX is a syntax extension for JavaScript used in React.'),
(2, 'What is the difference between state and props?', 'State is mutable, props are immutable.'),
(3, 'What is server-side rendering in Next.js?', 'Rendering pages on the server for each request.'),
(4, 'How do you create an API route in Next.js?', 'Create a file in the pages/api directory.');
-- Insert into StudentSubmissions
INSERT INTO StudentSubmissions (KnowledgeCheckID, StudentID, SubmissionAnswer, Grade) VALUES
(1, 1, 'JSX is a syntax for React.', 90.00),
(2, 1, 'State changes, props don''t.', 85.00),
(3, 2, 'Server-side rendering is rendering on the server.', NULL),
(4, 2, 'API routes are in pages/api folder.', 95.00);
-- Update User table for the email activation flow
ALTER TABLE Users
ADD COLUMN activationTokenExpires DATETIME,
ADD COLUMN isActivated BOOLEAN DEFAULT FALSE,
ADD COLUMN ActivationToken VARCHAR(255);



DELETE FROM Users
WHERE UserID >7;
-- View the dummy data in the table
SELECT * FROM Users;
SELECT * FROM Modules;
SELECT * FROM Content;
SELECT * FROM KnowledgeChecks;
SELECT * FROM StudentSubmissions;

