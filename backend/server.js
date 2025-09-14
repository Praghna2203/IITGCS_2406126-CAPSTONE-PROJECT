const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("❌ MongoDB error:", err));

// =======================
// 📌 MODELS
// =======================

// --- Transactions ---
const TransactionSchema = new mongoose.Schema({
  description: String,  // matches frontend
  amount: Number,
  type: { type: String, enum: ['income', 'expense'] },
  category: String,
  date: String, // frontend sends yyyy-mm-dd
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group", default: null }
}, { timestamps: true });

TransactionSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id;     // 👈 map _id to id for frontend
    delete ret._id;
    delete ret.__v;
  }
});
const Transaction = mongoose.model("Transaction", TransactionSchema, "transactions");

// --- Budgets ---
const BudgetSchema = new mongoose.Schema({
  category: String,
  limit: Number,
  spent: { type: Number, default: 0 }
}, { timestamps: true });

BudgetSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});
const Budget = mongoose.model("Budget", BudgetSchema, "budgets");

// --- Groups ---
const GroupSchema = new mongoose.Schema({
  name: String,
  members: [String],
  transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Transaction" }]
}, { timestamps: true });

GroupSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});
const Group = mongoose.model("Group", GroupSchema, "groups");

// =======================
// 📌 ROUTES
// =======================

// --- Transactions ---
app.get("/api/transactions", async (req, res) => {
  const txns = await Transaction.find();
  res.json(txns);
});

app.post("/api/transactions", async (req, res) => {
  const txn = new Transaction(req.body);
  await txn.save();
  res.json(txn);
});

app.put("/api/transactions/:id", async (req, res) => {
  const txn = await Transaction.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(txn);
});

app.delete("/api/transactions/:id", async (req, res) => {
  await Transaction.findByIdAndDelete(req.params.id);
  res.json({ message: "Transaction deleted" });
});

// --- Budgets ---
app.get("/api/budgets", async (req, res) => {
  const budgets = await Budget.find();
  res.json(budgets);
});

app.post("/api/budgets", async (req, res) => {
  const budget = new Budget(req.body);
  await budget.save();
  res.json(budget);
});

app.put("/api/budgets/:id", async (req, res) => {
  const budget = await Budget.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(budget);
});

app.delete("/api/budgets/:id", async (req, res) => {
  await Budget.findByIdAndDelete(req.params.id);
  res.json({ message: "Budget deleted" });
});

// --- Groups ---
app.get("/api/groups", async (req, res) => {
  const groups = await Group.find().populate("transactions");
  res.json(groups);
});

app.post("/api/groups", async (req, res) => {
  const group = new Group(req.body);
  await group.save();
  res.json(group);
});

app.put("/api/groups/:id", async (req, res) => {
  const group = await Group.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  ).populate("transactions");
  res.json(group);
});

app.delete("/api/groups/:id", async (req, res) => {
  await Group.findByIdAndDelete(req.params.id);
  res.json({ message: "Group deleted" });
});

// =======================
// 📌 START SERVER
// =======================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
