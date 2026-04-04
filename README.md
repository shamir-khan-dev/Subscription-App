# Subscription Management System 🚀

A production-ready Subscription Management API built with Node.js, Express, and MongoDB. It handles user authentication, subscription tracking, and automated workflows using Upstash.

## ✨ Key Features

*   **🔐 Secure Authentication:** JWT-based authentication with Bcrypt password hashing.
*   **🛡️ Robust Security:** Integrated with **Arcjet** for Rate Limiting, Bot Detection, and Shield protection.
*   **⚙️ Workflow Automation:** Leverages **Upstash** for managing subscription lifecycle events (e.g., trial expiration, renewals).
*   **📊 Subscription Management:** Create, Read, Update, and Delete subscription records.
*   **📧 Email Notifications:** Automated reminders and alerts powered by **Nodemailer**.
*   **🛠️ Modular Architecture:** Clean, scalable folder structure (Controllers, Routes, Models, Middlewares).

## 🛠️ Tech Stack

*   **Runtime:** Node.js (v20+)
*   **Framework:** Express.js
*   **Database:** MongoDB with Mongoose
*   **Security:** Arcjet
*   **Workflows:** Upstash Workflow
*   **Utilities:** Zod (Validation), Day.js (Date formatting), JSONWebToken (Auth).

## 🚀 Getting Started

### Prerequisites

*   MongoDB URI
*   Upstash Workflow Token
*   Arcjet API Key
*   SMTP Server Credentials (for Email)

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-link>
   cd Subscription-App
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file and add your credentials (follow `env.js` template in `config/`).

4. Start the server:
   ```bash
   npm run dev
   ```

## 📂 Project Structure

```text
├── config/       # Configuration (Environment, Arcjet)
├── controllers/  # Route logic
├── database/     # MongoDB connection
├── middlewares/  # Auth & Security checks
├── models/       # Database schemas
├── routes/       # API endpoints
├── utils/        # Helper functions
└── app.js        # Main entry point
```

## 📜 License

This project is licensed under the MIT License.