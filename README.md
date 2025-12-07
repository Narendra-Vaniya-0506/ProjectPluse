# ProjectPulse by Code Yatra

A comprehensive project management application built with React and Node.js, designed to streamline team collaboration, task management, and project tracking for organizations of all sizes.

## 🚀 Features

### Role-Based Access Control
- **Admin**: Full system access - create users, manage projects, oversee all operations
- **Project Manager**: Create and manage projects, assign tasks, monitor progress
- **Team Member**: View assigned projects, update task status, participate in chats

### Core Functionality
- **User Management**: Create and manage users with different roles
- **Project Creation**: Set up projects with team members and task cards
- **Task Management**: Create, assign, and track tasks with deadlines
- **Real-time Collaboration**: Group and individual chat within projects
- **Progress Tracking**: Visual progress indicators and completion percentages
- **Deadline Management**: Automatic task locking and countdown timers
- **Live Updates**: Real-time synchronization across all users

## 🏗️ Architecture

### Frontend (React + Vite)
- **Framework**: React 18 with Vite for fast development
- **State Management**: Redux Toolkit for global state
- **Routing**: React Router for navigation
- **Real-time Communication**: Socket.io client for live updates
- **Styling**: CSS modules and responsive design
- **Authentication**: JWT-based auth with protected routes

### Backend (Node.js + Express)
- **Runtime**: Node.js with Express.js framework
- **Database**: MongoDB with Mongoose ODM
- **Real-time**: Socket.io for WebSocket communication
- **Security**: Encryption for sensitive chat messages
- **Authentication**: Session-based auth with role validation

## 📁 Project Structure

```
projectpulse/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── ProtectedRoute.jsx          # Route protection based on user roles
│   │   ├── pages/
│   │   │   ├── Home.jsx                    # Landing page with features overview
│   │   │   ├── Login.jsx                   # User authentication page
│   │   │   ├── SignIn.jsx                  # User registration page
│   │   │   ├── ChooseYourRole.jsx          # Role selection interface
│   │   │   ├── AdminDashboard.jsx          # Admin control panel
│   │   │   ├── ProjectManagerDashboard.jsx # PM project management
│   │   │   ├── TeamMemberDashboard.jsx     # Team member project view
│   │   │   ├── ChatWindow.jsx              # Real-time messaging interface
│   │   │   ├── Cards.jsx                   # Task management with deadlines
│   │   │   └── Developer.jsx               # Developer information page
│   │   ├── store/
│   │   │   ├── index.js                    # Redux store configuration
│   │   │   └── slices/
│   │   │       └── authSlice.js            # Authentication state management
│   │   ├── utils/
│   │   │   └── api.js                      # API communication utilities
│   │   └── assets/                         # Static assets and images
│   ├── public/
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── index.js                            # Main server file with all API endpoints
│   ├── package.json
│   └── admin_credentials.txt               # Admin authentication details
└── README.md
```

## 🔄 How It Works

### User Flow
1. **Landing Page**: Users visit the home page and choose their role
2. **Authentication**: Login with email/password based on role
3. **Dashboard Access**: Redirected to role-specific dashboard
4. **Project Interaction**: View projects, access chat, manage tasks

### Page Connections & Logic

#### Public Pages
- **`/` (Home.jsx)**: Marketing page with slideshow, features, and "Get Started" button
  - Logic: Auto-slideshow of product images, smooth scroll to sections
  - Connects to: `/choose-role`

- **`/choose-role` (ChooseYourRole.jsx)**: Role selection interface
  - Logic: Visual role cards (Admin, Project Manager, Team Member)
  - Connects to: `/login`

- **`/login` (Login.jsx)**: Authentication form
  - Logic: Email/password validation, role-based redirect
  - Connects to: Role-specific dashboards

#### Protected Pages

- **`/admin` (AdminDashboard.jsx)**: Admin control center
  - **Logic**: 
    - Create users (PMs and Team Members)
    - Create projects with team assignment
    - View all users and projects with pagination
    - Real-time updates via Socket.io
  - **Functions**:
    - `handleCreateUser()`: User creation with role validation
    - `handleCreateProject()`: Project setup with card auto-creation
    - `fetchProjects()` & `fetchUsers()`: Data fetching with pagination
  - **Connects to**: `/chat/:projectId` for project access

- **`/pm-dashboard` (ProjectManagerDashboard.jsx)**: PM workspace
  - **Logic**:
    - View projects created by PM
    - Create/manage team members
    - Monitor project progress
    - Access project chat and cards
  - **Functions**:
    - Project listing with progress percentages
    - User management within PM scope
    - Navigation to project-specific pages

- **`/dashboard` (TeamMemberDashboard.jsx)**: Team member interface
  - **Logic**:
    - Display assigned projects only
    - Show project progress and status
    - Access to chat and task updates
  - **Functions**:
    - Filtered project display
    - Task status updates
    - Real-time notifications

- **`/chat/:projectId` (ChatWindow.jsx)**: Real-time messaging
  - **Logic**:
    - Group chat for all project participants
    - Individual encrypted chats between users
    - Message status tracking (sent/delivered/read)
    - Message editing and deletion
  - **Functions**:
    - `sendMessage()`: Send with encryption for private chats
    - `joinProject()`: Socket.io room joining
    - Message status updates and real-time delivery

- **`/cards/:projectId` (Cards.jsx)**: Task management system
  - **Logic**:
    - Visual task cards with work lists
    - Deadline countdown with auto-locking
    - Progress percentage calculation
    - Real-time collaboration on tasks
  - **Functions**:
    - `handleToggleTask()`: Task completion with permission checks
    - `calculateRemainingTime()`: Deadline timer logic
    - `handleCreateCard()` & `handleUpdateCard()`: CRUD operations
    - Automatic project status updates based on completion

#### Utility Components
- **`ProtectedRoute.jsx`**: Route guard component
  - Logic: Checks user authentication and role permissions
  - Redirects unauthorized users

- **`authSlice.js`**: Redux state management
  - Logic: Authentication state, login/logout actions
  - Local storage persistence

- **`api.js`**: API communication layer
  - Logic: Centralized HTTP requests to backend
  - Error handling and response processing

### Backend Logic Breakdown

#### Authentication System (`/api/login`)
- Validates admin credentials (hardcoded for narendra@gmail.com)
- Checks global users collection for PMs
- Searches PM-specific user collections for team members
- Returns user object with role information

#### User Management
- **Admin User Creation** (`/api/create-user`): Creates PMs and Team Members globally
- **PM User Creation** (`/api/pm/create-user`): Creates Team Members under specific PM
- Dynamic collection naming: `pm_users_{pmEmail}`

#### Project Management
- **Project Creation** (`/api/create-project`): 
  - Stores in PM-specific collections (`pm_projects_{pmEmail}`)
  - Auto-creates specified number of empty cards
  - Assigns team members and metadata

- **Project Retrieval**:
  - Admin: Accesses all project collections
  - PM: Accesses own projects with progress calculation
  - Team Member: Filters projects by team membership

#### Chat System
- **Message Encryption**: Individual chats use AES-256-CBC encryption
- **Chat Types**: group, individual, admin, pm
- **Real-time Delivery**: Socket.io rooms per project
- **Message Management**: Edit, delete with sender verification

#### Task Management (Cards API)
- **Card CRUD**: Create, read, update, delete operations
- **Progress Tracking**: Automatic percentage calculation from task completion
- **Deadline Enforcement**: Cards lock when end date passes
- **Real-time Sync**: Socket.io events for live updates
- **Project Status Updates**: Automatic status changes based on completion

#### Real-time Features (Socket.io)
- **Project Rooms**: Users join project-specific rooms
- **Event Types**: cardCreated, cardUpdated, cardDeleted, projectStatusUpdated
- **Live Synchronization**: Instant updates across all connected clients

## 🛠️ Technology Stack

### Frontend
- React 18
- Vite
- Redux Toolkit
- React Router DOM
- Socket.io-client
- CSS3

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- Socket.io
- Crypto (for encryption)
- CORS
- dotenv

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd projectpulse
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   # Create .env file with MongoDB URI
   echo "MONGO_URI=mongodb://localhost:27017/projectpulse" > .env
   echo "PORT=5000" >> .env
   npm start
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

4. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

### Default Admin Credentials
- Email: narendra@gmail.com
- Password: 12345678

## 📊 Database Schema

### Collections
- `users`: Global users (PMs created by Admin)
- `pm_projects_{email}`: Projects per Project Manager
- `pm_users_{email}`: Users created by specific PM
- `admin_projects`: Projects created by Admin
- `cards`: Task cards for all projects
- `chatmessages`: All chat messages

### Key Models
- **User**: username, password, role, name, createdBy
- **Project**: name, description, createdBy, teamMembers, status, percentage
- **Card**: projectId, nameOfWork, teamMember, dates, workList, percentage
- **ChatMessage**: projectId, chatType, participants, sender, message, status

## 🔐 Security Features

- Role-based access control
- Encrypted individual chat messages
- Protected API endpoints
- Session-based authentication
- Input validation and sanitization

## 🎯 Use Cases

- **Corporate Teams**: Large organizations managing multiple projects
- **IT Departments**: Software development teams with agile workflows
- **Educational Institutions**: Student project coordination
- **Consulting Firms**: Client project management and delivery
- **Small Businesses**: Team task coordination and progress tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📞 Support

For support or questions:
- Email: codeyatra0605@gmail.com
- Website: https://code-yatra-pi.vercel.app/


---

Built with ❤️ by Code Yatra
