import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown, FadeInUp, Layout } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { API_URL } from '../../constants/api';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

type AuthMode = 'LOGIN' | 'SIGNUP' | 'FORGOT_PASSWORD' | 'VERIFY_OTP' | 'RESET_PASSWORD';

export default function AuthCard() {
    const router = useRouter();
    const { signIn } = useAuth();
    const [mode, setMode] = useState<AuthMode>('LOGIN');
    const [loading, setLoading] = useState(false);

    // Form States
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');

    // For Login only (Username or Email)
    const [loginIdentifier, setLoginIdentifier] = useState('');

    // Password Visibility
    const [showPassword, setShowPassword] = useState(false);

    const resetForm = () => {
        setEmail('');
        setPassword('');
        setName('');
        setOtp('');
        setNewPassword('');
        setLoginIdentifier('');
    };

    const handleLogin = async () => {
        if (!loginIdentifier) {
            Alert.alert('Error', 'Please enter username or email');
            return;
        }
        if (!password) {
            Alert.alert('Error', 'Please enter password');
            return;
        }

        setLoading(true);
        try {
            // Determine if identifier is email or username (simple check)
            const isEmail = loginIdentifier.includes('@');
            const payload = {
                username: !isEmail ? loginIdentifier : undefined,
                email: isEmail ? loginIdentifier : undefined,
                password
            };

            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await response.json();

            if (response.ok) {
                // Alert.alert('Success', 'Logged in successfully');
                await signIn(data.token, data.user);
            } else {
                Alert.alert('Login Failed', data.message || 'Something went wrong');
            }
        } catch (error) {
            Alert.alert('Error', 'Network error or server unreachable');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async () => {
        if (!email || !password || !name) {
            Alert.alert('Error', 'All fields are required');
            return;
        }
        setLoading(true);
        try {
            // Auto-generate username from email
            const emailPrefix = email.split('@')[0];
            const randomSuffix = Math.floor(1000 + Math.random() * 9000);
            const generatedUsername = `${emailPrefix}${randomSuffix}`;

            const response = await fetch(`${API_URL}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: generatedUsername,
                    email,
                    password,
                    name
                }),
            });
            const data = await response.json();

            if (response.ok) {
                Alert.alert('Success', 'Account created! Please login.');
                setMode('LOGIN');
                resetForm();
            } else {
                Alert.alert('Signup Failed', data.message || 'Something went wrong');
            }
        } catch (error) {
            Alert.alert('Error', 'Network error');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!email) {
            Alert.alert('Error', 'Please enter your email');
            return;
        }
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await response.json();

            if (response.ok) {
                Alert.alert('OTP Sent', 'Check your email for the OTP.');
                setMode('VERIFY_OTP');
            } else {
                Alert.alert('Error', data.message || 'Failed to send OTP');
            }
        } catch (error) {
            Alert.alert('Error', 'Network error');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp) {
            Alert.alert('Error', 'Please enter OTP');
            return;
        }
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp }),
            });
            const data = await response.json();

            if (response.ok) {
                setMode('RESET_PASSWORD');
            } else {
                Alert.alert('Error', data.message || 'Invalid OTP');
            }
        } catch (error) {
            Alert.alert('Error', 'Network error');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!newPassword) {
            Alert.alert('Error', 'Please enter new password');
            return;
        }
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp, newPassword }),
            });
            const data = await response.json();

            if (response.ok) {
                Alert.alert('Success', 'Password reset successfully. Please login.');
                setMode('LOGIN');
                resetForm();
            } else {
                Alert.alert('Error', data.message || 'Failed to reset password');
            }
        } catch (error) {
            Alert.alert('Error', 'Network error');
        } finally {
            setLoading(false);
        }
    };

    const renderHeader = () => {
        switch (mode) {
            case 'LOGIN': return 'Welcome Back';
            case 'SIGNUP': return 'Create Account';
            case 'FORGOT_PASSWORD': return 'Forgot Password';
            case 'VERIFY_OTP': return 'Verify Email';
            case 'RESET_PASSWORD': return 'New Password';
        }
    };

    const renderSubHeader = () => {
        switch (mode) {
            case 'LOGIN': return 'Sign in to continue';
            case 'SIGNUP': return 'Join our community today';
            case 'FORGOT_PASSWORD': return 'Enter your email to receive an OTP';
            case 'VERIFY_OTP': return `Enter the OTP sent to ${email}`;
            case 'RESET_PASSWORD': return 'Create a strong, unique password';
        }
    };

    return (
        <LinearGradient
            colors={['#4A00E0', '#8E2DE2']}
            style={styles.container}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} scrollEnabled={false}>
                    <Animated.View layout={Layout.springify()} entering={FadeInDown.duration(600)} style={styles.card}>
                        <BlurView intensity={80} tint="light" style={styles.blurContainer}>

                            <Text style={styles.header}>{renderHeader()}</Text>
                            <Text style={styles.subHeader}>{renderSubHeader()}</Text>

                            {/* INPUT FIELDS */}
                            <View style={styles.inputContainer}>

                                {/* LOGIN: Username or Email */}
                                {mode === 'LOGIN' && (
                                    <View style={styles.inputWrapper}>
                                        <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Username or Email"
                                            placeholderTextColor="#999"
                                            value={loginIdentifier}
                                            onChangeText={setLoginIdentifier}
                                            autoCapitalize="none"
                                        />
                                    </View>
                                )}

                                {/* SIGNUP: Name */}
                                {mode === 'SIGNUP' && (
                                    <Animated.View entering={FadeInUp} exiting={FadeInUp}>
                                        <View style={styles.inputWrapper}>
                                            <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
                                            <TextInput
                                                style={styles.input}
                                                placeholder="Full Name"
                                                placeholderTextColor="#999"
                                                value={name}
                                                onChangeText={setName}
                                            />
                                        </View>
                                    </Animated.View>
                                )}

                                {/* REMOVED USERNAME INPUT FOR SIGNUP AS REQUESTED */}

                                {/* SIGNUP or FORGOT_PASSWORD: Email */}
                                {(mode === 'SIGNUP' || mode === 'FORGOT_PASSWORD') && (
                                    <Animated.View entering={FadeInUp} exiting={FadeInUp}>
                                        <View style={styles.inputWrapper}>
                                            <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
                                            <TextInput
                                                style={styles.input}
                                                placeholder="Email Address"
                                                placeholderTextColor="#999"
                                                value={email}
                                                onChangeText={setEmail}
                                                keyboardType="email-address"
                                                autoCapitalize="none"
                                            />
                                        </View>
                                    </Animated.View>
                                )}

                                {/* VERIFY_OTP: OTP Input */}
                                {mode === 'VERIFY_OTP' && (
                                    <Animated.View entering={FadeInUp} exiting={FadeInUp}>
                                        <View style={styles.inputWrapper}>
                                            <Ionicons name="keypad-outline" size={20} color="#666" style={styles.inputIcon} />
                                            <TextInput
                                                style={styles.input}
                                                placeholder="Enter OTP"
                                                placeholderTextColor="#999"
                                                value={otp}
                                                onChangeText={setOtp}
                                                keyboardType="number-pad"
                                                maxLength={6}
                                            />
                                        </View>
                                    </Animated.View>
                                )}

                                {/* LOGIN or SIGNUP or RESET_PASSWORD: Password */}
                                {(mode === 'LOGIN' || mode === 'SIGNUP') && (
                                    <View style={styles.inputWrapper}>
                                        <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Password"
                                            placeholderTextColor="#999"
                                            value={password}
                                            onChangeText={setPassword}
                                            secureTextEntry={!showPassword}
                                        />
                                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                            <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#666" />
                                        </TouchableOpacity>
                                    </View>
                                )}

                                {/* RESET_PASSWORD: New Password */}
                                {mode === 'RESET_PASSWORD' && (
                                    <View style={styles.inputWrapper}>
                                        <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="New Password"
                                            placeholderTextColor="#999"
                                            value={newPassword}
                                            onChangeText={setNewPassword}
                                            secureTextEntry={!showPassword}
                                        />
                                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                            <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#666" />
                                        </TouchableOpacity>
                                    </View>
                                )}

                            </View>

                            {/* FORGOT PASSWORD LINK */}
                            {mode === 'LOGIN' && (
                                <TouchableOpacity onPress={() => setMode('FORGOT_PASSWORD')} style={styles.forgotPass}>
                                    <Text style={styles.forgotPassText}>Forgot Password?</Text>
                                </TouchableOpacity>
                            )}

                            {/* ACTION BUTTON */}
                            <TouchableOpacity
                                style={styles.button}
                                onPress={() => {
                                    if (mode === 'LOGIN') handleLogin();
                                    else if (mode === 'SIGNUP') handleSignup();
                                    else if (mode === 'FORGOT_PASSWORD') handleForgotPassword();
                                    else if (mode === 'VERIFY_OTP') handleVerifyOtp();
                                    else if (mode === 'RESET_PASSWORD') handleResetPassword();
                                }}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.buttonText}>
                                        {mode === 'LOGIN' ? 'Sign In' :
                                            mode === 'SIGNUP' ? 'Sign Up' :
                                                mode === 'FORGOT_PASSWORD' ? 'Send OTP' :
                                                    mode === 'VERIFY_OTP' ? 'Verify OTP' :
                                                        'Reset Password'}
                                    </Text>
                                )}
                            </TouchableOpacity>


                            {/* TOGGLE MODES */}
                            <View style={styles.footer}>
                                {mode === 'LOGIN' ? (
                                    <View style={styles.footerRow}>
                                        <Text style={styles.footerText}>Don't have an account? </Text>
                                        <TouchableOpacity onPress={() => { setMode('SIGNUP'); resetForm(); }}>
                                            <Text style={styles.footerLink}>Sign Up</Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : mode === 'SIGNUP' ? (
                                    <View style={styles.footerRow}>
                                        <Text style={styles.footerText}>Already have an account? </Text>
                                        <TouchableOpacity onPress={() => { setMode('LOGIN'); resetForm(); }}>
                                            <Text style={styles.footerLink}>Sign In</Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <TouchableOpacity onPress={() => { setMode('LOGIN'); resetForm(); }} style={{ marginTop: 10 }}>
                                        <Text style={styles.footerLink}>Back to Login</Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                        </BlurView>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
        justifyContent: 'center',
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    card: {
        width: width * 0.9,
        maxWidth: 400,
        borderRadius: 25,
        overflow: 'hidden',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderColor: 'rgba(255, 255, 255, 0.3)',
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    blurContainer: {
        padding: 25,
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.75)',
    },
    header: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginBottom: 5,
        textAlign: 'center',
    },
    subHeader: {
        fontSize: 14,
        color: '#555',
        marginBottom: 30,
        textAlign: 'center',
    },
    inputContainer: {
        width: '100%',
        gap: 15,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 14,
        paddingHorizontal: 15,
        height: 56, // Slightly taller for modern feel
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        height: '100%',
        color: '#333',
        fontSize: 16,
    },
    forgotPass: {
        alignSelf: 'flex-end',
        marginTop: 12,
        marginBottom: 24,
    },
    forgotPassText: {
        color: '#4A00E0',
        fontSize: 14,
        fontWeight: '600',
    },
    button: {
        width: '100%',
        height: 56,
        backgroundColor: '#4A00E0',
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        shadowColor: '#4A00E0',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    footer: {
        marginTop: 30,
        alignItems: 'center',
    },
    footerRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    footerText: {
        color: '#666',
        fontSize: 15,
    },
    footerLink: {
        color: '#4A00E0',
        fontSize: 15,
        fontWeight: 'bold',
    },
});
