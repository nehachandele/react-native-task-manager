import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { saveTasks, Task } from '../../storage/taskStorage';

// Web-compatible date picker fallback
const DatePicker = ({ date, setDate }: { date: Date | null; setDate: (d: Date) => void }) => {
  if (Platform.OS === 'web') {
    return (
      <input
        type="date"
        value={date ? date.toISOString().substring(0, 10) : ''}
        onChange={(e) => setDate(new Date(e.target.value))}
        style={{ padding: 12, borderRadius: 12, border: '1px solid #ccc', width: '100%', marginTop: 6 }}
      />
    );
  } else {
    const DateTimePicker = require('@react-native-community/datetimepicker').default;
    return (
      <DateTimePicker
        value={date || new Date()}
        mode="date"
        display="default"
        onChange={(_, selectedDate) => {
          if (selectedDate) setDate(selectedDate);
        }}
      />
    );
  }
};

export default function AddTaskScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Low');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const router = useRouter();

  const onSave = async () => {
  if (!title.trim()) return alert('Title is required!');

  const newTask: Task = {
    id: crypto.randomUUID(), // safer than react-native-uuid for web
    title,
    description,
    priority,
    dueDate: dueDate ? dueDate.toDateString() : undefined,
    completed: false,
    createdAt: new Date().toISOString(),
  };

  await saveTasks(newTask, true);
  router.back();
};

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Title*</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Enter task title" />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        value={description}
        onChangeText={setDescription}
        multiline
        placeholder="Enter task description"
      />

      <Text style={styles.label}>Priority</Text>
      <View style={styles.priorityContainer}>
        {['Low', 'Medium', 'High'].map((p) => (
          <TouchableOpacity
            key={p}
            onPress={() => setPriority(p as any)}
            style={[styles.priorityBtn, priority === p && styles.priorityActive]}
          >
            <Text style={styles.priorityText}>{p}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Due Date</Text>
      <DatePicker date={dueDate} setDate={setDueDate} />

      <TouchableOpacity style={styles.saveBtn} onPress={onSave}>
        <Text style={styles.saveText}>Save Task</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f0ff' },
  label: { fontSize: 16, fontWeight: '600', color: '#4b0082', marginTop: 12 },
  input: { backgroundColor: '#fff', padding: 12, borderRadius: 12, marginTop: 6 },
  priorityContainer: { flexDirection: 'row', marginTop: 6 },
  priorityBtn: {
    flex: 1,
    padding: 10,
    marginHorizontal: 4,
    backgroundColor: '#ddd',
    borderRadius: 8,
    alignItems: 'center',
  },
  priorityActive: { backgroundColor: '#800080' },
  priorityText: { color: '#fff', fontWeight: '600' },
  saveBtn: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#4b0082',
    borderRadius: 16,
    alignItems: 'center',
  },
  saveText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});
