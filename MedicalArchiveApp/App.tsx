import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Image,
  FlatList,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Mock data for documents
const mockDocuments = [
  { id: '1', title: 'Blood Test Results', date: '2025-05-15', type: 'Lab Report' },
  { id: '2', title: 'X-Ray Report', date: '2025-04-22', type: 'Radiology' },
  { id: '3', title: 'Vaccination Record', date: '2025-03-10', type: 'Immunization' },
  { id: '4', title: 'Annual Physical', date: '2025-02-05', type: 'Examination' },
  { id: '5', title: 'Prescription', date: '2025-01-20', type: 'Medication' },
];

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('login');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Default credentials
  const DEFAULT_EMAIL = 'admin@medicalarchive.com';
  const DEFAULT_PASSWORD = 'admin123';

  // Handle login
  const handleLogin = () => {
    if (email === DEFAULT_EMAIL && password === DEFAULT_PASSWORD) {
      setIsLoggedIn(true);
      setCurrentScreen('home');
    } else {
      alert('Invalid credentials. Please use:\nEmail: admin@medicalarchive.com\nPassword: admin123');
    }
  };

  // Render login screen
  const renderLoginScreen = () => {
    return (
      <View style={styles.loginContainer}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>🏥</Text>
          <Text style={styles.appName}>Medical Archive</Text>
        </View>
        
        <View style={styles.formContainer}>
          <Text style={styles.title}>Sign In</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
          
          <TouchableOpacity
            style={styles.authButton}
            onPress={handleLogin}
          >
            <Text style={styles.authButtonText}>Sign In</Text>
          </TouchableOpacity>
          
          <View style={styles.credentialsHint}>
            <Text style={styles.hintTitle}>Default Credentials:</Text>
            <Text style={styles.hintText}>Email: admin@medicalarchive.com</Text>
            <Text style={styles.hintText}>Password: admin123</Text>
          </View>
        </View>
      </View>
    );
  };

  // Render home screen
  const renderHomeScreen = () => {
    return (
      <ScrollView style={styles.homeContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Medical Archive</Text>
          <Text style={styles.headerSubtitle}>Your health records in one place</Text>
        </View>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Welcome to Medical Archive</Text>
          <Text style={styles.cardText}>
            Securely store and share your medical documents with healthcare providers.
          </Text>
        </View>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Recent Activity</Text>
          <Text style={styles.cardText}>No recent activity to display.</Text>
        </View>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Quick Actions</Text>
          <TouchableOpacity 
            style={styles.actionItem}
            onPress={() => setCurrentScreen('documents')}
          >
            <Text style={styles.actionText}>View my documents</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionItem}
            onPress={() => setCurrentScreen('qrcode')}
          >
            <Text style={styles.actionText}>Share records with a doctor</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  // Render documents screen
  const renderDocumentsScreen = () => {
    type Document = {
      id: string;
      title: string;
      date: string;
      type: string;
    };

    const renderDocumentItem = ({ item }: { item: Document }) => (
      <TouchableOpacity style={styles.documentItem}>
        <View style={styles.documentIcon}>
          <Text style={styles.documentIconText}>📄</Text>
        </View>
        <View style={styles.documentInfo}>
          <Text style={styles.documentTitle}>{item.title}</Text>
          <Text style={styles.documentMeta}>{item.type} • {item.date}</Text>
        </View>
      </TouchableOpacity>
    );

    return (
      <View style={styles.documentsContainer}>
        <View style={styles.screenHeader}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setCurrentScreen('home')}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.screenTitle}>My Documents</Text>
        </View>
        
        <FlatList
          data={mockDocuments}
          keyExtractor={(item) => item.id}
          renderItem={renderDocumentItem}
          contentContainerStyle={styles.listContent}
        />
      </View>
    );
  };

  // Render QR code screen
  const renderQrCodeScreen = () => {
    return (
      <View style={styles.qrContainer}>
        <View style={styles.screenHeader}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setCurrentScreen('home')}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.screenTitle}>Share Records</Text>
        </View>
        
        <View style={styles.qrContent}>
          <Text style={styles.qrTitle}>Your QR Code</Text>
          <Text style={styles.qrSubtitle}>
            Show this QR code to your healthcare provider
          </Text>
          
          <View style={styles.qrCodeBox}>
            <Text style={styles.qrPlaceholder}>QR Code Placeholder</Text>
          </View>
          
          <Text style={styles.qrInfo}>
            ID: 12345678
          </Text>
          
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>How it works</Text>
            <Text style={styles.infoText}>
              1. Your doctor scans this QR code
            </Text>
            <Text style={styles.infoText}>
              2. They get temporary access to your records
            </Text>
            <Text style={styles.infoText}>
              3. Access expires after 24 hours
            </Text>
          </View>
        </View>
      </View>
    );
  };

  // Render bottom navigation
  const renderBottomNav = () => {
    if (!isLoggedIn) return null;
    
    return (
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => setCurrentScreen('home')}
        >
          <Ionicons 
            name={currentScreen === 'home' ? 'home' : 'home-outline'} 
            size={24} 
            color={currentScreen === 'home' ? '#4a90e2' : '#666'} 
          />
          <Text 
            style={[
              styles.navText, 
              currentScreen === 'home' && styles.navTextActive
            ]}
          >
            Home
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => setCurrentScreen('documents')}
        >
          <Ionicons 
            name={currentScreen === 'documents' ? 'document-text' : 'document-text-outline'} 
            size={24} 
            color={currentScreen === 'documents' ? '#4a90e2' : '#666'} 
          />
          <Text 
            style={[
              styles.navText, 
              currentScreen === 'documents' && styles.navTextActive
            ]}
          >
            Documents
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => setCurrentScreen('qrcode')}
        >
          <Ionicons 
            name={currentScreen === 'qrcode' ? 'qr-code' : 'qr-code-outline'} 
            size={24} 
            color={currentScreen === 'qrcode' ? '#4a90e2' : '#666'} 
          />
          <Text 
            style={[
              styles.navText, 
              currentScreen === 'qrcode' && styles.navTextActive
            ]}
          >
            Share
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => {
            setIsLoggedIn(false);
            setCurrentScreen('login');
          }}
        >
          <Ionicons name="person-outline" size={24} color="#666" />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Main render
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      
      {currentScreen === 'login' && renderLoginScreen()}
      {currentScreen === 'home' && renderHomeScreen()}
      {currentScreen === 'documents' && renderDocumentsScreen()}
      {currentScreen === 'qrcode' && renderQrCodeScreen()}
      
      {renderBottomNav()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  // Login screen styles
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoText: {
    fontSize: 64,
    marginBottom: 16,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f7fa',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  authButton: {
    backgroundColor: '#4a90e2',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  authButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  credentialsHint: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#f0f4f9',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4a90e2',
  },
  hintTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  hintText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  // Home screen styles
  homeContainer: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    padding: 20,
    backgroundColor: '#4a90e2',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  cardText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  actionItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  actionText: {
    fontSize: 16,
    color: '#4a90e2',
  },
  // Documents screen styles
  documentsContainer: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  screenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginRight: 16,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  listContent: {
    padding: 16,
  },
  documentItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  documentIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#f0f4f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  documentIconText: {
    fontSize: 20,
  },
  documentInfo: {
    flex: 1,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  documentMeta: {
    fontSize: 14,
    color: '#666',
  },
  // QR code screen styles
  qrContainer: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  qrContent: {
    padding: 24,
    alignItems: 'center',
  },
  qrTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  qrSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  qrCodeBox: {
    width: 250,
    height: 250,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  qrPlaceholder: {
    fontSize: 16,
    color: '#999',
  },
  qrInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  // Bottom navigation styles
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingVertical: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  navTextActive: {
    color: '#4a90e2',
  },
});
