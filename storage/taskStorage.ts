import AsyncStorage from '@react-native-async-storage/async-storage';

const TASK_KEY = 'TASKS';

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: string;
  priority?: 'Low' | 'Medium' | 'High';
  dueDate?: string; // ISO string
}

export const getTasks = async (): Promise<Task[]> => {
  try {
    const data = await AsyncStorage.getItem(TASK_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.log('Error loading tasks', error);
    return [];
  }
};

export const saveTasks = async (tasks: Task[]) => {
  try {
    await AsyncStorage.setItem(TASK_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.log('Error saving tasks', error);
  }
};
