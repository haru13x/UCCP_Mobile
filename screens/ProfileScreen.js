import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../context/AuthContext';
import { UseMethod } from '../composable/useMethod';

export default function ProfileScreen({ navigation }) {
  const { user, updateUser } = useAuth();
  const details = user?.details || {};
  const [activeStep, setActiveStep] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    first_name: details.first_name || '',
    middle_name: details.middle_name || '',
    last_name: details.last_name || '',
    username: user?.username || '',
    email: user?.email || '',
    phone_number: details.phone_number || '',
    birthdate: details.birthdate || '',
    sex_id: details.sex_id || 1,
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const steps = ['Info', 'Account'];

  const handleEdit = () => {
    setEditForm({
      first_name: details.first_name || '',
      middle_name: details.middle_name || '',
      last_name: details.last_name || '',
      username: user?.username || '',
      email: user?.email || '',
      phone_number: details.phone_number || '',
      birthdate: details.birthdate || '',
      sex_id: details.sex_id || 1,
      current_password: '',
      new_password: '',
      confirm_password: ''
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditForm({
      first_name: details.first_name || '',
      middle_name: details.middle_name || '',
      last_name: details.last_name || '',
      username: user?.username || '',
      email: user?.email || '',
      phone_number: details.phone_number || '',
      birthdate: details.birthdate || '',
      sex_id: details.sex_id || 1,
      current_password: '',
      new_password: '',
      confirm_password: ''
    });
    setIsEditing(false);
  };

  

  const validateForm = () => {
    if (!editForm.first_name.trim()) {
      Alert.alert('Error', 'First name is required');
      return false;
    }
    if (!editForm.last_name.trim()) {
      Alert.alert('Error', 'Last name is required');
      return false;
    }
    if (!editForm.username.trim()) {
      Alert.alert('Error', 'Username is required');
      return false;
    }
    if (!editForm.email.trim()) {
      Alert.alert('Error', 'Email is required');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editForm.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }
    
    // Password validation (only if new password is provided)
    if (editForm.new_password) {
      if (!editForm.current_password) {
        Alert.alert('Error', 'Current password is required to change password');
        return false;
      }
      if (editForm.new_password.length < 6) {
        Alert.alert('Error', 'New password must be at least 6 characters long');
        return false;
      }
      if (editForm.new_password !== editForm.confirm_password) {
        Alert.alert('Error', 'New passwords do not match');
        return false;
      }
    }
    
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      const updateData = {
        first_name: editForm.first_name,
        middle_name: editForm.middle_name,
        last_name: editForm.last_name,
        username: editForm.username,
        email: editForm.email,
        phone_number: editForm.phone_number,
        birthdate: editForm.birthdate,
        sex_id: editForm.sex_id
      };

      // Add password fields if provided
      if (editForm.new_password) {
        updateData.current_password = editForm.current_password;
        updateData.new_password = editForm.new_password;
        updateData.confirm_password = editForm.confirm_password;
      }

      const response = await UseMethod('post', 'profile?_method=PUT', updateData);

      if (response && response.data) {
        Alert.alert('Success', 'Profile updated successfully!');
        // Update the user context with new data
        if (updateUser) {
          updateUser({
            ...user,
            email: editForm.email,
            details: {
              ...details,
              first_name: editForm.first_name,
              middle_name: editForm.middle_name,
              last_name: editForm.last_name,
              phone_number: editForm.phone_number,
              birthdate: editForm.birthdate,
              sex_id: editForm.sex_id
            }
          });
        }
        setIsEditing(false);
      } else {
        Alert.alert('Error', 'Failed to update profile. Please try again.');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri: user?.profile_picture || 'https://via.placeholder.com/80x80.png?text=User'
              }}
              style={styles.avatar}
            />
          </View>
          <Text style={styles.name}>
            {`${details.first_name || ''} ${details.middle_name || ''} ${details.last_name || ''}`.trim() || 'User Name'}
          </Text>
          <Text style={styles.username}>@{user?.username || editForm.username || 'username'}</Text>
        </View>

        {/* Stepper Navigation */}
        <View style={styles.stepperContainer}>
          {steps.map((step, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.stepButton,
                activeStep === index && styles.activeStepButton
              ]}
              onPress={() => setActiveStep(index)}
            >
              <View style={[
                styles.stepIndicator,
                activeStep === index && styles.activeStepIndicator
              ]}>
                <Text style={[
                  styles.stepNumber,
                  activeStep === index && styles.activeStepNumber
                ]}>{index + 1}</Text>
              </View>
              <Text style={[
                styles.stepLabel,
                activeStep === index && styles.activeStepLabel
              ]}>{step}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Step Content */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>
              {activeStep === 0 ? 'Personal Information' : 'Account Settings'}
            </Text>
            {!isEditing && (
              <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
                <Ionicons name="pencil" size={14} color="#fff" />
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {activeStep === 0 ? (
            // Info Step Content
            isEditing ? (
              <View style={styles.editForm}>
                <EditField
                  label="First Name"
                  value={editForm.first_name}
                  onChangeText={(text) => setEditForm({...editForm, first_name: text})}
                  placeholder="Enter first name"
                />
                
                <EditField
                  label="Middle Name"
                  value={editForm.middle_name}
                  onChangeText={(text) => setEditForm({...editForm, middle_name: text})}
                  placeholder="Enter middle name (optional)"
                />
                
                <EditField
                  label="Last Name"
                  value={editForm.last_name}
                  onChangeText={(text) => setEditForm({...editForm, last_name: text})}
                  placeholder="Enter last name"
                />
                
                <EditField
                  label="Phone Number"
                  value={editForm.phone_number}
                  onChangeText={(text) => setEditForm({...editForm, phone_number: text})}
                  placeholder="Enter phone number"
                  keyboardType="phone-pad"
                />
                
                <EditField
                  label="Birthdate"
                  value={editForm.birthdate}
                  onChangeText={(text) => setEditForm({...editForm, birthdate: text})}
                  placeholder="YYYY-MM-DD"
                />
                
                <View style={styles.fieldContainer}>
                  <Text style={styles.fieldLabel}>Gender</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={editForm.sex_id}
                      onValueChange={(value) => setEditForm({...editForm, sex_id: value})}
                      style={styles.picker}
                    >
                      <Picker.Item label="Male" value={1} />
                      <Picker.Item label="Female" value={2} />
                    </Picker>
                  </View>
                </View>
              </View>
            ) : (
              <View>
                <ProfileItem
                  icon="person"
                  label="First Name"
                  value={details.first_name || 'Not provided'}
                />
                <ProfileItem
                  icon="person"
                  label="Middle Name"
                  value={details.middle_name || 'Not provided'}
                />
                <ProfileItem
                  icon="person"
                  label="Last Name"
                  value={details.last_name || 'Not provided'}
                />
                <ProfileItem
                  icon="call"
                  label="Phone"
                  value={details.phone_number || 'Not provided'}
                />
                <ProfileItem
                  icon="calendar"
                  label="Birthdate"
                  value={details.birthdate || 'Not provided'}
                />
                <ProfileItem
                  icon="person"
                  label="Gender"
                  value={details.sex_id === 1 ? 'Male' : details.sex_id === 2 ? 'Female' : 'Not specified'}
                />
              </View>
            )
          ) : (
            // Account Step Content
            isEditing ? (
              <View style={styles.editForm}>
                <EditField
                  label="Username"
                  value={editForm.username}
                  onChangeText={(text) => setEditForm({...editForm, username: text})}
                  placeholder="Enter username"
                />
                
                <EditField
                  label="Email"
                  value={editForm.email}
                  onChangeText={(text) => setEditForm({...editForm, email: text})}
                  placeholder="Enter email address"
                  keyboardType="email-address"
                />
                
                <View style={styles.passwordSection}>
                  <Text style={styles.sectionTitle}>Change Password (Optional)</Text>
                  
                  <EditField
                    label="Current Password"
                    value={editForm.current_password}
                    onChangeText={(text) => setEditForm({...editForm, current_password: text})}
                    placeholder="Enter current password"
                    secureTextEntry
                  />
                  
                  <EditField
                    label="New Password"
                    value={editForm.new_password}
                    onChangeText={(text) => setEditForm({...editForm, new_password: text})}
                    placeholder="Enter new password"
                    secureTextEntry
                  />
                  
                  <EditField
                    label="Confirm New Password"
                    value={editForm.confirm_password}
                    onChangeText={(text) => setEditForm({...editForm, confirm_password: text})}
                    placeholder="Confirm new password"
                    secureTextEntry
                  />
                </View>
              </View>
            ) : (
              <View>
                <ProfileItem
                  icon="person-circle"
                  label="Username"
                  value={user?.username || 'Not provided'}
                />
                <ProfileItem
                  icon="mail"
                  label="Email"
                  value={user?.email || 'Not provided'}
                />
                <ProfileItem
                  icon="lock-closed"
                  label="Password"
                  value="••••••••"
                />
                <ProfileItem
                  icon="location"
                  label="Church Location"
                  value={user.location?.name || 'Not provided'}
                />
                <ProfileItem
                  icon="people"
                  label="Event Role"
                  value={user.role?.name || 'Not provided'}
                />
                {/* <ProfileItem
                  icon="shield-checkmark"
                  label="Account Type"
                  value={user?.account_type || 'Not provided'}
                /> */}
              </View>
            )
          )}
        </View>

        {/* Action Buttons */}
        {isEditing && (
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.cancelButton]} 
              onPress={handleCancel}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.saveButton]} 
              onPress={handleSave}
              disabled={isLoading}
            >
              {isLoading ? (
                <Text style={styles.saveButtonText}>Saving...</Text>
              ) : (
                <>
                  <Feather name="check" size={16} color="#fff" />
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Back Button */}
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function ProfileItem({ icon, label, value }) {
  return (
    <View style={styles.item}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={20} color="#1877f2" />
      </View>
      <View style={styles.itemContent}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
    </View>
  );
}

function EditField({ label, value, onChangeText, placeholder, keyboardType = 'default' }) {
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.textInput}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        autoCapitalize={keyboardType === 'email-address' ? 'none' : 'words'}
        placeholderTextColor="#999"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 12,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 12,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#1877f2',
  },
  // Stepper Styles
  stepperContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginHorizontal: 12,
    marginBottom: 5,
    backgroundColor: '#fff',
    borderRadius: 0,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  stepButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 1,
    paddingHorizontal: 6,
    borderRadius: 8,
  },
  activeStepButton: {
    backgroundColor: '#f0f8ff',
  },
  stepIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  activeStepIndicator: {
    backgroundColor: '#1877f2',
  },
  stepNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  activeStepNumber: {
    color: '#fff',
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748b',
  },
  activeStepLabel: {
    color: '#1877f2',
    fontWeight: '600',
  },
  avatarOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#1877f2',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a202c',
    textAlign: 'center',
    marginBottom: 2,
  },
  username: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1877f2',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#1877f2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  editButtonText: {
    color: '#1877f2',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a202c',
  },
  passwordSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
  },
  label: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 2,
  },
  value: {
    fontSize: 14,
    color: '#1a202c',
    fontWeight: '600',
  },
  editForm: {
    padding: 16,
  },
  fieldContainer: {
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#1a202c',
    backgroundColor: '#fff',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  picker: {
    height: 44,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    marginBottom: 16,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  cancelButton: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cancelButtonText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#1877f2',
    shadowColor: '#1877f2',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 1,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6b7280',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 16,
    justifyContent: 'center',
    marginHorizontal: 12,
    marginTop: 12,
    marginBottom: 20,
    shadowColor: '#6b7280',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  backText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
});
