import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Switch } from 'react-native';

/**
 * TaskForm component for adding and editing tasks
 * 
 * @param {Object} task - Existing task for editing (null for new task)
 * @param {Function} onSave - Function to call when saving the task
 * @param {Function} onCancel - Function to call when canceling
 */
const TaskForm = ({ task, onSave, onCancel }) => {
  // Initialize state with existing task data or defaults
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [priority, setPriority] = useState(task?.priority || 3);
  const [importance, setImportance] = useState(task?.importance || 3);
  const [status, setStatus] = useState(task?.status || 'todo');
  const [dueDate, setDueDate] = useState(task?.dueDate || '');
  const [category, setCategory] = useState(task?.category || '');
  
  // Validate form before saving
  const validateForm = () => {
    if (!title.trim()) {
      alert('Title is required');
      return false;
    }
    return true;
  };
  
  // Handle save button press
  const handleSave = () => {
    if (validateForm()) {
      onSave({
        id: task?.id, // Will be undefined for new tasks
        title,
        description,
        priority,
        importance,
        status,
        dueDate,
        category
      });
    }
  };
  
  // Render priority/importance selector
  const renderSlider = (value, setValue, label) => {
    return (
      <View style={styles.sliderContainer}>
        <Text style={styles.label}>{label} ({value})</Text>
        <View style={styles.sliderTrack}>
          {[1, 2, 3, 4, 5].map(num => (
            <TouchableOpacity
              key={num}
              style={[
                styles.sliderButton,
                value === num && styles.sliderButtonActive
              ]}
              onPress={() => setValue(num)}
            >
              <Text style={value === num ? styles.sliderTextActive : styles.sliderText}>
                {num}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };
  
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.formTitle}>
        {task ? 'Edit Task' : 'Add New Task'}
      </Text>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Enter task title"
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Enter task description"
          multiline
          numberOfLines={4}
        />
      </View>
      
      {renderSlider(priority, setPriority, 'Priority')}
      {renderSlider(importance, setImportance, 'Importance')}
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Status</Text>
        <View style={styles.statusContainer}>
          <TouchableOpacity
            style={[
              styles.statusOption,
              status === 'todo' && styles.statusOptionActive
            ]}
            onPress={() => setStatus('todo')}
          >
            <Text
              style={status === 'todo' ? styles.statusTextActive : styles.statusText}
            >
              To Do
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.statusOption,
              status === 'in-progress' && styles.statusOptionActive
            ]}
            onPress={() => setStatus('in-progress')}
          >
            <Text
              style={status === 'in-progress' ? styles.statusTextActive : styles.statusText}
            >
              In Progress
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.statusOption,
              status === 'done' && styles.statusOptionActive
            ]}
            onPress={() => setStatus('done')}
          >
            <Text
              style={status === 'done' ? styles.statusTextActive : styles.statusText}
            >
              Done
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Due Date</Text>
        <TouchableOpacity style={styles.input}>
          <Text>{dueDate || 'Select a date'}</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Category (Optional)</Text>
        <TextInput
          style={styles.input}
          value={category}
          onChangeText={setCategory}
          placeholder="Enter category"
        />
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={onCancel}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>
            {task ? 'Update Task' : 'Add Task'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#ffffff',
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  sliderContainer: {
    marginBottom: 16,
  },
  sliderTrack: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  sliderButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    marginHorizontal: 2,
  },
  sliderButtonActive: {
    backgroundColor: '#4361ee',
    borderColor: '#4361ee',
  },
  sliderText: {
    color: '#333',
  },
  sliderTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusOption: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    marginHorizontal: 2,
  },
  statusOptionActive: {
    backgroundColor: '#4361ee',
    borderColor: '#4361ee',
  },
  statusText: {
    color: '#333',
  },
  statusTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 40,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
  saveButton: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4361ee',
    borderRadius: 4,
    marginLeft: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TaskForm;
