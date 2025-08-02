import React, { useEffect, useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    ImageBackground, ScrollView, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { UseMethod } from '../composable/useMethod';
import Checkbox from 'expo-checkbox';
import LocationPickerModal from '../components/LocationPickerModal';

export default function RegisterRequestScreen({ navigation }) {
    const [form, setForm] = useState({
        first_name: '', last_name: '', middle_name: '',
        birthdate: '', gender: '', phone: '',
        email: '', password: '',
        account_group_id: '', account_type_id: [],
        role_id: '', // ✅ Add this
    });
    const [locationModalVisible, setLocationModalVisible] = useState(false);
const [locationAddress, setLocationAddress] = useState('');

    const [accountGroups, setAccountGroups] = useState([]);
    const [accountTypes, setAccountTypes] = useState([]);
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);

    const [roles, setRoles] = useState([]);

    useEffect(() => {
        const fetchGroupsAndRoles = async () => {
            const groupRes = await UseMethod('get', 'account-groups');
            if (groupRes?.data) setAccountGroups(groupRes.data);

            const roleRes = await UseMethod('get', 'get-roles'); // Replace with your API
            if (roleRes?.data) setRoles(roleRes.data);
        };
        fetchGroupsAndRoles();
    }, []);


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
        const required = ['first_name', 'last_name', 'birthdate', 'gender', 'phone', 'email', 'password', 'account_group_id', 'role_id'];
        required.forEach(field => {
            if (!form[field]) errs[field] = `${field.replace('_', ' ')} is required`;
        });
        if (form.account_type_id.length === 0) errs.account_type_id = "At least one account type is required";
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };


    const handleSubmit = async () => {
        if (!validate()) return;
        try {
            const res = await UseMethod('post', 'register', {
                ...form,
                is_request: 1,
                account_type_id: form.account_type_id,
                account_group_id: form.account_group_id,
                role_id: form.role_id
            });
            console.log(res)

            Alert.alert("Success", "Your request has been submitted!");
            setForm({
                first_name: '', last_name: '', middle_name: '', birthdate: '', gender: '',
                phone: '', email: '', password: '', account_group_id: '', account_type_id: []
            });
        } catch (err) {
            Alert.alert("Error", err?.response?.data?.error || "Failed to submit.");
        }
    };


    return (
        <ImageBackground source={require('../assets/login.png')} style={styles.bg}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                    <View style={styles.card}>
                        <Text style={styles.header}>Request an Account</Text>

                        <View style={styles.row}>
                            <InputField label="First Name" value={form.first_name} error={errors.first_name} onChange={val => handleChange('first_name', val)} />
                            <InputField label="Last Name" value={form.last_name} error={errors.last_name} onChange={val => handleChange('last_name', val)} />
                        </View>

                        <InputField label="Middle Name" value={form.middle_name} onChange={val => handleChange('middle_name', val)} />

                        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
                            <Text style={{ color: form.birthdate ? '#000' : '#aaa' }}>
                                {form.birthdate || 'Select Birthdate'}
                            </Text>
                        </TouchableOpacity>
                        {errors.birthdate && <Text style={styles.error}>{errors.birthdate}</Text>}
                        {showDatePicker && (
                            <DateTimePicker value={new Date()} mode="date" display="default" onChange={handleDateChange} />
                        )}

                        <View style={styles.picker}>
                            <Picker selectedValue={form.gender} onValueChange={(val) => handleChange('gender', val)}>
                                <Picker.Item label="Select Gender" value="" />
                                <Picker.Item label="Male" value="1" />
                                <Picker.Item label="Female" value="2" />
                            </Picker>
                        </View>
                        {errors.gender && <Text style={styles.error}>{errors.gender}</Text>}

                        <InputField label="Phone" value={form.phone} error={errors.phone} onChange={val => handleChange('phone', val)} keyboardType="phone-pad" />
                        <InputField label="Email" value={form.email} error={errors.email} onChange={val => handleChange('email', val)} keyboardType="email-address" />

                        <View style={styles.inputWithIcon}>
                            <TextInput
                                value={form.password}
                                onChangeText={(val) => handleChange('password', val)}
                                placeholder="Password"
                                secureTextEntry={!showPassword}
                                style={styles.inputField}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                <Ionicons name={showPassword ? "eye-off" : "eye"} size={22} color="#555" />
                            </TouchableOpacity>
                        </View>
                        {errors.password && <Text style={styles.error}>{errors.password}</Text>}
                        <View style={styles.picker}>
                            <Picker
                                selectedValue={form.role_id}
                                onValueChange={(val) => handleChange('role_id', val)}
                            >
                                <Picker.Item label="Select Role" value="" />
                                {roles.map(role => (
                                    <Picker.Item key={role.id} label={role.name} value={role.id} />
                                ))}
                            </Picker>
                        </View>
                        {errors.role_id && <Text style={styles.error}>{errors.role_id}</Text>}

                        {/* Account Group */}
                        <View style={styles.picker}>
                            <Picker selectedValue={form.account_group_id} onValueChange={(val) => handleChange('account_group_id', val)}>
                                <Picker.Item label="Select Account Group" value="" />
                                {accountGroups.map((grp) => (
                                    <Picker.Item key={grp.id} label={grp.description} value={grp.id} />
                                ))}
                            </Picker>
                        </View>
                        {errors.account_group_id && <Text style={styles.error}>{errors.account_group_id}</Text>}

                        {/* Multi-select Account Type */}
                        {accountTypes.length > 0 && (
                            <View style={styles.checkboxContainer}>
                                <Text style={{ fontWeight: 'bold', marginBottom: 6 }}>Select Account Types:</Text>
                                {accountTypes.map((type) => (
                                    <View key={type.id} style={styles.checkboxRow}>
                                        <Checkbox
                                            value={form.account_type_id.includes(type.id)}
                                            onValueChange={() => toggleAccountType(type.id)}
                                            color={form.account_type_id.includes(type.id) ? '#3b82f6' : undefined}
                                        />
                                        <Text style={styles.checkboxLabel}>{type.description}</Text>
                                    </View>
                                ))}
                                {errors.account_type_id && <Text style={styles.error}>{errors.account_type_id}</Text>}
                            </View>
                        )}
<Text style={{ fontWeight: 'bold', marginBottom: 6 }}>Your Current Location</Text>

<TouchableOpacity
  onPress={() => setLocationModalVisible(true)}
  style={[styles.input, { backgroundColor: '#e0f2fe' }]}
>
  <Text style={{ color: locationAddress ? '#000' : '#aaa' }}>
    {locationAddress || 'Pick your location'}
  </Text>
</TouchableOpacity>

<LocationPickerModal
  visible={locationModalVisible}
  onClose={() => setLocationModalVisible(false)}
  onPick={({ address, coords }) => {
    setLocationAddress(address);
    setForm((prev) => ({
      ...prev,
      location: `${coords.latitude},${coords.longitude}`,
    }));
  }}
/>


                        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                            <Text style={styles.buttonText}>Submit Request</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text style={styles.loginText}>← Back to Login</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </ImageBackground>
    );
}

const InputField = ({ label, value, onChange, error, keyboardType = "default" }) => (
    <View style={{ flex: 1, marginRight: 6 }}>
        <TextInput
            style={styles.input}
            placeholder={label}
            value={value}
            onChangeText={onChange}
            keyboardType={keyboardType}
        />
        {error && <Text style={styles.error}>{error}</Text>}
    </View>
);

const styles = StyleSheet.create({
    bg: {
        flex: 1,
    },
    container: {
        padding: 16,
        justifyContent: 'center',
        minHeight: '100%',
    },
    card: {
        backgroundColor: 'rgba(255,255,255,0.95)',
        padding: 20,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 5,
    },
    header: {
        fontSize: 24,
        marginBottom: 20,
        fontWeight: '700',
        textAlign: 'center',
        color: '#222',
    },
    input: {
        backgroundColor: '#f4f4f4',
        padding: 14,
        borderRadius: 12,
        marginBottom: 10,
        fontSize: 15,
    },
    picker: {
        backgroundColor: '#f4f4f4',
        borderRadius: 12,
        marginBottom: 10,
        paddingHorizontal: 10,
    },
    inputWithIcon: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f4f4f4',
        paddingHorizontal: 14,
        borderRadius: 12,
        marginBottom: 10,
    },
    inputField: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 15,
    },
    button: {
        backgroundColor: '#3b82f6',
        paddingVertical: 14,
        borderRadius: 12,
        marginTop: 10,
    },
    buttonText: {
        color: 'white',
        textAlign: 'center',
        fontWeight: '600',
        fontSize: 16,
    },
    loginText: {
        marginTop: 16,
        textAlign: 'center',
        color: '#3b82f6',
        fontSize: 15,
        fontWeight: '500',
    },
    error: {
        color: 'red',
        fontSize: 12,
        marginBottom: 8,
        paddingLeft: 5,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    checkboxContainer: {
        marginTop: 10,
        marginBottom: 10,
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    checkboxLabel: {
        marginLeft: 8,
        fontSize: 15,
    },
});
