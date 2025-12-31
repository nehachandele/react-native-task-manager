import { Audio } from 'expo-av';
import Checkbox from 'expo-checkbox';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { getTasks, saveTasks, Task } from '../../storage/taskStorage';

export default function TaskListScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] =
    useState<'All' | 'Pending' | 'Completed' | 'High'>('All');

  const router = useRouter();
  const confettiRef = useRef<any>(null);

  /* ================= Load Tasks ================= */
  useFocusEffect(
    useCallback(() => {
      loadTasks();
    }, [])
  );

  const loadTasks = async () => {
    const data = await getTasks();
    setTasks(Array.isArray(data) ? data : []);
  };

  /* ================= Sound ================= */
  const playSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/sounds/completion.mp3')
      );
      await sound.playAsync();
    } catch (e) {
      console.log('Sound error:', e);
    }
  };

  /* ================= Toggle ================= */
  const toggleTask = async (id: string) => {
    const updated = tasks.map(task =>
      task.id === id
        ? { ...task, completed: !task.completed }
        : task
    );

    setTasks(updated);
    await saveTasks(updated, false); // ✅ IMPORTANT

    const toggled = updated.find(t => t.id === id);
    if (toggled?.completed) {
      playSound();
      confettiRef.current?.start();
    }
  };

  /* ================= Delete ================= */
  const deleteTask = async (id: string) => {
    const updated = tasks.filter(task => task.id !== id);
    setTasks(updated);
    await saveTasks(updated, false); // ✅ IMPORTANT
  };

  /* ================= Helpers ================= */
  const getPriorityColor = (p?: 'Low' | 'Medium' | 'High') => {
    if (p === 'High') return '#f56262';
    if (p === 'Medium') return '#f5d562';
    if (p === 'Low') return '#62f57d';
    return '#ccc';
  };

  const getDueStyle = (due?: string, done?: boolean) => {
    if (!due || done) return {};
    const now = new Date();
    const d = new Date(due);
    if (d < now) return { color: 'red', fontWeight: '700' };
    const diff =
      (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    if (diff <= 2) return { color: '#f5a623', fontWeight: '600' };
    return { color: '#777' };
  };

  /* ================= Filter ================= */
  const filteredTasks = tasks.filter(task => {
    if (filter === 'All') return true;
    if (filter === 'Pending') return !task.completed;
    if (filter === 'Completed') return task.completed;
    if (filter === 'High') return task.priority === 'High';
    return true;
  });

  /* ================= Render ================= */
  const renderItem = ({ item }: { item: Task }) => (
    <View style={[styles.card, item.completed && styles.completedCard]}>
      <View style={styles.cardContent}>
        <Checkbox
          value={item.completed}
          onValueChange={() => toggleTask(item.id)}
          color={item.completed ? '#800080' : undefined}
        />

        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={[styles.title, item.completed && styles.completed]}>
            {item.title} {item.completed && '✅'}
          </Text>

          {item.description && (
            <Text style={styles.desc}>{item.description}</Text>
          )}

          {item.priority && (
            <View
              style={[
                styles.priorityTag,
                { backgroundColor: getPriorityColor(item.priority) },
              ]}
            >
              <Text style={styles.priorityText}>{item.priority}</Text>
            </View>
          )}

          {item.dueDate && (
            <Text style={[styles.meta, getDueStyle(item.dueDate, item.completed)]}>
              Due: {new Date(item.dueDate).toDateString()}
            </Text>
          )}
        </View>
      </View>

      <TouchableOpacity onPress={() => deleteTask(item.id)}>
        <Text style={styles.delete}>❌</Text>
      </TouchableOpacity>
    </View>
  );

  /* ================= UI ================= */
  return (
    <View style={styles.container}>
      {/* Filters */}
      <View style={styles.filterBar}>
        {['All', 'Pending', 'Completed', 'High'].map(f => (
          <TouchableOpacity key={f} onPress={() => setFilter(f as any)}>
            <Text style={[styles.filterText, filter === f && styles.activeFilter]}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      {filteredTasks.length === 0 && (
        <Text style={styles.empty}>No tasks yet 👀</Text>
      )}

      <FlatList
        data={filteredTasks}
        keyExtractor={item => item.id}
        renderItem={renderItem}
      />

      {/* Add Button */}
      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => router.push('/tasks/add')}
      >
        <Text style={styles.addText}>+ Add Task</Text>
      </TouchableOpacity>

      {/* Confetti */}
      <ConfettiCannon
        ref={confettiRef}
        count={50}
        origin={{ x: 200, y: 0 }}
        autoStart={false}
      />
    </View>
  );
}

/* ================= Styles ================= */
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f0ff' },

  empty: {
    textAlign: 'center',
    marginTop: 40,
    color: '#555',
    fontSize: 16,
  },

  filterBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },

  filterText: {
    fontSize: 14,
    padding: 6,
    color: '#777',
  },

  activeFilter: {
    fontWeight: '700',
    color: '#800080',
    textDecorationLine: 'underline',
  },

  card: {
    padding: 14,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginVertical: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    elevation: 5,
  },

  completedCard: { backgroundColor: '#e6e6fa' },

  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4b0082',
  },

  completed: {
    textDecorationLine: 'line-through',
    color: '#aaa',
  },

  desc: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },

  meta: {
    fontSize: 12,
    marginTop: 2,
  },

  delete: {
    fontSize: 20,
    paddingHorizontal: 10,
    color: '#800080',
  },

  addBtn: {
    backgroundColor: '#4b0082',
    padding: 16,
    borderRadius: 16,
    marginTop: 12,
  },

  addText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
  },

  priorityTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
    alignSelf: 'flex-start',
  },

  priorityText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
});
