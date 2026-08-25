const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  taskId: { type: String, required: true, unique: true }, // e.g., 'DT-10'
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  title: { type: String, required: true, trim: true },
  category: { type: String, enum: ['Backend', 'Frontend', 'Designing', 'RND'], default: 'Backend' },
  categoryColor: { type: String, required: true },
  status: { type: String, enum: ['todo', 'in-progress', 'review', 'done'], default: 'todo' },
  dueDate: { type: String, required: true },
  assigneeInitials: { type: String, default: 'AL' },
  assigneeBg: { type: String, default: 'bg-blue-600' },
  hasCheck: { type: Boolean, default: true },
  isOverdue: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);