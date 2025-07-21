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
INSERT INTO Modules (ModuleID, Title) VALUES
(1, 'Introduction to React and Next.js'),
(1, 'Advanced React Patterns'),
(1, 'Next.js Performance Optimization');
(1, 'Next.js Performance Optimization');
 

-- Insert into Content
INSERT INTO Content (ModuleID, Overview, Reading) VALUES
(1, 'Software systems are now foundational to nearly every aspect of how we live, work, and connect as a society. In fact, software doesn’t just support our world, it shapes it. As our dependency on digital systems grows, so does our responsibility to ensure that these systems are designed and maintained with long-term well-being in mind.The growing scale and influence of software brings with it both extraordinary potential and significant pressure. If not built with care, digital systems can cause long-term harm socially, environmentally, economically, and even technically.This module will introduce you to the concept of sustainability in software engineering, explain why it matters, and lay the foundation for the dimensions that will be explored in later modules'),
(1, 'Sustainability, in a general sense, is the ability to meet current needs without compromising the ability of future generations to meet their own. Sustainability in software is not just about energy efficiency; it's about building systems that can adapt, endure, and remain responsible over time. It means designing software that continues to serve users and communities, whether that’s through more maintainable code, more inclusive design, or more mindful resource use.In software engineering, this means creating systems that are:● Durable: able to evolve with technological change● Responsible: considerate of social and environmental consequences● Maintainable: built in ways that support long-term usability and cost-efficiency“Sustainable software is software that meets the needs of the present without compromising the ability of future generations to meet their own needs.” Adapted from the Brundtland Report (1987).'),
(1, 'In this module, we will explore the concept of sustainability in software engineering. We will discuss its importance, the dimensions of sustainability, and how it can be applied in practice. By the end of this module, you will have a foundational understanding of sustainable software engineering and its relevance to modern software development practices.', 'Reading materials will include articles on sustainable software practices, case studies of successful sustainable software projects, and guidelines for implementing sustainability in your own projects.'),
(1, 'This module will cover the following topics:● The definition and importance of sustainability in software engineering● The dimensions of sustainability: social, environmental, economic, and technical● Practical applications of sustainable software engineering principles', 'Reading materials will include articles on sustainable software practices, case studies of successful sustainable software projects, and guidelines for implementing sustainability in your own projects.'),
(1, 'This module will introduce you to the concept of sustainability in software engineering, explain why it matters, and lay the foundation for the dimensions that will be explored in later modules.', 'Reading materials will include articles on sustainable software practices, case studies of successful sustainable software projects, and guidelines for implementing sustainability in your own projects.'),
(1, 'Sustainability is not just a buzzword; it’s a necessity in today’s digital world. As software engineers, we have a responsibility to create systems that are not only functional but also sustainable. This module will provide you with the knowledge and tools to start thinking about sustainability in your own work.', 'Reading materials will include articles on sustainable software practices, case studies of successful sustainable software projects, and guidelines for implementing sustainability in your own projects.'),
(1, 'This module will provide an overview of Next.js features such as server-side rendering (SSR), static site generation (SSG), API routes, and more.', 'Next.js is a React framework that enables developers to build fast and user-friendly web applications with features like server-side rendering (SSR) and static site generation (SSG). It simplifies routing and provides built-in support for CSS and JavaScript optimization.'),


-- Insert into KnowledgeChecks
INSERT INTO KnowledgeChecks (ContentID, ModuleID, Question, Answer) VALUES
(1, 'What is JSX in React?', 'JSX is a syntax extension for JavaScript used in React.'),
(2,'What is the difference between state and props?', 'State is mutable, props are immutable.'),
(3,'What is server-side rendering in Next.js?', 'Rendering pages on the server for each request.'),
(4,'How do you create an API route in Next.js?', 'Create a file in the pages/api directory.');

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



-- View the dummy data in the table
SELECT * FROM Users;
SELECT * FROM Modules;
SELECT * FROM Content;
SELECT * FROM KnowledgeChecks;
SELECT * FROM StudentSubmissions;
SELECT * FROM modulecontent;




