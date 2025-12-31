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

/* ==========================
   Cross-platform Date Picker
========================== */
const DatePicker = ({
  date,
  setDate,
}: {
  date: Date | null;
  setDate: (d: Date) => void;
}) => {
  const [show, setShow] = useState(false);

  // ✅ Web
  if (Platform.OS === 'web') {
    return (
      <input
        type="date"
        value={date ? date.toISOString().substring(0, 10) : ''}
        onChange={(e) => setDate(new Date(e.target.value))}
        style={{
          padding: 12,
          borderRadius: 12,
          border: '1px solid #ccc',
          width: '100%',
          marginTop: 6,
        }}
      />
    );
  }

  // ✅ Android / iOS
  const DateTimePicker =
    require('@react-native-community/datetimepicker').default;

  return (
    <>
      <TouchableOpacity
        style={styles.dateBtn}
        onPress={() => setShow(true)}
      >
        <Text style={styles.dateText}>
          {date ? date.toDateString() : 'Select due date'}
        </Text>
      </TouchableOpacity>

      {show && (
        <DateTimePicker
          value={date || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(_, selectedDate) => {
            setShow(false);
            if (selectedDate) setDate(selectedDate);
          }}
        />
      )}
    </>
  );
};

/* ==========================
      Add Task Screen
========================== */
export default function AddTaskScreen() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] =
    useState<'Low' | 'Medium' | 'High'>('Low');
  const [dueDate, setDueDate] = useState<Date | null>(null);

  const onSave = async () => {
    if (!title.trim()) {
      alert('Title is required!');
      return;
    }

    const newTask: Task = {
      id: Date.now().toString(), // ✅ MOBILE SAFE ID
      title,
      description,
      priority,
      dueDate: dueDate ? dueDate.toISOString() : undefined,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    await saveTasks(newTask, true);

    // ✅ Force refresh task list on mobile
    router.replace('/tasks');
  };

  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={styles.label}>Title *</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Enter task title"
      />

      {/* Description */}
      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={description}
        onChangeText={setDescription}
        multiline
        placeholder="Enter task description"
      />

      {/* Priority */}
      <Text style={styles.label}>Priority</Text>
      <View style={styles.priorityContainer}>
        {(['Low', 'Medium', 'High'] as const).map(p => (
          <TouchableOpacity
            key={p}
            onPress={() => setPriority(p)}
            style={[
              styles.priorityBtn,
              priority === p && styles.priorityActive,
            ]}
          >
            <Text style={styles.priorityText}>{p}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Due Date */}
      <Text style={styles.label}>Due Date</Text>
      <DatePicker date={dueDate} setDate={setDueDate} />

      {/* Save */}
      <TouchableOpacity style={styles.saveBtn} onPress={onSave}>
        <Text style={styles.saveText}>Save Task</Text>
      </TouchableOpacity>
    </View>
  );
}

/* ==========================
          Styles
========================== */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f0ff',
  },

  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4b0082',
    marginTop: 12,
  },

  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    marginTop: 6,
  },

  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },

  priorityContainer: {
    flexDirection: 'row',
    marginTop: 6,
  },

  priorityBtn: {
    flex: 1,
    padding: 10,
    marginHorizontal: 4,
    backgroundColor: '#ddd',
    borderRadius: 8,
    alignItems: 'center',
  },

  priorityActive: {
    backgroundColor: '#800080',
  },

  priorityText: {
    color: '#fff',
    fontWeight: '600',
  },

  dateBtn: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    marginTop: 6,
  },

  dateText: {
    color: '#333',
  },

  saveBtn: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#4b0082',
    borderRadius: 16,
    alignItems: 'center',
  },

  saveText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
