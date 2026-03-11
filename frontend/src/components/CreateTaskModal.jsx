import { useState } from "react";
import { createTask } from "../api/api";
import "./Modal.css";

function CreateTaskModal({ onClose, onCreated }) {
  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState("easy");
  const [subtasks, setSubtasks] = useState([""]);
  const [theme, setTheme] = useState("studies");

  const addSubtask = () => setSubtasks([...subtasks, ""]);

  const updateSubtask = (index, value) => {
    const updated = [...subtasks];
    updated[index] = value;
    setSubtasks(updated);
  };

  const handleSubmit = async () => {
    const payload = {
      task_title: title,
      task_difficulty: difficulty,
      xp_reward: 25,
      task_theme: theme,
      subtasks: subtasks
        .filter((s) => s.trim() !== "")
        .map((s) => ({ description: s })),
    };
    try {
      await createTask(payload);
      onCreated();
    } catch (err) {
      console.error(err);
      alert("Failed to create task");
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3>Create Task</h3>
        </div>

        <div className="modal-body">
          <label className="modal-label">Title</label>
          <input
            className="modal-input"
            placeholder="Task Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />


          <label className="modal-label">Difficulty</label>
          <select className="modal-select" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
            <option value="easy">Easy ⭐</option>
            <option value="medium">Medium ⭐⭐</option>
            <option value="hard">Hard ⭐⭐⭐</option>
          </select>

          <label className="modal-label">Category</label>
          <select className="modal-select" value={theme} onChange={(e) => setTheme(e.target.value)}>
            <option value="studies">Studies</option>
            <option value="exercise">Exercise</option>
            <option value="sleep">Sleep</option>
            <option value="nutrition">Nutrition</option>
          </select>

          <label className="modal-label">Sub-tasks</label>
          <div className="subtask-list">
            {subtasks.map((sub, index) => (
              <div key={index} className="subtask-input-row">
                <span className="subtask-drag-icon">≡</span>
                <input
                  placeholder="Subtask description"
                  value={sub}
                  onChange={(e) => updateSubtask(index, e.target.value)}
                />
              </div>
            ))}
          </div>
          <button className="add-subtask-btn" onClick={addSubtask}>
            + Add Element
          </button>
        </div>

        <div className="modal-footer">
          <button className="modal-cancel-btn" onClick={onClose}>Cancel</button>
          <button className="modal-save-btn" onClick={handleSubmit}>Save</button>
        </div>
      </div>
    </div>
  );
}

export default CreateTaskModal;