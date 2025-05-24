import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FAQ_CATEGORIES = [
  {
    category: 'Tasks',
    faqs: [
      {
        question: 'How do I add a new task?',
        answer: 'Tap the "+" button on the home screen or use the sidebar menu to add a new task. Fill in the details and save.'
      },
      {
        question: 'How can I edit or delete a task?',
        answer: 'Tap on a task bubble to view its details. From there, you can edit or delete the task.'
      },
      {
        question: 'What do the bubble sizes and colors mean?',
        answer: 'Bubble size is based on priority and importance. Colors represent the status: To Do, In Progress, or Done.'
      },
    ]
  },
  {
    category: 'App Usage',
    faqs: [
      {
        question: 'Can I use the app offline?',
        answer: 'Yes! Tasks are saved locally and will sync to the cloud when you sign in.'
      },
      {
        question: 'How do I clear my task history?',
        answer: 'Use the "Clear History" option in the sidebar under the Account section.'
      },
      {
        question: 'How do I change the app theme?',
        answer: 'Tap the sun/moon icon in the top right of the home screen to toggle between light and dark mode.'
      },
    ]
  },
  {
    category: 'Support',
    faqs: [
      {
        question: 'How do I contact support?',
        answer: 'Go to the sidebar > About > Contact Us to send us a message.'
      },
      {
        question: 'How do I report a bug?',
        answer: 'Go to the sidebar > About > Report Issue to let us know about any problems.'
      },
    ]
  }
];

const FAQScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [expanded, setExpanded] = useState({});

  const handleToggle = (catIdx, faqIdx) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(prev => {
      const key = `${catIdx}-${faqIdx}`;
      return { ...prev, [key]: !prev[key] };
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color={colors.primary} />
      </TouchableOpacity>
      <Text style={styles.title}>Frequently Asked Questions</Text>
      <ScrollView contentContainerStyle={styles.faqList} showsVerticalScrollIndicator={false}>
        {FAQ_CATEGORIES.map((cat, catIdx) => (
          <View key={cat.category} style={styles.categoryBlock}>
            <Text style={styles.categoryTitle}>{cat.category}</Text>
            {cat.faqs.map((faq, faqIdx) => {
              const key = `${catIdx}-${faqIdx}`;
              const isOpen = !!expanded[key];
              return (
                <View key={faq.question} style={styles.faqItem}>
                  <TouchableOpacity
                    style={styles.questionRow}
                    onPress={() => handleToggle(catIdx, faqIdx)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.question}>{faq.question}</Text>
                    <Ionicons
                      name={isOpen ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color={colors.primary}
                    />
                  </TouchableOpacity>
                  {isOpen && (
                    <View style={styles.answerBox}>
                      <Text style={styles.answer}>{faq.answer}</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const getStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 10,
    padding: 6,
    borderRadius: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.text, // Use main text color (white in dark mode)
    marginBottom: 18,
  },
  faqList: {
    paddingBottom: 40,
  },
  categoryBlock: {
    marginBottom: 32,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 10,
    marginTop: 8,
  },
  faqItem: {
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 8,
  },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  question: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    marginRight: 10,
  },
  answerBox: {
    paddingTop: 6,
    paddingBottom: 2,
  },
  answer: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
});

export default FAQScreen;
