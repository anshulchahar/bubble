import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isVisible, onClose, navigation }) => {
  const { colors } = useTheme();
  const { user, signOut } = useAuth();
  
  // Animated value for sidebar slide-in effect
  const slideAnim = React.useRef(new Animated.Value(isVisible ? 0 : -300)).current;

  // Update animation when visibility changes
  React.useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isVisible ? 0 : -300,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isVisible]);

  // Handle sign out
  const handleSignOut = () => {
    onClose(); // Close sidebar first
    setTimeout(() => {
      signOut();
    }, 300);
  };
  
  // Handle navigation to screens
  const navigateTo = (screenName, params = {}) => {
    onClose(); // Close sidebar first
    setTimeout(() => {
      navigation.navigate(screenName, params);
    }, 300);
  };
  
  const styles = getStyles(colors);
  
  return (
    <>
      {isVisible && (
        <TouchableOpacity 
          style={styles.overlay}
          activeOpacity={1}
          onPress={onClose}
        />
      )}
      
      <Animated.View
        style={[
          styles.container,
          {
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        {/* Header with logo and close button */}
        <View style={styles.header}>
          <Image 
            source={require('../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        
        {/* User section */}
        <View style={styles.userSection}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={30} color={colors.primary} />
          </View>
          <View style={styles.userInfo}>
            {user ? (
              <>
                <Text style={styles.userName}>{user.email?.split('@')[0] || 'User'}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
              </>
            ) : (
              <TouchableOpacity 
                style={styles.signInButton}
                onPress={() => {
                  onClose();
                  setTimeout(() => navigation.navigate('SignIn'), 300);
                }}
              >
                <Text style={styles.signInText}>Sign In</Text>
                <Ionicons name="log-in-outline" size={18} color={colors.primary} />
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        <View style={styles.divider} />
        
        {/* Navigation Links */}
        <ScrollView style={styles.menu}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigateTo('Home')}
          >
            <Ionicons name="home" size={22} color={colors.primary} />
            <Text style={styles.menuText}>Home</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigateTo('TaskForm')}
          >
            <Ionicons name="add-circle" size={22} color={colors.primary} />
            <Text style={styles.menuText}>Add New Task</Text>
          </TouchableOpacity>
          
          <View style={styles.divider} />
          
          {/* Filters section */}
          <Text style={styles.sectionTitle}>Filters</Text>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
              onClose();
              setTimeout(() => navigation.navigate('Home', { initialFilter: 'all' }), 300);
            }}
          >
            <Ionicons name="apps" size={22} color={colors.text} />
            <Text style={styles.menuText}>All Tasks</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
              onClose();
              setTimeout(() => navigation.navigate('Home', { initialFilter: 'todo' }), 300);
            }}
          >
            <Ionicons name="list" size={22} color={colors.text} />
            <Text style={styles.menuText}>To Do</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
              onClose();
              setTimeout(() => navigation.navigate('Home', { initialFilter: 'in-progress' }), 300);
            }}
          >
            <Ionicons name="time" size={22} color={colors.text} />
            <Text style={styles.menuText}>In Progress</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
              onClose();
              setTimeout(() => navigation.navigate('Home', { initialFilter: 'done' }), 300);
            }}
          >
            <Ionicons name="checkmark-circle" size={22} color={colors.text} />
            <Text style={styles.menuText}>Done</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
              onClose();
              setTimeout(() => navigation.navigate('Home', { initialFilter: 'high-priority' }), 300);
            }}
          >
            <Ionicons name="alert-circle" size={22} color={colors.text} />
            <Text style={styles.menuText}>High Priority</Text>
          </TouchableOpacity>
          
          <View style={styles.divider} />

          {/* Account section */}
          <Text style={styles.sectionTitle}>Account</Text>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
              onClose();
              setTimeout(() => navigation.navigate('Statistics'), 300);
            }}
          >
            <Ionicons name="stats-chart" size={22} color={colors.text} />
            <Text style={styles.menuText}>Statistics</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
              onClose();
              // Placeholder: implement clear history logic
              setTimeout(() => alert('History cleared!'), 300);
            }}
          >
            <Ionicons name="trash-bin" size={22} color={colors.text} />
            <Text style={styles.menuText}>Clear History</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* About section */}
          <Text style={styles.sectionTitle}>About</Text>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
              onClose();
              setTimeout(() => navigation.navigate('PrivacyPolicy'), 300);
            }}
          >
            <Ionicons name="document-text" size={22} color={colors.text} />
            <Text style={styles.menuText}>Privacy Policy</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
              onClose();
              setTimeout(() => navigation.navigate('FAQ'), 300);
            }}
          >
            <Ionicons name="help-circle" size={22} color={colors.text} />
            <Text style={styles.menuText}>FAQ</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
              onClose();
              setTimeout(() => navigation.navigate('ContactUs'), 300);
            }}
          >
            <Ionicons name="mail" size={22} color={colors.text} />
            <Text style={styles.menuText}>Contact Us</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
              onClose();
              setTimeout(() => navigation.navigate('ReportIssue'), 300);
            }}
          >
            <Ionicons name="bug" size={22} color={colors.text} />
            <Text style={styles.menuText}>Report Issue</Text>
          </TouchableOpacity>
        </ScrollView>
        
        {/* Footer with settings & logout */}
        <View style={styles.footer}>
          {user && (
            <TouchableOpacity 
              style={styles.footerButton}
              onPress={handleSignOut}
            >
              <Ionicons name="log-out-outline" size={22} color={colors.text} />
              <Text style={styles.footerButtonText}>Sign Out</Text>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    </>
  );
};

const getStyles = (colors) => StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 100,
  },
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 280,
    backgroundColor: colors.card,
    zIndex: 101,
    paddingTop: 50, // For safe area
    borderRightWidth: 1,
    borderRightColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  logo: {
    height: 35,
    width: 100,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 10,
  },
  menu: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  menuText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 15,
  },
  sectionTitle: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
    marginTop: 10,
    marginLeft: 20,
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerButtonText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 15,
  },
  signInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  signInText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginRight: 8,
  },
});

export default Sidebar;
