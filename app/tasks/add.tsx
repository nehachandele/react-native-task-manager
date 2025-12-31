import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Picker, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { v4 as uuidv4 } from 'uuid';
import { getTasks, saveTasks, Task } from '../../storage/taskStorage';

export default function AddTaskScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Low');
  const [dueDate, setDueDate] = useState('');
  const router = useRouter();

  const saveTask = async () => {
    if (!title.trim()) {
      alert('Title is required');
      return;
    }

    const tasks = await getTasks();
    const newTask: Task = {
      id: uuidv4(),
      title,
      description,
      completed: false,
      createdAt: new Date().toISOString(),
      priority,
      dueDate,
    };

    await saveTasks([...tasks, newTask]);
    router.back();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Title *</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} />

      <Text style={styles.label}>Description</Text>
      <TextInput style={styles.input} value={description} onChangeText={setDescription} />

      <Text style={styles.label}>Priority</Text>
      <Picker selectedValue={priority} onValueChange={(val) => setPriority(val)}>
        <Picker.Item label="Low" value="Low" />
        <Picker.Item label="Medium" value="Medium" />
        <Picker.Item label="High" value="High" />
      </Picker>

      <Text style={styles.label}>Due Date</Text>
      <TextInput
        style={styles.input}
        placeholder="YYYY-MM-DD"
        value={dueDate}
        onChangeText={setDueDate}
      />

      <TouchableOpacity style={styles.saveBtn} onPress={saveTask}>
        <Text style={styles.saveText}>Save Task</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f0f4f7' },
  label: { fontSize: 16, fontWeight: '600', marginTop: 12 },
  input: { backgroundColor: '#fff', padding: 12, borderRadius: 8, marginTop: 6 },
  saveBtn: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 16,
    marginTop: 24,
  },
  saveText: { color: '#fff', textAlign: 'center', fontSize: 18, fontWeight: '600' },
});
