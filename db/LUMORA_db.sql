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

CREATE TABLE Modules(
    ModuleID INT PRIMARY KEY auto_increment,
    Heading varchar(50) NOT NULL,
    Subheading varchar(104) NOT NULL
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
("john_doe", "Password123!", "john.doe@example.com", "Student", 50.00),
("jane_smith", "Password456!", "jane.smith@example.com", "Student", 25.00),
("admin_user", "AdminPass789!", "admin@example.com", "Admin", 0.00);

-- Insert into Modules
INSERT INTO Modules (ModuleID, Heading, Subheading) VALUES
(1, "Module1:What is Sustainability", "Introduction to Sustainability in Software Engineering");

-- Insert into Content
INSERT INTO Content (ModuleID, Overview, Reading) VALUES
(1, "overview", "Software systems are now foundational to nearly every aspect of how we live, work, and connect as a society. In fact, software doesn’t just support our world, it shapes it. As our dependency on digital systems grows, so does our responsibility to ensure that these systems are designed and maintained with long-term well-being in mind.The growing scale and influence of software brings with it both extraordinary potential and significant pressure. If not built with care, digital systems can cause long-term harm socially, environmentally, economically, and even technically.This module will introduce you to the concept of sustainability in software engineering, explain why it matters, and lay the foundation for the dimensions that will be explored in later modules"),
(1, "What is Sustainability in Software Engineering?", "Sustainability, in a general sense, is the ability to meet current needs without compromising the ability of future generations to meet their own. Sustainability in software is not just about energy efficiency; it's about building systems that can adapt, endure, and remain responsible over time. It means designing software that continues to serve users and communities, whether that’s through more maintainable code, more inclusive design, or more mindful resource use.In software engineering, this means creating systems that are:● Durable: able to evolve with technological change● Responsible: considerate of social and environmental consequences● Maintainable: built in ways that support long-term usability and cost-efficiency“Sustainable software is software that meets the needs of the present without compromising the ability of future generations to meet their own needs.” Adapted from the Brundtland Report (1987)."),
(1, "Why Sustainability Matters in Software", "Software is not neutral. Every system built affects people, infrastructure, and the planet. Unsustainable software systems often lead to:● High technical debt and short software lifespan● Inequitable access to technolog● Social or algorithmic harm (e.g., bias, exclusion, privacy or safety risks)● Excessive energy consumption and environmental wasteThe more society relies on software, the more critical it becomes that we engineer systems that are resilient, ethical, and future-ready."),
(1, "Common Misconceptions", "Sustainability is just about the environment or “Green IT” "),
(1, "Correction", "In software engineering, it also includes social, technical, and economic endurance."),
(1, "Common Misconceptions", "Sustainable systems are less efficient"),
(1, "Correction", "In fact, they often increase efficiency through maintainability."),
(1, "Common Misconceptions", "Only architects or leaders should worry about this"),
(1, "Correction","Every developer, designer, and tester should contribute to sustainability decision"),
(1, "Knowledge Check", "A. Ensuring software runs as fast and efficiently as possible to meet user expectations B. Designing systems that can adapt and endure over time while minimizing negative social, environmental, technical, and economic impacts C. Reducing development costs by limiting scope and cutting unnecessary features D. Building digital systems that prioritize environmental goals above all else");



-- Insert into KnowledgeChecks
INSERT INTO KnowledgeChecks (ContentID, Question, Answer) VALUES
(10, "Which of the following best captures the meaning of sustainability in software engineering?", "B");

-- Insert into StudentSubmissions
INSERT INTO StudentSubmissions (KnowledgeCheckID, StudentID, SubmissionAnswer, Grade) VALUES
(1, 1, "JSX is a syntax for React.", 90.00),
(1, 1, "State changes, props don't.", 85.00),
(1, 2, "Server-side rendering is rendering on the server.", NULL),
(1, 2, "API routes are in pages/api folder.", 95.00);


-- Update User table for the email activation flow
ALTER TABLE Users
ADD COLUMN activationTokenExpires DATETIME,
ADD COLUMN isActivated BOOLEAN DEFAULT FALSE,
ADD COLUMN ActivationToken VARCHAR(255);



-- View the dummy data in the table
SELECT * FROM Users;
SELECT * FROM Modules;
SELECT * FROM Content;
SELECT * FROM KnowledgeChecks;
SELECT * FROM StudentSubmissions;
SELECT * FROM modulecontent;





