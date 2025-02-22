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
            const tasks = await taskCollection.find({ userEmail: email }).toArray();
            res.json(tasks);
        });

        // Add a New Task
        app.post("/tasks", async (req, res) => {
            const task = req.body;
            if (!task.userEmail) {
                return res.status(400).json({ message: "User email is required" });
            }
            const result = await taskCollection.insertOne(task);
            res.status(201).json(result);
        });

        // Update Task
        app.patch("/tasks/:id", async (req, res) => {
            const taskId = req.params.id;
            const updatedTask = req.body;
            const result = await taskCollection.updateOne(
                { _id: new ObjectId(taskId) },
                { $set: updatedTask }
            );
            res.json(result);
        });

        // Delete Task
        app.delete("/tasks/:id", async (req, res) => {
            const taskId = req.params.id;
            const result = await taskCollection.deleteOne({ _id: new ObjectId(taskId) });
            res.json(result);
        });

    } catch (error) {
        console.error("Error:", error);
    }
}
run().catch(console.dir);

app.get('/', (req, res) => res.send("TaskMaster Backend Running..."));
app.listen(port, () => console.log('Server running on port:', port));
