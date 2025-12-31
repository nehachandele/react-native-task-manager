import { Audio } from 'expo-av';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    CheckBox,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { getTasks, saveTasks, Task } from '../../storage/taskStorage';

export default function TaskListScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      loadTasks();
    }, [])
  );

  const loadTasks = async () => {
    const data = await getTasks();
    setTasks(data);
  };

  const playSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/sounds/completion.mp3')
      );
      await sound.playAsync();
    } catch (error) {
      console.log('Sound error:', error);
    }
  };

  const toggleTask = async (id: string) => {
    const updated = tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    setTasks(updated);
    await saveTasks(updated);

    const toggledTask = updated.find(task => task.id === id);
    if (toggledTask?.completed) playSound();
  };

  const deleteTask = async (id: string) => {
    const updated = tasks.filter(task => task.id !== id);
    setTasks(updated);
    await saveTasks(updated);
  };

  const renderItem = ({ item }: { item: Task }) => (
    <View style={[styles.card, item.completed && styles.completedCard]}>
      <View style={styles.cardContent}>
        <CheckBox value={item.completed} onValueChange={() => toggleTask(item.id)} />
        <View style={{ flex: 1, marginLeft: 8 }}>
          <Text style={[styles.title, item.completed && styles.completed]}>
            {item.title} {item.completed && '✅'}
          </Text>
          {item.description && (
            <Text style={[styles.desc, item.completed && styles.completedDesc]}>
              {item.description}
            </Text>
          )}
          {item.priority && <Text style={styles.meta}>Priority: {item.priority}</Text>}
          {item.dueDate && <Text style={styles.meta}>Due: {item.dueDate}</Text>}
        </View>
      </View>

      <TouchableOpacity onPress={() => deleteTask(item.id)}>
        <Text style={styles.delete}>❌</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {tasks.length === 0 && <Text style={styles.empty}>No tasks yet 👀</Text>}

      <FlatList data={tasks} keyExtractor={item => item.id} renderItem={renderItem} />

      <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/tasks/add')}>
        <Text style={styles.addText}>+ Add Task</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f0f4f7' },
  empty: { textAlign: 'center', marginTop: 40, color: 'gray', fontSize: 16 },
  card: {
    padding: 14,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginVertical: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 5,
  },
  completedCard: { backgroundColor: '#d4edda' },
  cardContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  title: { fontSize: 18, fontWeight: '600', color: '#333' },
  completed: { textDecorationLine: 'line-through', color: '#888' },
  desc: { fontSize: 14, color: '#555', marginTop: 4 },
  completedDesc: { color: '#666' },
  meta: { fontSize: 12, color: '#777', marginTop: 2 },
  delete: { fontSize: 20, paddingHorizontal: 10 },
  addBtn: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 16,
    marginTop: 16,
  },
  addText: { color: '#fff', textAlign: 'center', fontSize: 18, fontWeight: '600' },
});
