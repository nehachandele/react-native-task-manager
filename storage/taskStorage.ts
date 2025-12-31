import AsyncStorage from '@react-native-async-storage/async-storage';

/* ==========================
        Storage Key
========================== */
const TASK_KEY = 'TASKS';

/* ==========================
        Task Interface
========================== */
export interface Task {
  id: string;
  title: string;
  description?: string;
  priority?: 'Low' | 'Medium' | 'High';
  dueDate?: string;
  completed: boolean;
  createdAt: string;
}

/* ==========================
        Get Tasks
========================== */
export const getTasks = async (): Promise<Task[]> => {
  try {
    const json = await AsyncStorage.getItem(TASK_KEY);
    const data = json ? JSON.parse(json) : [];
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.log('Get tasks error:', error);
    return [];
  }
};

/* ==========================
        Save Tasks
========================== */
/**
 * append = true  → add new task(s)
 * append = false → replace task list
 */
export const saveTasks = async (
  taskOrTasks: Task | Task[],
  append = false
): Promise<Task[]> => {
  try {
    let tasks: Task[] = [];

    if (append) {
      const existing = await getTasks();
      tasks = Array.isArray(existing) ? existing : [];

      if (Array.isArray(taskOrTasks)) {
        tasks = [...taskOrTasks, ...tasks]; // newest first
      } else {
        tasks.unshift(taskOrTasks);
      }
    } else {
      tasks = Array.isArray(taskOrTasks)
        ? taskOrTasks
        : [taskOrTasks];
    }

    await AsyncStorage.setItem(TASK_KEY, JSON.stringify(tasks));
    return tasks;
  } catch (error) {
    console.log('Save tasks error:', error);
    return [];
  }
};
