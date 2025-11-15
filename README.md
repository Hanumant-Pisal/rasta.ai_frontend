Team Task Manager – Frontend


Tech Stack

      Core

React 18 – UI library

Redux Toolkit – State management

Redux Persist – State persistence

React Router DOM – Client-side routing

       UI & Styling

TailwindCSS – Utility-first CSS framework

Lucide React – Icon library

@hello-pangea/dnd – Drag-and-drop for Kanban board

React Toastify – Toast notifications

Chakra UI – Component library

       Utilities

Axios – HTTP client

date-fns – Date formatting and manipulation

class-variance-authority – CSS variant management

clsx & tailwind-merge – Class name utilities

       Development

Vite – Build tool and dev server

ESLint – Code linting




Setup Instructions


   
   git clone <https://github.com/Hanumant-Pisal/rasta.ai_frontend>
   cd Rasta.ai/frontend

 npm install
 npm run dev
  

 Features

Authentication

 User login and signup
 JWT token-based authentication
 Persistent sessions with Redux Persist

Project Management**
Create, edit, and delete projects
Add team members to projects
Project cards with member and task counts
Project ownership and member roles

Task Management**
Create, edit, and delete tasks
Drag-and-drop Kanban board (To Do, In Progress, Done)
Task assignment to team members
Due date tracking with overdue indicators
Priority levels (High, Medium, Low)
Task descriptions and status updates

Comments System**
Add comments to tasks
Edit and delete own comments
Real-time comment count on task cards
Timestamp with "edited" indicator

Team Management**
View all team members
Add members to projects
Member roles and permissions

Analytics**
Project and task statistics
Team performance metrics



 API Integration

The frontend connects to the backend API at `http://localhost:5000/api`

Endpoints Used:**
- `/auth` - Authentication (login, signup)
- `/projects` - Project CRUD operations
- `/tasks` - Task CRUD operations
- `/users` - User management
- `/comments` - Comment CRUD operations

---


Environment Variables

No environment variables required. API URL is hardcoded to `http://localhost:5000/api`.

For production, update API URLs in:
- `src/redux/authSlice.js`
- `src/redux/projectSlice.js`
- `src/redux/taskSlice.js`
- `src/redux/teamSlice.js`
- `src/components/TaskComments.jsx`



 Author :- Hanumant Pisal


