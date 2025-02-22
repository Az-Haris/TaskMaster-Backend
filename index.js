require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const uri = process.env.DB_URI;
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        const database = client.db('TaskMaster');
        const userCollection = database.collection('Users');
        const taskCollection = database.collection('Tasks');

        console.log("Connected to MongoDB!");

        // ---------------- User Related APIs ----------------

        // Save or Update User Data
        app.post('/users', async (req, res) => {
            const { email, displayName, photoURL, authMethod } = req.body;
            try {
                const existingUser = await userCollection.findOne({ email });

                if (existingUser) {
                    if (existingUser.authMethod !== authMethod) {
                        await userCollection.updateOne(
                            { email },
                            { $set: { authMethod, updatedAt: new Date(), lastLogin: new Date() } }
                        );
                    }
                    return res.status(200).json({ message: "User already exists", user: existingUser });
                }

                const newUser = { email, displayName, photoURL, authMethod, createdAt: new Date(), lastLogin: new Date() };
                const result = await userCollection.insertOne(newUser);
                res.status(201).json({ message: "User created", user: { ...newUser, _id: result.insertedId } });
            } catch (error) {
                res.status(500).json({ message: "Error saving user", error: error.message });
            }
        });

        // Login User and update login time
        app.patch("/users/:email", async (req, res) => {
            const email = req.params.email;
            try {
                const result = await userCollection.updateOne(
                    { email }, // Filter
                    { $set: { lastLogin: new Date() } } // Update using $set
                );
                if (result.matchedCount === 0) {
                    return res.status(404).json({ message: "User not found" });
                }

                const user = await userCollection.findOne({ email })
                res.status(200).json({
                    message: "User login time updated successfully",
                    result,
                    user
                });
            } catch (error) {
                res.status(500).json({ message: "Error updating user", error: error.message });
            }
        });

        // Get User's Data
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const result = await userCollection.findOne({ email });
            res.send(result);
        });




        // ---------------------- Task APIs ----------------------

        // Fetch Tasks by User Email
        app.get("/tasks/:email", async (req, res) => {
            const email = req.params.email;
            const userTasks = await taskCollection.findOne({ userEmail: email });
        
            if (!userTasks) {
                return res.status(404).json({ message: "No tasks found" });
            }
            res.send(userTasks.tasks);
        });
        



        // Add or Update Task
        app.post("/tasks", async (req, res) => {
            const { userEmail, task } = req.body;

            if (!userEmail || !task) {
                return res.status(400).json({ message: "User email and task data are required" });
            }

            const existingUserTasks = await taskCollection.findOne({ userEmail });

            if (existingUserTasks) {
                // Update: Push new task into existing array
                const result = await taskCollection.updateOne(
                    { userEmail },
                    { $push: { tasks: task } }
                );
                return res.status(200).json({ message: "Task added", result });
            } else {
                // Create new record for user
                const newTaskDocument = {
                    userEmail,
                    tasks: [task],
                };
                const result = await taskCollection.insertOne(newTaskDocument);
                return res.status(201).json({ message: "New task list created", result });
            }
        });


        // Modify tasks order
        app.put("/tasks/:email", async (req, res) => {
            const { email } = req.params;
            const { tasks } = req.body;
          
            try {
              const result = await taskCollection.updateOne(
                { userEmail: email },
                { $set: { tasks } },
                { upsert: true }
              );
              res.status(200).json({ message: "Tasks updated successfully", result });
            } catch (error) {
              res.status(500).json({ message: "Error updating tasks", error });
            }
          });

        // Update Task
        app.patch("/tasks/:email/:taskId", async (req, res) => {
            const { email, taskId } = req.params;
            const updatedTask = req.body;
        
            const result = await taskCollection.updateOne(
                { userEmail: email, "tasks.id": taskId },
                { $set: { "tasks.$": updatedTask } }
            );
        
            res.json({ message: "Task updated", result });
        });

        

        // Delete Task
        app.delete("/tasks/:email/:taskId", async (req, res) => {
            const { email, taskId } = req.params;
        
            const result = await taskCollection.updateOne(
                { userEmail: email },
                { $pull: { tasks: { id: taskId } } }
            );
        
            res.json({ message: "Task deleted", result });
        });



    } catch (error) {
        console.error("Error:", error);
    }
}
run().catch(console.dir);

app.get('/', (req, res) => res.send("TaskMaster Backend Running..."));
app.listen(port, () => console.log('Server running on port:', port));
