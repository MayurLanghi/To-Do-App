import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

app.use(cors());
app.use(express.json());

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Database Connected");
    } catch (err) {
        console.log(err.message);
        process.exit(1);
    }
};

const todoSchema = new mongoose.Schema({
    text: { type: String, required: true },
    completed: { type: Boolean, default: false }
}, { timestamps: true });

const Todo = mongoose.model("Todo", todoSchema);

app.get('/api/todos', async (req, res) => {
    try {
        const todos = await Todo.find();
        res.status(200).json(todos);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/todos', async (req, res) => {
    try {
        const todo = new Todo({ text: req.body.text });
        const savedTodo = await todo.save();
        res.status(201).json(savedTodo);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.patch('/api/todos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { text, completed } = req.body;
        const todo = await Todo.findById(id);

        if (!todo) return res.status(404).json({ msg: "Not Found" });

        if (text !== undefined) todo.text = text;
        if (completed !== undefined) todo.completed = completed;

        const updated = await todo.save();
        res.status(200).json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.delete('/api/todos/:id', async (req, res) => {
    try {
        const deleted = await Todo.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ msg: "Not Found" });
        res.status(200).json({ msg: "Deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "/Frontend/dist")));
    app.get("(.*)", (req, res) => {
        res.sendFile(path.resolve(__dirname, "Frontend", "dist", "index.html"));
    });
}

app.listen(PORT, () => {
    connectDB();
    console.log(`Live on ${PORT}`);
});