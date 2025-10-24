import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground, ScrollView, Alert, KeyboardAvoidingView, Platform,
    Dimensions, Modal
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { UseMethod } from '../composable/useMethod';
import Checkbox from 'expo-checkbox';

import { LinearGradient } from 'expo-linear-gradient';

export default function RegisterRequestScreen({ navigation }) {
    const [currentStep, setCurrentStep] = useState(1);
    const [form, setForm] = useState({
        first_name: '', last_name: '', middle_name: '',
        birthdate: '', gender: '', phone: '',
        email: '', username: '', password: '', confirm_password: '',
        account_group_id: '', account_type_id: [],
        church_location: '',
    });

    // OTP state
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState('');
    const [otpLoading, setOtpLoading] = useState(false);
    const [otpError, setOtpError] = useState('');
    const [otpModalVisible, setOtpModalVisible] = useState(false);

    const [accountGroups, setAccountGroups] = useState([]);
    const [accountTypes, setAccountTypes] = useState([]);
    const [churchLocations, setChurchLocations] = useState([]);
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    
    const totalSteps = 3;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const groupRes = await UseMethod('get', 'account-groups');
                if (groupRes?.data) setAccountGroups(groupRes.data);


                
                // Fetch church locations from API like in web
                const locationsResponse = await UseMethod('get', 'get-church-locations');
                if (locationsResponse?.data) {
                    setChurchLocations(locationsResponse.data);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, []);
    
    const nextStep = () => {
        if (validateCurrentStep()) {
            setCurrentStep(prev => Math.min(prev + 1, totalSteps));
        }
    };
    
    const prevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };
    
    const validateCurrentStep = () => {
        let errs = {};
        
        if (currentStep === 1) {
            const required = ['first_name', 'last_name', 'birthdate', 'gender'];
            required.forEach(field => {
                if (!form[field]) errs[field] = `${field.replace('_', ' ')} is required`;
            });
        } else if (currentStep === 2) {
            const required = ['phone', 'email', 'username', 'password', 'confirm_password'];
            required.forEach(field => {
                if (!form[field]) errs[field] = `${field.replace('_', ' ')} is required`;
            });
            if (form.password !== form.confirm_password) errs.confirm_password = "Passwords do not match";
        } else if (currentStep === 3) {
            if (!form.church_location) errs.church_location = "Church location is required";
            if (!form.account_group_id) errs.account_group_id = "Account group is required";
            // Account type validation removed per request
        }
        
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };


    const fetchTypes = async (groupId) => {
        const res = await UseMethod('get', `account-types/${groupId}`);
        if (res?.data) setAccountTypes(res.data);
    };

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
        setErrors(prev => ({ ...prev, [field]: null }));

        // If account group is changed, fetch its account types
        if (field === 'account_group_id') {
            fetchTypes(value); // ✅ call this when group is changed
            setForm(prev => ({ ...prev, account_group_id: value, account_type_id: [] }));
        }
    };


    const toggleAccountType = (id) => {
        setForm(prev => {
            const exists = prev.account_type_id.includes(id);
            const updatedTypes = exists
                ? prev.account_type_id.filter(t => t !== id)
                : [...prev.account_type_id, id];
            return { ...prev, account_type_id: updatedTypes };
        });
    };

    const handleDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            handleChange('birthdate', selectedDate.toISOString().split('T')[0]);
        }
    };
    const validate = () => {
        let errs = {};
        const required = ['first_name', 'last_name', 'birthdate', 'gender', 'phone', 'email', 'username', 'password', 'confirm_password', 'account_group_id', 'church_location'];
        required.forEach(field => {
            if (!form[field]) errs[field] = `${field.replace('_', ' ')} is required`;
        });
        // Account type validation removed per request
        if (form.password !== form.confirm_password) errs.confirm_password = "Passwords do not match";
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };


    const handleSubmit = async () => {
        if (!validate()) return;
        try {
            setOtpLoading(true);
            setOtpError('');

            if (!otpSent) {
                // Step 1: Request registration OTP (mirror web payload)
                const payload = {
                    email: form.email,
                    registration_data: {
                        is_request: 1,
                        username: form.username,
                        email: form.email,
                        password: form.password,
                        password_confirmation: form.confirm_password,
                        first_name: form.first_name,
                        last_name: form.last_name,
                        middle_name: form.middle_name,
                        gender: form.gender,
                        location: form.church_location,
                        group_id: form.account_group_id,
                    }
                };

                const res = await UseMethod('post', 'generate-registration-otp', payload);
                if (res && res.status === 200) {
                    Alert.alert('OTP Sent', 'An OTP was sent to your email. Please enter it to verify.');
                    setOtpSent(true);
                    setOtpModalVisible(true);
                } else {
                    Alert.alert('Error', res?.data?.message || 'Failed to send OTP. Please try again.');
                }
            } else {
                // Step 2: Verify OTP to complete registration
                const verifyPayload = { email: form.email, otp };
                const res = await UseMethod('post', 'verify-registration-otp', verifyPayload);
                if (res && (res.status === 200 || res.status === 201)) {
                     Alert.alert('Success', 'Registration request submitted! Awaiting approval.');
                     // Reset form and wizard
                     setForm({
                         first_name: '', last_name: '', middle_name: '', birthdate: '', gender: '',
                         phone: '', email: '', username: '', password: '', confirm_password: '', account_group_id: '', 
                         account_type_id: [], church_location: ''
                     });
                     setCurrentStep(1);
                     setOtp('');
                     setOtpSent(false);
                     setOtpModalVisible(false);
                 } else {
                     setOtpError('Invalid OTP. Please try again.');
                     Alert.alert('Error', res?.data?.message || 'OTP verification failed. Please try again.');
                 }
            }
        } catch (err) {
            console.log('Registration error:', err);
            Alert.alert('Error', 'Something went wrong. Please check your connection.');
        } finally {
            setOtpLoading(false);
        }
    };


    return (
        <ImageBackground source={require('../assets/login.png')} style={styles.bg}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                    <View style={styles.mainCard}>
                        {/* Header */}
                        <LinearGradient
                            colors={['#667eea', '#764ba2']}
                            style={styles.headerGradient}
                        >
                            <MaterialIcons name="person-add" size={28} color="white" />
                            <Text style={styles.headerTitle}>Request Account</Text>
                        </LinearGradient>
                        
                        {/* Step Indicator */}
                        <View style={styles.stepIndicator}>
                            {[1, 2, 3].map((step) => (
                                <View key={step} style={styles.stepContainer}>
                                    <View style={[
                                        styles.stepCircle,
                                        currentStep >= step && styles.stepCircleActive
                                    ]}>
                                        <Text style={[
                                            styles.stepText,
                                            currentStep >= step && styles.stepTextActive
                                        ]}>{step}</Text>
                                    </View>
                                    {step < 4 && (
                                        <View style={[
                                            styles.stepLine,
                                            currentStep > step && styles.stepLineActive
                                        ]} />
                                    )}
                                </View>
                            ))}
                        </View>
                        
                        {/* Step Titles */}
                        <View style={styles.stepTitles}>
                            <Text style={styles.stepTitle}>
                                {currentStep === 1 && "Personal Information"}
                            {currentStep === 2 && "Contact & Account"}
                            {currentStep === 3 && "Church & Groups"}
                            </Text>
                        </View>

                        {/* Step 1: Personal Information */}
                        {currentStep === 1 && (
                            <View style={styles.sectionCard}>
                                <View style={styles.row}>
                                    <InputField 
                                        label="First Name" 
                                        value={form.first_name} 
                                        error={errors.first_name} 
                                        onChange={val => handleChange('first_name', val)}
                                        icon="person"
                                    />
                                   
                                </View>
                                <View style={styles.row}>
                                   
                                    <InputField 
                                        label="Last Name" 
                                        value={form.last_name} 
                                        error={errors.last_name} 
                                        onChange={val => handleChange('last_name', val)}
                                        icon="person"
                                    />
                                </View>

                                <InputField 
                                    label="Middle Name" 
                                    value={form.middle_name} 
                                    onChange={val => handleChange('middle_name', val)}
                                    icon="person-outline"
                                />

                                <View style={styles.datePickerContainer}>
                                    <Text style={styles.inputLabel}>Birthdate</Text>
                                    <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateInput}>
                                        <Ionicons name="calendar" size={20} color="#3b82f6" style={styles.inputIcon} />
                                        <Text style={form.birthdate ? styles.dateText : styles.placeholderText}>
                                            {form.birthdate ? form.birthdate : 'Select Birthdate'}
                                        </Text>
                                    </TouchableOpacity>
                                    {errors.birthdate && <Text style={styles.errorText}>{errors.birthdate}</Text>}
                                </View>

                                {showDatePicker && (
                                    <DateTimePicker
                                        value={form.birthdate ? new Date(form.birthdate) : new Date()}
                                        mode="date"
                                        display="default"
                                        onChange={handleDateChange}
                                    />
                                )}

                                <View style={styles.pickerContainer}>
                                       <Text style={styles.inputLabel}>Gender</Text>
                                    <View style={styles.pickerWrapper}>
                                        
                                        <FontAwesome5 name="venus-mars" size={16} color="#3b82f6" style={styles.inputIcon} />
                                        <Picker
                                            selectedValue={form.gender}
                                            onValueChange={(itemValue) => handleChange('gender', itemValue)}
                                            style={{width: '80%' }}
                                        >
                                            <Picker.Item label="Select Gender" value="" />
                                            <Picker.Item label="Male" value={1} />
                                            <Picker.Item label="Female" value={2} />
                                        </Picker>
                                    </View>
                                    {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}
                                </View>
                            </View>
                        )}

                        {/* Step 2: Contact & Account */}
                        {currentStep === 2 && (
                            <View style={styles.sectionCard}>
                                <InputField 
                                    label="Phone" 
                                    value={form.phone} 
                                    error={errors.phone} 
                                    onChange={val => handleChange('phone', val)} 
                                    keyboardType="phone-pad"
                                    icon="call"
                                />
                                <InputField 
                                    label="Email" 
                                    value={form.email} 
                                    error={errors.email} 
                                    onChange={val => handleChange('email', val)} 
                                    keyboardType="email-address"
                                    icon="mail"
                                />
                                <InputField 
                                    label="Username" 
                                    value={form.username} 
                                    error={errors.username} 
                                    onChange={val => handleChange('username', val)} 
                                    icon="person-circle"
                                />
                                <InputField 
                                    label="Password" 
                                    value={form.password} 
                                    error={errors.password} 
                                    onChange={val => handleChange('password', val)} 
                                    secureTextEntry
                                    icon="lock-closed"
                                />
                                <InputField 
                                    label="Confirm Password" 
                                    value={form.confirm_password} 
                                    error={errors.confirm_password} 
                                    onChange={val => handleChange('confirm_password', val)} 
                                    secureTextEntry
                                    icon="lock-closed"
                                />
                            </View>
                        )}

                        {/* Step 3: Church & Groups */}
                        {currentStep === 3 && (
                            <View style={styles.sectionCard}>
                                <View style={styles.pickerContainer}>
                                    <Text style={styles.inputLabel}>Church Location</Text>
                                    <View style={styles.pickerWrapper}>
                                        <MaterialIcons name="location-on" size={16} color="#3b82f6" style={styles.inputIcon} />
                                        <Picker
                                            selectedValue={form.church_location}
                                            onValueChange={(itemValue) => handleChange('church_location', itemValue)}
                                            style={{width: '94%'}}
                                        >
                                            <Picker.Item label="Select Church Location" value="" />
                                            {churchLocations.map((location) => (
                                                <Picker.Item key={location.id} label={location.name} value={location.id} />
                                            ))}
                                        </Picker>
                                    </View>
                                    {errors.church_location && <Text style={styles.errorText}>{errors.church_location}</Text>}
                                </View>
                                


                                <View style={styles.pickerContainer}>
                                    <Text style={styles.inputLabel}>Account Group</Text>
                                    <View style={styles.pickerWrapper}>
                                        <MaterialIcons name="group" size={16} color="#3b82f6" style={styles.inputIcon} />
                                        <Picker
                                            selectedValue={form.account_group_id}
                                            onValueChange={(itemValue) => handleChange('account_group_id', itemValue)}
                                            style={{width: '94%'}}
                                        >
                                            <Picker.Item label="Select Account Group" value="" />
                                            {accountGroups.map((group) => (
                                                <Picker.Item key={group.id} label={group.description} value={group.id} />
                                            ))}
                                        </Picker>
                                    </View>
                                    {errors.account_group_id && <Text style={styles.errorText}>{errors.account_group_id}</Text>}
                                </View>

                                {/* Account Type selection removed per request */}
                            </View>
                        )}




                        {/* Navigation Buttons */}
                        <View style={styles.navigationContainer}>
                            {currentStep > 1 && (
                                <TouchableOpacity onPress={prevStep} style={styles.prevButton}>
                                    <Text style={styles.prevButtonText}>Previous</Text>
                                </TouchableOpacity>
                            )}
                            
                            {currentStep < totalSteps ? (
                                <TouchableOpacity onPress={nextStep} style={styles.nextButton}>
                                    <LinearGradient
                                        colors={['#3b82f6', '#1d4ed8']}
                                        style={styles.nextButtonInner}
                                    >
                                        <Text style={styles.nextButtonText}>Next</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            ) : (
                                <LinearGradient
                                    colors={['#3b82f6', '#1d4ed8']}
                                    style={styles.submitButton}
                                >
                                    <TouchableOpacity onPress={handleSubmit} style={styles.submitButtonInner} disabled={otpLoading}>
                                        <MaterialIcons name={otpSent ? 'verified' : 'send'} size={20} color="white" style={{ marginRight: 8 }} />
                                        <Text style={styles.submitButtonText}>{otpSent ? 'Verify OTP & Submit' : 'Submit Request'}</Text>
                                    </TouchableOpacity>
                                </LinearGradient>
                            )}
                        </View>

                        {/* OTP Entry Section replaced with Modal */}
                        {/* <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={16} color="#3b82f6" style={{ marginRight: 4 }} />
                            <Text style={styles.backButtonText}>Back to Login</Text>
                        </TouchableOpacity> */}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
            <Modal
                visible={otpModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setOtpModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <Text style={styles.otpTitle}>Verify OTP</Text>
                        <Text style={styles.otpSubtitle}>Enter the 6-digit code sent to {form.email}.</Text>
                        <TextInput
                            value={otp}
                            onChangeText={(v) => { setOtp(v.replace(/[^0-9]/g, '')); setOtpError(''); }}
                            keyboardType='number-pad'
                            maxLength={6}
                            placeholder='OTP code'
                            placeholderTextColor='#9ca3af'
                        />

                        {!!otpError && <Text style={styles.errorText}>{otpError}</Text>}

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
                            <TouchableOpacity onPress={handleSubmit} style={styles.otpVerifyBtn} disabled={otpLoading}>
                                <Text style={styles.otpVerifyText}>{otpLoading ? 'Verifying...' : 'Verify & Submit'}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setOtpModalVisible(false)} style={[styles.prevButton, { alignSelf: 'center' }] }>
                                <Text style={styles.prevButtonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity onPress={() => { setOtpSent(false); setOtp(''); setOtpError(''); setTimeout(() => { setOtpSent(true); handleSubmit(); }, 50); }}>
                            <Text style={styles.resendText}>Resend OTP</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ImageBackground>
    );
}

const InputField = ({ label, value, onChange, error, keyboardType = "default", secureTextEntry, icon }) => (
    <View style={{ flex: 1, marginHorizontal: 4 }}>
        <Text style={styles.inputLabel}>{label}</Text>
        <View style={styles.inputWithIcon}>
            {icon && <Ionicons name={icon} size={16} color="#3b82f6" style={styles.inputIcon} />}
            <TextInput
                style={styles.inputField}
                value={value}
                onChangeText={onChange}
                keyboardType={keyboardType}
                secureTextEntry={secureTextEntry}
                placeholder={`Enter ${label.toLowerCase()}`}
                placeholderTextColor="#9ca3af"
            />
        </View>
        {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
);

const styles = StyleSheet.create({
    bg: {
        flex: 1,
    },
    container: {
         padding: 12,
         paddingBottom: 24,
     },
     mainCard: {
         backgroundColor: 'rgba(255,255,255,0.98)',
         borderRadius: 20,
         overflow: 'hidden',
         shadowColor: '#000',
         shadowOffset: { width: 0, height: 4 },
         shadowOpacity: 0.12,
         shadowRadius: 12,
         elevation: 8,
         marginVertical: 12,
         marginHorizontal: 4,
     },
     headerGradient: {
         flexDirection: 'row',
         alignItems: 'center',
         justifyContent: 'center',
         paddingVertical: 16,
         paddingHorizontal: 20,
     },
     headerTitle: {
         fontSize: 20,
         fontWeight: '700',
         color: 'white',
         marginLeft: 10,
     },
     sectionCard: {
         backgroundColor: '#fff',
         marginHorizontal: 12,
         marginVertical: 6,
         borderRadius: 12,
         padding: 16,
         shadowColor: '#000',
         shadowOffset: { width: 0, height: 1 },
         shadowOpacity: 0.06,
         shadowRadius: 4,
         elevation: 2,
     },
    sectionHeader: {
         flexDirection: 'row',
         alignItems: 'center',
         marginBottom: 12,
         paddingBottom: 6,
         borderBottomWidth: 1,
         borderBottomColor: '#f1f5f9',
     },
     sectionTitle: {
         fontSize: 14,
         fontWeight: '600',
         color: '#1e293b',
         marginLeft: 6,
     },
     inputLabel: {
         fontSize: 12,
         fontWeight: '600',
         color: '#374151',
         marginBottom: 6,
     },
     input: {
         backgroundColor: '#f8fafc',
         borderWidth: 1,
         borderColor: '#e2e8f0',
         padding: 12,
         borderRadius: 10,
         fontSize: 14,
         color: '#1e293b',
         marginBottom: 8,
         minHeight: 44,
     },
     inputWithIcon: {
         flexDirection: 'row',
         alignItems: 'center',
         backgroundColor: '#f8fafc',
         borderWidth: 1,
         borderColor: '#e2e8f0',
         borderRadius: 10,
         paddingHorizontal: 12,
         marginBottom: 8,
         minHeight: 44,
     },
     inputField: {
         flex: 1,
         paddingVertical: 12,
         fontSize: 14,
         color: '#1e293b',
         marginLeft: 8,
     },
     inputIcon: {
         marginRight: 8,
     },
    datePickerContainer: {
         marginBottom: 8,
     },
     dateInput: {
         flexDirection: 'row',
         alignItems: 'center',
         backgroundColor: '#f8fafc',
         borderWidth: 1,
         borderColor: '#e2e8f0',
         borderRadius: 10,
         padding: 12,
         minHeight: 44,
     },
     dateText: {
         fontSize: 14,
         color: '#1e293b',
         marginLeft: 8,
     },
     placeholderText: {
         fontSize: 14,
         color: '#9ca3af',
         marginLeft: 8,
     },
     pickerContainer: {
         marginBottom: 8,
     },
     pickerWrapper: {
         flexDirection: 'row',
         alignItems: 'center',
         backgroundColor: '#f8fafc',
         borderWidth: 1,
         borderColor: '#e2e8f0',
         borderRadius: 10,
         paddingLeft: 12,
         minHeight: 44,
     },
     picker: {
         flex: 1,
         height: 44,
         marginLeft: 6,
     },
     accountTypeContainer: {
         marginBottom: 12,
     },
     checkboxGrid: {
         gap: 6,
     },
     checkboxCard: {
         flexDirection: 'row',
         alignItems: 'center',
         backgroundColor: '#f8fafc',
         borderWidth: 1,
         borderColor: '#e2e8f0',
         borderRadius: 10,
         padding: 12,
         marginBottom: 6,
         minHeight: 44,
     },
     checkboxCardSelected: {
         backgroundColor: '#eff6ff',
         borderColor: '#3b82f6',
     },
     checkboxLabel: {
         fontSize: 13,
         color: '#374151',
         marginLeft: 8,
         flex: 1,
     },
     checkboxLabelSelected: {
         color: '#1e40af',
         fontWeight: '500',
     },
    locationContainer: {
         marginBottom: 8,
     },
     locationInput: {
         flexDirection: 'row',
         alignItems: 'center',
         backgroundColor: '#f8fafc',
         borderWidth: 1,
         borderColor: '#e2e8f0',
         borderRadius: 10,
         padding: 12,
         minHeight: 44,
     },
     locationText: {
         flex: 1,
         fontSize: 14,
         color: '#1e293b',
         marginLeft: 8,
     },
     navigationContainer: {
         flexDirection: 'row',
         justifyContent: 'flex-end',
         alignItems: 'center',
         gap:5,
         marginTop: 20,
         paddingHorizontal: 4,
     },
     prevButton: {
         paddingVertical: 8,
         paddingHorizontal: 20,
         borderRadius: 8,
         borderWidth: 1,
         borderColor: '#3b82f6',
         backgroundColor: 'transparent',
     },
     prevButtonText: {
         color: '#3b82f6',
         fontSize: 14,
         fontWeight: '600',
         textAlign: 'center',
     },
     nextButton: {
         borderRadius: 8,
         shadowColor: '#000',
         shadowOffset: { width: 0, height: 2 },
         shadowOpacity: 0.1,
         shadowRadius: 4,
         elevation: 3,
         margin:6
     },
     nextButtonInner: {
         paddingVertical: 10,
         paddingHorizontal: 20,
         borderRadius: 8,
         flexDirection: 'row',
         alignItems: 'center',
         justifyContent: 'center',
     },
     nextButtonText: {
         color: 'white',
         fontSize: 14,
         fontWeight: '600',
     },
     submitButton: {
         borderRadius: 12,
         
         margin :12,
         marginTop: 16,
         marginBottom: 12,
         shadowColor: '#3b82f6',
         shadowOffset: { width: 0, height: 2 },
         shadowOpacity: 0.2,
         shadowRadius: 4,
         elevation: 4,
     },
     submitButtonInner: {
         flexDirection: 'row',
         alignItems: 'center',
         justifyContent: 'center',
         paddingVertical: 14,
         paddingHorizontal: 20,
     },
     submitButtonText: {
         color: 'white',
         fontSize: 15,
         fontWeight: '600',
     },
     backButton: {
         flexDirection: 'row',
         alignItems: 'center',
         justifyContent: 'center',
         marginHorizontal: 12,
         marginBottom: 12,
         paddingVertical: 10,
     },
     backButtonText: {
         color: '#3b82f6',
         fontSize: 14,
         fontWeight: '500',
     },
     errorText: {
         color: '#ef4444',
         fontSize: 11,
         marginTop: 2,
         marginLeft: 2,
     },
     row: {
         flexDirection: 'row',
         gap: 8,
         marginBottom: 8,
     },
     stepIndicator: {
         flexDirection: 'row',
         alignItems: 'center',
         justifyContent: 'center',
         marginVertical: 16,
         paddingHorizontal: 20,
     },
     stepContainer: {
         flexDirection: 'row',
         alignItems: 'center',
         flex: 1,
     },
     stepCircle: {
         width: 24,
         height: 24,
         borderRadius: 12,
         alignItems: 'center',
         justifyContent: 'center',
         borderWidth: 2,
         backgroundColor: 'transparent',
         borderColor: '#d1d5db',
     },
     stepCircleActive: {
         backgroundColor: '#3b82f6',
         borderColor: '#3b82f6',
     },
     stepText: {
         fontSize: 12,
         fontWeight: '600',
         color: '#9ca3af',
     },
     stepTextActive: {
         color: 'white',
     },
     stepLine: {
         flex: 1,
         height: 2,
         backgroundColor: '#d1d5db',
         marginHorizontal: 8,
     },
     stepLineActive: {
         backgroundColor: '#3b82f6',
     },
     stepTitles: {
         alignItems: 'center',
         marginBottom: 16,
     },
     stepTitle: {
         fontSize: 16,
         fontWeight: '600',
         color: '#1f2937',
         textAlign: 'center',
     },
     // OTP styles
     otpCard: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginTop: 16, elevation: 2 },
     otpTitle: { fontWeight: '700', fontSize: 16 },
     otpSubtitle: { color: '#555', marginTop: 4 },
     otpRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
     otpInput: { flex: 1, backgroundColor: '#f8fafc', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginRight: 8, color: '#111', },
     otpVerifyBtn: { backgroundColor: '#3b82f6', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
     otpVerifyText: { color: '#fff', fontWeight: '600' },
     resendText: { color: '#1d4ed8', marginTop: 8 },
     modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
     },
     modalCard: {
        width: '100%',
        maxWidth: 420,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 5,
     },
});
