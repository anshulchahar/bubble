import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert, // Use Alert for validation messages
} from 'react-native';
import { useTheme } from '../context/ThemeContext'; // Import useTheme
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons'; // For icons

const TaskForm = ({ task, onSave, onCancel }) => {
  const { colors } = useTheme(); // Use theme colors
  const styles = getStyles(colors); // Get dynamic styles

  // Initialize state
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [priority, setPriority] = useState(task?.priority || 3);
  const [importance, setImportance] = useState(task?.importance || 3);
  const [status, setStatus] = useState(task?.status || 'todo');
  const [category, setCategory] = useState(task?.category || '');

  // Date state and picker visibility
  const [date, setDate] = useState(task?.dueDate ? new Date(task.dueDate) : null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Validate form before saving
  const validateForm = () => {
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Title is required'); // Use Alert
      return false;
    }
    return true;
  };

  // Handle save button press
  const handleSave = () => {
    if (validateForm()) {
      onSave({
        id: task?.id, // Will be undefined for new tasks
        title: title.trim(),
        description: description.trim(),
        priority,
        importance,
        status,
        dueDate: date ? date.toISOString() : null, // Save date as ISO string or null
        category: category.trim(),
      });
    }
  };

  // Handle date change from picker
  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios'); // Keep open on iOS until dismissed
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  // Show the date picker modal/dialog
  const showPicker = () => {
    setShowDatePicker(true);
  };

  // Format date for display
  const formatDate = (d) => {
    if (!d) return 'Select a date';
    return d.toLocaleDateString(undefined, { // Use device locale
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

   // Get status display info (color and text)
   const getStatusInfo = (statusValue) => {
    switch (statusValue) {
      case 'todo':
        return { color: colors.bubbleTodo.split(' ')[2], text: 'To Do' };
      case 'in-progress':
        return { color: colors.bubbleInProgress.split(' ')[2], text: 'In Progress' };
      case 'done':
        return { color: colors.bubbleDone.split(' ')[2], text: 'Done' };
      default:
        return { color: colors.bubbleDefault, text: 'Unknown' };
    }
  };

  // Render custom slider for priority/importance
  const renderSlider = (value, setValue, label) => {
    return (
      <View style={styles.formGroup}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.sliderTrack}>
          {[1, 2, 3, 4, 5].map(num => (
            <TouchableOpacity
              key={num}
              style={[
                styles.sliderButton,
                { borderColor: colors.border }, // Theme border
                value >= num && { backgroundColor: colors.primary } // Active state based on value
              ]}
              onPress={() => setValue(num)}
            >
              <Text style={[styles.sliderText, value >= num && styles.sliderTextActive]}>
                {num}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.formTitle}>
        {task ? 'Edit Task' : 'Add New Task'}
      </Text>

      {/* Title Input */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Title *</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="What needs to be done?"
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      {/* Description Input */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Add more details..."
          placeholderTextColor={colors.textSecondary}
          multiline
          numberOfLines={4}
        />
      </View>

      {/* Priority/Importance Sliders */}
      {renderSlider(priority, setPriority, 'Priority')}
      {renderSlider(importance, setImportance, 'Importance')}

      {/* Status Selector */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Status</Text>
        <View style={styles.statusContainer}>
          {[ 'todo', 'in-progress', 'done' ].map((statusValue) => {
            const currentStatusInfo = getStatusInfo(statusValue);
            const isActive = status === statusValue;
            return (
              <TouchableOpacity
                key={statusValue}
                style={[
                  styles.statusOption,
                  { borderColor: currentStatusInfo.color },
                  isActive && { backgroundColor: currentStatusInfo.color },
                ]}
                onPress={() => setStatus(statusValue)}
              >
                <Text style={[
                  styles.statusText,
                  { color: isActive ? colors.bubbleText : currentStatusInfo.color },
                ]}>
                  {currentStatusInfo.text}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Due Date Picker */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Due Date</Text>
        <TouchableOpacity style={styles.input} onPress={showPicker}>
          <Text style={styles.dateText}>{formatDate(date)}</Text>
          <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <DateTimePicker
          value={date || new Date()} // Use current date if none selected
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
          // minimumDate={new Date()} // Optional: prevent past dates
          textColor={colors.text} // Ensure text color is visible in dark mode
        />
      )}

      {/* Category Input */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Category (Optional)</Text>
        <TextInput
          style={styles.input}
          value={category}
          onChangeText={setCategory}
          placeholder="e.g., Work, Personal"
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]} // Use generic button style
          onPress={onCancel}
        >
          <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.saveButton]} // Use generic button style
          onPress={handleSave}
        >
          <Text style={[styles.buttonText, styles.saveButtonText]}>
            {task ? 'Update Task' : 'Add Task'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

// Function to generate styles based on theme colors
const getStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    // Background applied at screen level
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40, // Ensure space for buttons
  },
  formTitle: {
    fontSize: 24, // Larger title
    fontWeight: 'bold',
    marginBottom: 24,
    color: colors.text,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 20, // Consistent spacing
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
    color: colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8, // More rounded
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: colors.card, // Use card background
    color: colors.text,
    flexDirection: 'row', // For date picker icon
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  dateText: {
      color: colors.text,
      fontSize: 16,
  },
  sliderContainer: {
    marginBottom: 20,
  },
  sliderTrack: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.card, // Background for track
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden', // Clip buttons
  },
  sliderButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  sliderButtonActive: {
    // Style applied inline
  },
  sliderText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  sliderTextActive: {
    color: colors.bubbleText, // White text on primary
    fontWeight: 'bold',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  statusOption: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1, // Border inside container
    borderRightWidth: 0, // Remove right border, container handles edges
    borderLeftWidth: 0,
    marginHorizontal: 0,
  },
  statusOptionActive: {
    // Style applied inline
  },
  statusText: {
    fontWeight: '500',
  },
  statusTextActive: {
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 32,
  },
  button: { // Generic button style
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  cancelButtonText: {
    color: colors.textSecondary,
  },
  saveButton: {
    backgroundColor: colors.primary,
    marginLeft: 8,
  },
  saveButtonText: {
    color: colors.bubbleText,
  },
  buttonText: { // Generic button text
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TaskForm;
