# XpenseMate - Personal Finance Management System

<p align="center">
  <img src="https://img.shields.io/badge/React-18.2.0-blue?logo=react" alt="React">
  <img src="https://img.shields.io/badge/Node.js-18.x-green?logo=node.js" alt="Node.js">
  <img src="https://img.shields.io/badge/Express-4.18.2-black?logo=express" alt="Express">
  <img src="https://img.shields.io/badge/MongoDB-7.0.3-green?logo=mongodb" alt="MongoDB">
  <img src="https://img.shields.io/badge/License-MIT-blue" alt="License">
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original.svg" width="40" height="40" alt="React" />
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/nodejs/nodejs-original.svg" width="40" height="40" alt="Node.js" />
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/express/express-original.svg" width="40" height="40" alt="Express" />
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/mongodb/mongodb-original.svg" width="40" height="40" alt="MongoDB" />
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/tailwindcss/tailwindcss-original.svg" width="40" height="40" alt="Tailwind CSS" />
</p>

## 📋 Table of Contents
- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Screenshots](#screenshots)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

**XpenseMate** is a comprehensive personal finance management application designed to help users track expenses, set budget goals, and gain insights into their spending habits. Built with modern web technologies, XpenseMate offers a seamless and intuitive user experience with real-time analytics and data visualization.

Whether you're an individual looking to manage personal finances or a small business owner tracking expenses, XpenseMate provides the tools needed to achieve financial wellness.

## ✨ Key Features

### 💰 Expense Tracking
- Record and categorize expenses with detailed information
- Attach receipts and supporting documents
- Set recurring expenses for regular payments
- Location-based expense tracking

### 🎯 Budget Goals Management
- Create and manage budget goals for different categories
- Real-time progress tracking with visual indicators
- Automatic expense categorization against goals
- Priority-based goal management

### 📊 Analytics & Insights
- Interactive dashboards with spending patterns
- Category-wise expense breakdown
- Weekly and monthly spending summaries
- Food analytics and payment method insights

### 🔐 Authentication & Security
- Secure user registration and login
- Google OAuth integration
- JWT-based authentication
- Password reset functionality
- Email verification

### 📱 Responsive Design
- Mobile-first responsive UI
- Cross-device compatibility
- Intuitive navigation and user experience
- Dark mode support

### 🛠 Additional Features
- Multi-currency support
- Export data functionality
- Support ticket system
- Audit logging
- News subscription

## 🚀 Technology Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | Core UI library |
| **React Router** | Client-side routing |
| **Tailwind CSS** | Utility-first styling |
| **Framer Motion** | Smooth animations |
| **Recharts** | Data visualization |
| **React Query** | Server state management |
| **i18next** | Internationalization |
| **Axios** | HTTP client |

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime environment |
| **Express.js** | Web framework |
| **MongoDB** | Primary database |
| **Mongoose** | ODM for MongoDB |
| **JWT** | Authentication tokens |
| **Bcrypt.js** | Password hashing |
| **Nodemailer** | Email service |
| **Cloudinary** | Media storage |

### DevOps & Tools
| Tool | Purpose |
|------|---------|
| **Git** | Version control |
| **Nodemon** | Development server |
| **ESLint** | Code linting |
| **Prettier** | Code formatting |

## 🏗️ Architecture

XpenseMate follows a modern three-tier architecture pattern:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (React)       │◄──►│   (Node/Express)│◄──►│   (MongoDB)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Frontend Architecture
- **Component-based structure** with reusable UI elements
- **Context API** for state management
- **Protected routes** for authentication
- **Service layer** for API communication
- **Responsive design** with Tailwind CSS

### Backend Architecture
- **MVC pattern** with controllers, services, and models
- **RESTful API** design
- **Middleware** for authentication and validation
- **Error handling** with centralized logging
- **Database abstraction** with Mongoose ODM

## 📸 Screenshots

### Dashboard Overview
![Dashboard](https://placehold.co/800x500/2563eb/white?text=Dashboard+Overview)

### Expense Tracking
![Expenses](https://placehold.co/800x500/10b981/white?text=Expense+Tracking)

### Budget Goals
![Budget Goals](https://placehold.co/800x500/f59e0b/white?text=Budget+Goals)

### Analytics
![Analytics](https://placehold.co/800x500/8b5cf6/white?text=Analytics+Dashboard)

## 🛠 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/your-username/xpensemate.git
cd xpensemate
```

2. **Install backend dependencies:**
```bash
cd backend
npm install
```

3. **Install frontend dependencies:**
```bash
cd ../frontend
npm install
```

4. **Environment Setup:**
Create `.env` files in both `backend` and `frontend` directories:

**Backend (.env):**
```env
PORT=5001
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
FRONTEND_URL=http://localhost:3000
```

**Frontend (.env):**
```env
REACT_APP_BACKEND_URL=http://localhost:5001/api/v1
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
```

5. **Run the applications:**

**Start backend server:**
```bash
cd backend
npm run dev
```

**Start frontend development server:**
```bash
cd frontend
npm start
```

6. **Access the application:**
Open your browser and navigate to `http://localhost:3000`

## 📡 API Documentation

### Authentication Endpoints
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/google` - Google OAuth login
- `POST /api/v1/auth/forgot-password` - Password reset request
- `POST /api/v1/auth/reset-password/:token` - Reset password

### Expense Endpoints
- `GET /api/v1/expenses` - Get all expenses
- `POST /api/v1/expenses/create-expense` - Create new expense
- `PUT /api/v1/expenses/:id` - Update expense
- `DELETE /api/v1/expenses/:id` - Delete expense

### Budget Goal Endpoints
- `GET /api/v1/budget-goals` - Get all budget goals
- `POST /api/v1/budget-goals/create-budget-goal` - Create new budget goal
- `PUT /api/v1/budget-goals/:id` - Update budget goal
- `DELETE /api/v1/budget-goals/:id` - Delete budget goal

### Dashboard Endpoints
- `GET /api/v1/dashboard/analytics` - Get dashboard analytics
- `GET /api/v1/dashboard/budget-goals` - Get budget goals for dashboard
- `GET /api/v1/dashboard/budget-goals/stats` - Get budget goals statistics

## 📁 Project Structure

```
xpensemate/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── middleware/      # Custom middleware
│   │   ├── utils/           # Utility functions
│   │   └── configs/         # Configuration files
│   ├── package.json
│   └── index.js             # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── contexts/        # React contexts
│   │   ├── services/        # API service layer
│   │   ├── locales/         # Internationalization files
│   │   └── assets/          # Static assets
│   ├── package.json
│   └── App.js               # Main app component
├── .gitignore
└── README.md
```

## 🤝 Contributing

We welcome contributions to XpenseMate! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please ensure your code follows our coding standards and includes appropriate tests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, email support@xpensemate.com or create an issue in the repository.

---

<p align="center">
  Built with ❤️ for financial wellness
</p>