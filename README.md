# Drone Operations Manager

A comprehensive project management application for drone operations with relational database schema, CRUD interfaces, and user authentication.

## Core Entities

- **Projects**: Manage client projects with detailed information
- **Zones**: Define operational areas within projects
- **Work Orders**: Track specific tasks to be performed in zones
- **Flights**: Record flight details and metrics for each work order

## Features

- User Authentication
- Project Management
- Zone Management
- Work Order Processing
- Flight Recording and Tracking
- Document Management (contracts, quotes, invoices)

## Technology Stack

### Backend
- Node.js with Express
- PostgreSQL database
- JWT for authentication

### Frontend
- React
- Material UI

## Installation

### Prerequisites
- Node.js and npm
- PostgreSQL

### Setup Instructions
1. Clone the repository
2. Set up the database using the provided schema
3. Install backend dependencies: `cd backend && npm install`
4. Install frontend dependencies: `cd frontend && npm install`
5. Configure environment variables
6. Start the backend: `cd backend && npm start`
7. Start the frontend: `cd frontend && npm start`
