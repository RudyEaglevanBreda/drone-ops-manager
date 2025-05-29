-- Database Schema for Drone Operations Manager

-- Users Table for Authentication
CREATE TABLE Users (
    UserID SERIAL PRIMARY KEY,
    Username VARCHAR(50) UNIQUE NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    PasswordHash VARCHAR(255) NOT NULL,
    FirstName VARCHAR(50),
    LastName VARCHAR(50),
    Role VARCHAR(20) NOT NULL DEFAULT 'user', -- 'admin', 'user', 'pilot', etc.
    CreatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    LastLogin TIMESTAMP
);

-- Projects Table
CREATE TABLE Projects (
    ProjectID VARCHAR(50) PRIMARY KEY, -- Auto-generated unique text
    ProjectName VARCHAR(100) NOT NULL,
    ClientName VARCHAR(100) NOT NULL,
    ProjectDescription TEXT,
    ProjectStatus VARCHAR(50) NOT NULL DEFAULT 'Planning', -- 'Planning', 'Discovery/Meeting', 'Proposal/Contract Drafting', 'Proposal/Contract Sent', 'Client Agreement Pending', 'Project Approved', 'Active - Ongoing', 'Project Review', 'Archiving', 'Completed', 'On Hold', 'Lost', 'Cancelled'
    MeetingNotes TEXT, -- Required to progress from 'Discovery/Meeting' to 'Proposal/Contract Drafting'
    ContractDocumentPDF_Path TEXT,
    ProjectBoundaryKML_Path TEXT,
    ProjectFolderID_Drive TEXT,
    ProjectFolderName_Drive TEXT,
    CreatedBy INTEGER REFERENCES Users(UserID),
    CreationDate TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    LastModified TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Zones Table (Child of Projects, one-to-many)
CREATE TABLE Zones (
    ZoneID SERIAL PRIMARY KEY,
    ProjectID VARCHAR(50) REFERENCES Projects(ProjectID) ON DELETE CASCADE,
    ZoneName VARCHAR(100) NOT NULL,
    ZoneReferenceKML_Path TEXT,
    IsActive BOOLEAN DEFAULT TRUE,
    CreatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Work Orders Table (Child of Projects, linked to one Zone)
CREATE TABLE WorkOrders (
    WorkOrderID SERIAL PRIMARY KEY,
    ProjectID VARCHAR(50) REFERENCES Projects(ProjectID) ON DELETE CASCADE,
    ZoneID INTEGER REFERENCES Zones(ZoneID),
    WorkOrderName VARCHAR(100) NOT NULL,
    ScheduledDate DATE,
    ServicesRequestedWO TEXT[], -- Array of services like 'High-Res Photos', 'Video Footage', etc.
    OperationalKML_WO_Path TEXT,
    WorkOrderStatus VARCHAR(30) NOT NULL DEFAULT 'Planning', -- 'Planning', 'Quoting', 'Quote Sent', 'Client Approved', 'Client Rejected', 'Scheduled', 'Fieldwork In Progress', 'Fieldwork Complete', 'Data Processing', 'Internal QA/Review', 'Ready for Delivery', 'Data Delivered', 'Invoicing', 'Invoice Sent', 'Payment Pending', 'Paid', 'Completed', 'On Hold', 'Cancelled'
    QuoteAmountWO DECIMAL(10, 2),
    QuotePDF_Path_WO TEXT,
    QuoteStatusWO VARCHAR(20), -- 'Draft', 'Sent', 'Accepted', 'Rejected'
    InvoiceAmountWO DECIMAL(10, 2),
    InvoicePDF_Path_WO TEXT,
    InvoiceStatusWO VARCHAR(20), -- 'Draft', 'Sent', 'Paid', 'Overdue'
    WorkOrderFolderID_Drive TEXT,
    WorkOrderFolderName_Drive TEXT,
    CreatedBy INTEGER REFERENCES Users(UserID),
    CreatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Flights Table (Child of Work Orders, one-to-many)
CREATE TABLE Flights (
    FlightID SERIAL PRIMARY KEY,
    WorkOrderID INTEGER REFERENCES WorkOrders(WorkOrderID) ON DELETE CASCADE,
    FlightDate DATE NOT NULL,
    PilotName VARCHAR(100),
    PilotID INTEGER REFERENCES Users(UserID),
    DroneUsed VARCHAR(100),
    BatteryCount INTEGER,
    EstimatedFlightTime VARCHAR(50), -- or TIME type
    ActualFlightTime VARCHAR(50), -- or TIME type
    MappedAreaSQM DECIMAL(10, 2),
    TotalDistanceFlownM DECIMAL(10, 2),
    RawDataLink_Path TEXT,
    ProcessedDataLink_Path TEXT,
    FlightStatus VARCHAR(20) NOT NULL, -- 'Planned', 'Completed', 'Cancelled'
    FlightNotes TEXT,
    CreatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Services Lookup Table (for ServicesRequestedWO)
CREATE TABLE Services (
    ServiceID SERIAL PRIMARY KEY,
    ServiceName VARCHAR(100) NOT NULL UNIQUE,
    Description TEXT,
    IsActive BOOLEAN DEFAULT TRUE
);

-- Initial Services Data
INSERT INTO Services (ServiceName, Description, IsActive) VALUES
('High-Res Photos', 'High resolution aerial photography', TRUE),
('Video Footage', 'Aerial video recording', TRUE),
('Orthomosaic Map', 'Detailed orthomosaic mapping', TRUE),
('3D Model', 'Three-dimensional terrain modeling', TRUE),
('Thermal Imaging', 'Thermal imaging survey', TRUE),
('LiDAR Scan', 'Light Detection and Ranging scanning', TRUE),
('Site Inspection', 'General site inspection and documentation', TRUE);

-- Create index for common query patterns
CREATE INDEX idx_projects_status ON Projects(ProjectStatus);
CREATE INDEX idx_workorders_project ON WorkOrders(ProjectID);
CREATE INDEX idx_workorders_status ON WorkOrders(WorkOrderStatus);
CREATE INDEX idx_flights_workorder ON Flights(WorkOrderID);
CREATE INDEX idx_zones_project ON Zones(ProjectID);
