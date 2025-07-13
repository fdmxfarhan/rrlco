# 🚀 Express.js Web Application

A modern web application built with Express.js and MongoDB.

## ✨ Features

- 🔐 Secure authentication system
- 📱 Responsive design for all devices
- 🔄 Real-time data updates
- 📊 Interactive dashboard
- 🔍 Advanced search functionality
- 📈 Data visualization
- 📤 File upload capabilities
- 🔔 Notification system

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js
- MongoDB
- Visual Studio Code (recommended IDE) - [Download here](https://code.visualstudio.com/download)

## 🛠️ Installation

### Windows/MacOS Installation
1. **Node.js**
   - Download and install from [nodejs.org](https://nodejs.org/en/download/)

2. **MongoDB Compass**
   - Download and install from [MongoDB Compass](https://www.mongodb.com/products/compass)

### Linux Installation
1. **Node.js Installation**
   ```bash
   curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
   sudo apt install nodejs
   ```

2. **DNS Configuration**
   ```bash
   # Check DNS
   sudo systemd-resolve --status

   # Set DNS
   sudo resolvectl dns ens160 185.51.200.2 178.22.122.100

   # Restart service
   sudo systemctl restart systemd-resolved
   ```

3. **MongoDB Installation**
   ```bash
   sudo apt-get install gnupg
   wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -
   echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list
   sudo apt-get update
   sudo apt-get install -y mongodb-org
   sudo apt-get install -y mongodb
   ```

## 📥 Project Setup

### Option 1: Using Git
```bash
cd ~
git clone https://github.com/fdmxfarhan/cafco.git
cd cafco
npm i
```

### Option 2: Manual Download
- Download the project directly from [GitHub](https://github.com/fdmxfarhan/cafco/archive/refs/heads/main.zip)
- Extract the files
- Open terminal in the project directory
- Run `npm i`

## 🔧 Environment Setup

Create a `.env` file in the root directory with the following variables:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/your_database
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

## 🚀 Running the Server

1. Open terminal in the project directory
2. Run the following command:
   ```bash
   node index.js
   ```
3. The server will start and you should see two logs:
   - Server running confirmation
   - Database connection status
4. Access the application at: [http://localhost:3000](http://localhost:3000)

> 💡 **Tip**: To stop the server, press `Ctrl + C` in the terminal

## 📚 API Documentation

### Authentication Endpoints

```http
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET /api/auth/me
```

### User Management

```http
GET /api/users
GET /api/users/:id
PUT /api/users/:id
DELETE /api/users/:id
```

### Data Endpoints

```http
GET /api/data
POST /api/data
PUT /api/data/:id
DELETE /api/data/:id
```

## 🧪 Testing

Run the test suite:

```bash
npm test
```

For development with hot-reload:

```bash
npm run dev
```

## 📁 Project Structure

```
project/
├── views/          # Jade template files
├── routes/         # Route handlers
├── public/         # Static assets (images, CSS, JS)
├── config/         # Configuration files
├── models/         # Database models and schemas
├── node_modules/   # Dependencies
└── ssl/           # SSL certificates
```

### Directory Details

- **views/** - Contains view files written in Jade template engine
- **routes/** - Contains routing logic for different endpoints
- **public/** - Static files including images, fonts, CSS, and JavaScript
- **config/** - Special utility functions (date conversion, SMS verification, etc.)
- **models/** - MongoDB models and schemas ([Learn more about data modeling](https://docs.mongodb.com/manual/data-modeling/))
- **node_modules/** - Node.js dependencies (do not modify)
- **ssl/** - SSL certificates and private keys

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style

- Use ESLint for code linting
- Follow the existing code style
- Write meaningful commit messages
- Add comments for complex logic

## 🐛 Debugging

Common issues and solutions:

1. **Database Connection Issues**
   - Check if MongoDB is running
   - Verify connection string in `.env`
   - Ensure network connectivity

2. **Port Already in Use**
   - Check if another process is using port 3000
   - Change port in `.env` file
   - Kill the process using the port

3. **Module Not Found**
   - Run `npm install`
   - Clear `node_modules` and reinstall
   - Check package.json for dependencies

## 📝 License

This project is licensed under the MIT License.

## 📞 Support

For support, email support@example.com or create an issue in the repository.

## 🙏 Acknowledgments

- Express.js team
- MongoDB team
- All contributors
