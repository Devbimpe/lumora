CREATE DATABASE LUMORA;
USE LUMORA;

CREATE TABLE Users(
	UserID INT PRIMARY KEY auto_increment,
    Username VARCHAR(50) NOT NULL UNIQUE,
    Password VARCHAR(100) NOT NULL UNIQUE,
    Email VARCHAR(100) NOT NULL UNIQUE,
    Role ENUM('Student', 'Admin') NOT NULL,
    PercentModulesCompleted DECIMAL(5,2) DEFAULT 0.00
);
CREATE TABLE Modules(
	ModuleID INT PRIMARY KEY auto_increment,
    Title varchar(50) NOT NULL
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
    FOREIGN KEY (StudentID) REFERENCES Users(UserID)
);
ALTER TABLE StudentSubmissions
ADD CONSTRAINT fk_studentid_users
FOREIGN KEY (StudentID) REFERENCES Users(UserID) ON DELETE CASCADE;
-- Insert into Users
INSERT INTO Users (Username, Password, Email, Role, PercentModulesCompleted) VALUES
('john_doe', 'hashed_password_123', 'john.doe@example.com', 'Student', 50.00),
('jane_smith', 'hashed_password_456', 'jane.smith@example.com', 'Student', 25.00),
('admin_user', 'hashed_password_789', 'admin@example.com', 'Admin', 0.00);

-- Insert into Modules
INSERT INTO Modules (Title) VALUES
('React Basics'),
('Next.js Fundamentals');

-- Insert into Content
INSERT INTO Content (ModuleID, Overview, Reading) VALUES
(1, 'Introduction to React components and JSX', 'React is a JavaScript library for building user interfaces...'),
(1, 'State and Props in React', 'Learn how to manage state and pass props in React components...'),
(2, 'Overview of Next.js features', 'Next.js is a React framework with server-side rendering...'),
(2, 'API Routes in Next.js', 'Create serverless APIs with Next.js...');

-- Insert into KnowledgeChecks
INSERT INTO KnowledgeChecks (ContentID, ModuleID, Question, Answer) VALUES
(1, 1, 'What is JSX in React?', 'JSX is a syntax extension for JavaScript used in React.'),
(2, 1, 'What is the difference between state and props?', 'State is mutable, props are immutable.'),
(3, 2, 'What is server-side rendering in Next.js?', 'Rendering pages on the server for each request.'),
(4, 2, 'How do you create an API route in Next.js?', 'Create a file in the pages/api directory.');

-- Insert into StudentSubmissions
INSERT INTO StudentSubmissions (KnowledgeCheckID, StudentID, SubmissionAnswer, Grade) VALUES
(1, 1, 'JSX is a syntax for React.', 90.00),
(2, 1, 'State changes, props don’t.', 85.00),
(3, 2, 'Server-side rendering is rendering on the server.', NULL),
(4, 2, 'API routes are in pages/api folder.', 95.00);

-- View the dummy data in the table
SELECT * FROM Users;
SELECT * FROM Modules;
SELECT * FROM content;
SELECT * FROM KnowledgeChecks;
SELECT * FROM StudentSubmissions;
