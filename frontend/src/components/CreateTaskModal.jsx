import { useState } from "react";
import { createTask } from "../api/api";

function CreateTaskModal({ onClose, onCreated }) {
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [difficulty, setDifficulty] = useState("Easy");
  const [subtasks, setSubtasks] = useState([""]);
  const [theme, setTheme] = useState("studies");

  const addSubtask = () => {
    setSubtasks([...subtasks, ""]);
  };

  const updateSubtask = (index, value) => {
    const newSubtasks = [...subtasks];
    newSubtasks[index] = value;
    setSubtasks(newSubtasks);
  };

  const handleSubmit = async () => {
    const payload = {
      task_title: title,
      task_notes: notes,
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
    <div className="modal">
      <h2>Create Task</h2>

      <input
        placeholder="Task Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        placeholder="Notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      <select
        value={difficulty}
        onChange={(e) => setDifficulty(e.target.value)}
      >
        <option value="easy">Easy</option>
        <option value="medium">Medium</option>
        <option value="hard">Hard</option>
      </select>

        <h3>Category</h3>
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
        >
          <option value="studies">Studies</option>
          <option value="exercise">Exercise</option>
          <option value="sleep">Sleep</option>
          <option value="nutrition">Nutrition</option>
        </select>


      <h3>Subtasks</h3>

      {subtasks.map((sub, index) => (
        <input
          key={index}
          placeholder="Subtask description"
          value={sub}
          onChange={(e) => updateSubtask(index, e.target.value)}
        />
      ))}

      <button onClick={addSubtask}>+ Add Subtask</button>

      <button onClick={handleSubmit}>Create</button>
      <button onClick={onClose}>Cancel</button>
    </div>
  );
}

export default CreateTaskModal;
