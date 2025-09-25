# This file is only for editing file nodes, do not break the structure
## Project Description
OphthalmoTech is a comprehensive medical device management platform designed for healthcare organizations to monitor, maintain, and manage ophthalmology equipment with enterprise-grade security and AI-powered insights.

## Key Features
- ✅ Secure email OTP authentication system with session management
- ✅ Full User Management system with comprehensive CRUD operations
- ✅ Database integration with users and user activities tables
- ✅ AI-powered device analysis and troubleshooting (Kimi model)
- ✅ Intelligent file upload with automated device data extraction 
- ✅ Professional email notification system with HTML templates
- ✅ Real-time user insights and activity monitoring
- ✅ Advanced role-based access control (admin, manager, technician, viewer)
- ✅ User profile management with avatar uploads
- ✅ Comprehensive audit logging and activity tracking
- ✅ Medical-grade UI with healthcare professional workflows
- ✅ **Comprehensive Permission Matrix System**
- ✅ **Granular Permission Management (89 individual permissions)**
- ✅ **Role Hierarchy with Permission Inheritance**
- ✅ **Department-based Permission Modifiers**
- ✅ **Custom User-specific Permissions**
- ✅ **Permission Guard Components for UI Access Control**
- ✅ **Interactive Permission Testing and Demo System**
- ✅ **Fixed Permission System Database Integration**
- ✅ **Automatic User Profile Creation on Login**

## Data Storage
Tables: 
- users (eymv2gl7ckxs) - Complete user profiles with roles, departments, and permissions
- user_activities (eymv2uk8wcn4) - User action audit log and activity tracking
Local: Authentication state, user preferences via Zustand persist

## Devv SDK Integration
Built-in: 
- ✅ Authentication (email OTP verification with session management)
- ✅ DevvAI (Kimi-k2-0711-preview model for device analysis and AI chat)
- ✅ File Upload (medical device document analysis with AI insights)
- ✅ Email Service (HTML templates for maintenance alerts, device notifications, reports)

External: 
- Email Service requires Resend API key for production use (code implemented, key needed)

## Special Requirements
- Medical-grade security and compliance standards
- HIPAA-ready architecture for healthcare environments
- Professional email templates for clinical communications
- AI-powered device troubleshooting and maintenance recommendations
- **Enterprise-grade permission matrix with 89 granular permissions**
- **Hierarchical role system with department-based modifiers**
- **Complete audit trail for all permission changes**
- **Real-time permission validation and access control**

/src
├── assets/          # Static resources directory
│
├── components/      # Components directory
│   ├── ui/         # Pre-installed shadcn/ui components
│
├── hooks/          # Custom Hooks directory
│   ├── use-mobile.ts # Mobile detection Hook
│   └── use-toast.ts  # Toast notification system Hook
│
├── lib/            # Utility library directory
│   └── utils.ts    # Utility functions, including cn function for merging Tailwind classes
│
├── pages/          # Page components directory (React Router structure)
│   ├── HomePage.tsx # Main application dashboard with integrated views
│   └── NotFoundPage.tsx # 404 error page
│
├── store/          # State management directory (Zustand)
│   └── auth-store.ts # Authentication state with persist
│
├── services/       # Business logic and API integrations
│   ├── ai-service.ts          # DevvAI integration for device analysis and user insights
│   ├── file-service.ts        # File upload and processing with AI analysis
│   ├── email-service.ts       # Email notifications with professional templates
│   ├── database-service.ts    # Complete database operations and user management
│   └── permission-service.ts  # Advanced permission matrix and role management system
│
├── components/     # Shared and feature components
│   ├── auth/       # Authentication and access control
│   │   ├── LoginForm.tsx      # Email OTP login interface
│   │   ├── ProtectedRoute.tsx # Route protection wrapper
│   │   └── PermissionGuard.tsx # Advanced permission-based access control
│   ├── layout/     # Application layout
│   │   ├── Header.tsx   # Main navigation header
│   │   └── Sidebar.tsx  # Navigation sidebar with permission-aware menu
│   ├── dashboard/  # Dashboard components
│   │   ├── DashboardOverview.tsx # Main dashboard with user stats
│   │   └── UserManagementDashboard.tsx # User management overview
│   ├── users/      # Complete user management system
│   │   └── UserManagement.tsx # Full CRUD operations, profiles, activities
│   ├── admin/      # Administrative components
│   │   ├── RoleManagement.tsx  # Advanced role and permission management
│   │   └── PermissionDemo.tsx  # Interactive permission system demonstration
│   ├── ai/         # AI integration components
│   │   └── AIChat.tsx   # Streaming AI assistant
│   └── file-upload/ # File management
│       └── FileUploadComponent.tsx # File upload with AI analysis
│
├── App.tsx         # Root component with React Router configuration
│                   # Add new route configurations in this file
│                   # Includes catch-all route (*) for 404 handling
│
├── main.tsx        # Entry file, renders root component and mounts to DOM
│
├── index.css       # Medical-grade design system with healthcare color palette
│                   # Professional styling optimized for clinical environments
│
└── tailwind.config.js  # Tailwind CSS v3 configuration file
