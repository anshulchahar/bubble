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
  Image
} from 'react-native';
import { useTheme } from '../context/ThemeContext'; // Import useTheme
import DateTimePicker from '@react-native-community/datetimepicker';
import Slider from '@react-native-community/slider'; // Import Slider component
import { Ionicons } from '@expo/vector-icons'; // For icons

const TaskForm = ({ task, onSave, onCancel, onMenuPress }) => {
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
      const now = new Date().toISOString();
      onSave({
        id: task?.id || Date.now().toString(), // Generate ID for new tasks
        title: title.trim(),
        description: description.trim(),
        priority,
        importance,
        status,
        dueDate: date ? date.toISOString() : null, // Save date as ISO string or null
        category: category.trim(),
        // Add creation timestamp for new tasks
        createdAt: task?.createdAt || now,
        updatedAt: now,
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
        <View style={styles.sliderLabelContainer}>
          <Text style={styles.label}>{label}</Text>
        </View>
        <View style={styles.sliderContainer}>
          <Slider
            style={styles.slider}
            minimumValue={1}
            maximumValue={5}
            step={1}
            value={value}
            onValueChange={setValue}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.border}
            thumbTintColor={colors.primary}
          />
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>      {/* Back Button and Logo/Menu */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onCancel}
        >
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        
        {/* Title aligned with back button */}
        <Text style={styles.formTitle}>
          {task ? 'Edit Task' : 'New Task'}
        </Text>
        
        {/* Logo that toggles sidebar */}
        {onMenuPress && (
          <TouchableOpacity onPress={onMenuPress}>
            <Image 
              source={require('../../assets/logo.png')} 
              style={styles.logo} 
              resizeMode="contain"
            />
          </TouchableOpacity>
        )}
      </View>

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
                  styles.statusOption
                  // Removed the active background color style
                ]}
                onPress={() => setStatus(statusValue)}
              >
                <Text style={[
                  styles.statusText,
                  { color: isActive ? colors.primary : colors.text },
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
    paddingLeft: 12, // Reduced left padding
  },  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingTop: 8,
  },
  backButton: {
    padding: 8,
    marginLeft: -8, // Negative margin to align with container edge
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 16,
    flex: 1,
  },
  logo: {
    height: 30,
    width: 85,
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
    marginBottom: 10,
  },
  sliderLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 40,
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
    borderWidth: 0, // Remove border
    borderRightWidth: 0,
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
