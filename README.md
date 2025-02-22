## TaskMaster : Task Management App's Backend

TaskMaster backend is a RESTful API built with Node.js and Express.js, using MongoDB for data storage.

## 🌍 Live API
- [Vercel Deployment](https://taskmaster-backend-mocha.vercel.app/)

## 📌 Features
- Store tasks for each user in MongoDB
- CRUD operations on tasks
- Secure user authentication
- Real-time updates with MongoDB

## 🛠️ Technologies Used
- Node.js
- Express.js
- MongoDB (Mongoose)
- Firebase Authentication
- Cors, Dotenv, Axios

## 🏰 Installation
1. Clone the repository:
   ```sh
   git clone https://github.com/your-repo/taskmaster-backend.git
   cd taskmaster-backend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Create a `.env` file and add:
   ```env
   MONGO_URI=your_mongo_connection_string
   PORT=5000
   ```
4. Start the server:
   ```sh
   npm start
   ```

## 🔗 API Endpoints
| Method | Endpoint           | Description                |
|--------|-------------------|----------------------------|
| **GET**  | `/tasks/:email`  | Get user tasks by email    |
| **POST** | `/tasks`         | Add new task               |
| **PUT**  | `/tasks/update`  | Update task category       |
| **DELETE** | `/tasks/:email/:taskId` | Delete a task |

## 🤝 Contributing
Pull requests are welcome! Feel free to fork and enhance the project.