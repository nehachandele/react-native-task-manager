import AsyncStorage from '@react-native-async-storage/async-storage';

const TASK_KEY = 'TASKS';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority?: 'Low' | 'Medium' | 'High';
  dueDate?: string;
  completed: boolean;
  createdAt: string;
}

export const getTasks = async (): Promise<Task[]> => {
  try {
    const json = await AsyncStorage.getItem('tasks');
    const data = json ? JSON.parse(json) : [];
    if (!Array.isArray(data)) return [];
    return data;
  } catch (e) {
    console.log('Get tasks error', e);
    return [];
  }
};

// Save tasks: append if needed
export const saveTasks = async (taskOrTasks: Task | Task[], append = false): Promise<Task[]> => {
  try {
    let tasks: Task[] = [];
    if (append) {
      tasks = await getTasks();
      if (!Array.isArray(tasks)) tasks = [];
      if (Array.isArray(taskOrTasks)) tasks = [...tasks, ...taskOrTasks];
      else tasks.push(taskOrTasks);
    } else {
      tasks = Array.isArray(taskOrTasks) ? taskOrTasks : [taskOrTasks];
    }
    await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
    return tasks;
  } catch (e) {
    console.log('Save tasks error', e);
    return [];
  }
};