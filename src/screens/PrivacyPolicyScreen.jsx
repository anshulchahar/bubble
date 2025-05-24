import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const PRIVACY_POLICY = `
Privacy Policy of PopToDo

Effective Date: May 24, 2025
Last Updated: May 24, 2025

PopToDo ("we", "our", or "us") is committed to protecting and respecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your personal data when you use the PopToDo mobile application, a task tracking and management app available to individual users who register via sign-up and login.

By accessing or using PopToDo, you agree to the collection and use of your information in accordance with this Privacy Policy. If you do not agree with our practices, please do not use the App.

1. Data Controller Information
The data controller responsible for your personal data is:
PopToDo App
PopToDo
Email: info@poptodo.com

2. Legal Basis for Processing
We process your data based on the following legal grounds as per Article 6 of the GDPR:
Consent (Art. 6(1)(a)) – When you voluntarily sign up and agree to our privacy policy.
Contractual necessity (Art. 6(1)(b)) – To provide and operate PopToDo services.
Legitimate interests (Art. 6(1)(f)) – For analytics, improvements, and security.
Compliance with legal obligations (Art. 6(1)(c)) – If required by law.

3. What Personal Data We Collect
When you use PopToDo, we may collect the following personal and usage data:
Account Information: Name, Email address, Password (hashed and encrypted), Unique user ID
Task and Activity Data: Tasks created, edited, or deleted, Task metadata (priority, importance, completion status), Task bubble interactions, Timestamped logs of task actions, Analytics related to task completion and trends
Device and Technical Data: Device type and model, Operating System and version, App version, IP address, Mobile identifiers (e.g., Device ID, Advertising ID)
Usage Data: Time spent in the app, Navigation behavior, Feature usage statistics, Crash logs and error reports

4. How We Use Your Data
We use your personal data for the following purposes:
To create and manage your account
To allow you to manage and track tasks effectively
To provide visually analyzable data on task performance
To customize your user experience
To analyze app usage for improvements
To detect and prevent fraud, abuse, or security issues
To communicate updates, changes, or promotional offers
To comply with legal obligations

5. Data Retention
We retain your personal data only for as long as is necessary to:
Fulfill the purposes described in this policy
Comply with legal and regulatory obligations
Resolve disputes
Enforce agreements
Inactive accounts and associated data may be anonymized or deleted after 24 months of inactivity, unless retention is required by law.

6. Sharing and Disclosure of Personal Data
We do not sell your personal data. However, we may share your data with:
Service Providers: Cloud storage providers, Analytics providers (e.g., Firebase, Mixpanel), Authentication and security services
Legal Authorities: If required by court orders, subpoenas, or legal proceedings, To protect our rights and ensure user safety
Corporate Transactions: If PopToDo is involved in a merger, acquisition, or sale of assets, user data may be transferred under confidentiality obligations.

7. International Data Transfers
Your data may be processed or stored in countries outside the EU/EEA. In such cases, we ensure appropriate safeguards such as:
EU Standard Contractual Clauses (SCCs)
Adequacy decisions from the European Commission
Binding corporate rules, where applicable

8. User Rights Under GDPR
As a user within the EU, you have the following rights:
Right to Access – Obtain a copy of your personal data
Right to Rectification – Correct inaccurate or incomplete data
Right to Erasure – Request deletion ("Right to be Forgotten")
Right to Restrict Processing – Limit how we use your data
Right to Data Portability – Receive your data in a structured format
Right to Object – Object to data processing under certain grounds
Right to Withdraw Consent – Withdraw consent at any time
You can exercise these rights by contacting us at: info@poptodo.com
If you believe your rights have been violated, you may lodge a complaint with your local Data Protection Authority (DPA).

9. Data Security
We implement appropriate technical and organizational measures to safeguard your data including:
End-to-end encryption during transmission
Encrypted storage for sensitive data
Regular security audits and vulnerability assessments
Role-based access control for internal staff
Despite our efforts, no digital system is 100% secure. Use strong passwords and update the app regularly.

10. Cookies and Similar Technologies
PopToDo may use local storage or analytics SDKs to improve performance. These technologies:
Help us understand usage patterns
Do not track your browsing outside the app
Are not used for third-party advertising
Consent for analytics will be requested at first launch, and you may change preferences in settings.

11. Children’s Privacy
PopToDo is not intended for users under the age of 16. We do not knowingly collect data from children. If we discover such data, we will delete it immediately. Parents can contact us to request deletion.

12. Changes to This Privacy Policy
We may update this policy from time to time to reflect changes in law, technology, or app features. You will be notified via:
Email notification
In-app alert or pop-up
Posting the revised policy with a new "Effective Date"
Continued use of PopToDo after changes means you accept the updated policy.

13. Contact Information
If you have questions, concerns, or requests regarding this Privacy Policy, contact us at:
Privacy Office – PopToDo
Email: info@poptodo.com

This privacy policy complies with the General Data Protection Regulation (EU) 2016/679 ("GDPR") and applicable national laws of EU Member States.
`;

const PrivacyPolicyScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color={colors.primary} />
      </TouchableOpacity>
      <Text style={styles.title}>Privacy Policy</Text>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {PRIVACY_POLICY.split('\n').map((line, idx) =>
          line.trim().startsWith('Privacy Policy of PopToDo') || line.trim().startsWith('Effective Date:') || line.trim().startsWith('Last Updated:') ? null :
          line.trim().startsWith('1.') || line.trim().match(/^\d+\./) ? (
            <Text key={idx} style={styles.sectionTitle}>{line}</Text>
          ) : line.trim().startsWith('##') ? (
            <Text key={idx} style={styles.sectionTitle}>{line.replace(/^#+\s*/, '')}</Text>
          ) : (
            <Text key={idx} style={styles.text}>{line}</Text>
          )
        )}
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
    color: colors.text,
    marginBottom: 18,
  },
  scrollView: {
    flex: 1,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 18,
    marginBottom: 6,
  },
  text: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 6,
    lineHeight: 22,
  },
});

export default PrivacyPolicyScreen;
