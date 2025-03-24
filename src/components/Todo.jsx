import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import ClipLoader from "react-spinners/ClipLoader";

const BASE_URL = "http://65.0.45.207:5000";


const fadeIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
};

const Todo = () => {
  const [tasks, setTasks] = useState([]);
  const [task, setTask] = useState("");
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [addingTask, setAddingTask] = useState(false);
  const [deletingTask, setDeletingTask] = useState(null);
  const [updatingTask, setUpdatingTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoadingTasks(true);
    try {
      const res = await axios.get(`${BASE_URL}/tasks`);
      setTasks(res.data);
    } catch (error) {
      toast.error("Failed to fetch tasks");
    }
    setLoadingTasks(false);
  };

  const addTask = async () => {
    if (!task.trim()) {
      toast.error("Task cannot be empty");
      return;
    }
    setAddingTask(true);
    try {
      const res = await axios.post(`${BASE_URL}/tasks`, { task });
      setTasks([...tasks, res.data]);
      setTask("");
      toast.success("Task added successfully");
    } catch {
      toast.error("Error adding task");
    }
    setAddingTask(false);
  };

  const deleteTask = async (id) => {
    setDeletingTask(id);
    try {
      await axios.delete(`${BASE_URL}/tasks/${id}`);
      setTasks(tasks.filter((t) => t.id !== id));
      toast.success("Task deleted");
      closeDialog();
    } catch {
      toast.error("Error deleting task");
    }
    setDeletingTask(null);
  };

  const updateTask = async (id) => {
    if (!editText.trim()) {
      toast.error("Task cannot be empty");
      return;
    }
    setUpdatingTask(id);
    try {
      await axios.put(`${BASE_URL}/tasks/${id}`, { task: editText });
      setTasks(tasks.map((t) => (t.id === id ? { ...t, task: editText } : t)));
      toast.success("Task updated");
      closeDialog();
    } catch {
      toast.error("Error updating task");
    }
    setUpdatingTask(null);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedTask(null);
    setEditMode(false);
    setEditText("");
  };

  // Only modified the className properties for responsiveness
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-900 text-white">
      <Toaster position="top-center" />
      <motion.div
        className="w-full max-w-md md:max-w-lg p-4 md:p-6 bg-gray-800 rounded-xl md:rounded-2xl shadow-xl mx-2"
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={fadeIn}
      >
        <h1 className="text-2xl md:text-3xl font-bold text-center mb-4">
          🚀 To-Do List
        </h1>
        <motion.div
          className="flex flex-col sm:flex-row gap-2 mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <input
            type="text"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="Enter a task"
            className="w-full p-2 border border-gray-600 rounded-lg bg-gray-700 text-white truncate text-sm md:text-base"
            disabled={addingTask}
          />
          <button
            onClick={addTask}
            disabled={addingTask}
            className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 transition-colors text-sm md:text-base cursor-pointer hover:bg-blue-700 duration-300"
          >
            {addingTask ? "Adding..." : "Add"}
          </button>
        </motion.div>
        <div className="space-y-2 w-full">
          {loadingTasks ? (
            <div className="flex justify-center">
              <ClipLoader color="#ffffff" size={30} />
            </div>
          ) : (
            <AnimatePresence>
              {tasks.map((t) => (
                <motion.div
                  key={t.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-700 hover:bg-gray-600 cursor-pointer"
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={fadeIn}
                  onClick={() => {
                    setDialogOpen(true);
                    setSelectedTask(t);
                    setEditText(t.task);
                  }}
                >
                  <span className="text-sm md:text-base font-medium break-words max-w-[85%]">
                    {t.task}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </motion.div>
      <AnimatePresence>
        {dialogOpen && selectedTask && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4"
            onClick={closeDialog}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={fadeIn}
          >
            <motion.div
              className="bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg w-full max-w-md mx-2"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-semibold">Task Details</h2>
              {editMode ? (
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full p-2 mt-2 border border-gray-600 rounded-lg bg-gray-700 text-white text-sm md:text-base"
                  rows="3"
                />
              ) : (
                <p className="mt-2 p-2 border border-gray-600 rounded-lg bg-gray-700 text-white break-words text-sm md:text-base">
                  {selectedTask.task}
                </p>
              )}
              <div className="mt-4 flex flex-col sm:flex-row gap-2">
                {editMode ? (
                  <button
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg text-sm md:text-base cursor-pointer"
                    onClick={() => updateTask(selectedTask.id)}
                  >
                    {updatingTask === selectedTask.id ? (
                      <ClipLoader color="#ffffff" size={15} />
                    ) : (
                      "Update"
                    )}
                  </button>
                ) : (
                  <button
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg text-sm md:text-base cursor-pointer"
                    onClick={() => setEditMode(true)}
                  >
                    Edit
                  </button>
                )}
                <button
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg text-sm md:text-base cursor-pointer"
                  onClick={() => deleteTask(selectedTask.id)}
                >
                  {deletingTask === selectedTask.id ? (
                    <ClipLoader color="#ffffff" size={15} />
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Todo;
