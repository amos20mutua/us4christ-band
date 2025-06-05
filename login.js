// Import Firebase configuration
import { auth } from './firebase-config.js';
import { signInWithEmailAndPassword, setPersistence, browserLocalPersistence, browserSessionPersistence, sendPasswordResetEmail } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';

// DOM Elements
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const rememberMeCheckbox = document.getElementById('rememberMe');
const forgotPasswordLink = document.getElementById('forgotPasswordLink');
const errorMessage = document.getElementById('errorMessage');
const loginBtn = document.getElementById('loginBtn');
const loadingSpinner = loginBtn.querySelector('.loading');

// Show error message
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 5000);
}

// Handle forgot password
forgotPasswordLink.addEventListener('click', async (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    
    if (!email) {
        showError('Please enter your email address');
        return;
    }
    
    try {
        await sendPasswordResetEmail(auth, email);
        showError('Password reset email sent! Please check your inbox.');
        errorMessage.style.color = 'var(--success-color)';
    } catch (error) {
        console.error('Error sending password reset email:', error);
        showError('Error sending password reset email. Please try again.');
    }
});

// Handle login form submission
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Get form values
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const rememberMe = rememberMeCheckbox.checked;
    
    // Validate inputs
    if (!email || !password) {
        showError('Please fill in all fields');
        return;
    }
    
    try {
        // Set persistence based on Remember Me checkbox
        await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
        
        // Show loading state
        loginBtn.disabled = true;
        loadingSpinner.classList.add('active');
        
        // Attempt login
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Check if user is admin
        const idTokenResult = await user.getIdTokenResult();
        if (!idTokenResult.claims.admin) {
            // Sign out if not admin
            await auth.signOut();
            throw new Error('Access denied. Admin privileges required.');
        }
        
        // Show success message
        showError('Login successful! Redirecting...');
        
        // Redirect to dashboard
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
        
    } catch (error) {
        console.error('Login error:', error);
        let errorMessage = 'Login failed. Please try again.';
        
        switch (error.code) {
            case 'auth/invalid-email':
                errorMessage = 'Invalid email address.';
                break;
            case 'auth/user-disabled':
                errorMessage = 'This account has been disabled.';
                break;
            case 'auth/user-not-found':
                errorMessage = 'No account found with this email.';
                break;
            case 'auth/wrong-password':
                errorMessage = 'Incorrect password.';
                break;
        }
        
        showError(errorMessage);
    } finally {
        // Reset loading state
        loginBtn.disabled = false;
        loadingSpinner.classList.remove('active');
    }
});

// Check if user is already logged in
auth.onAuthStateChanged(async (user) => {
    if (user) {
        try {
            // Check if user is admin
            const idTokenResult = await user.getIdTokenResult();
            if (idTokenResult.claims.admin) {
                // Redirect to dashboard if already logged in as admin
                window.location.href = 'dashboard.html';
            } else {
                // Sign out if not admin
                await auth.signOut();
            }
        } catch (error) {
            console.error('Auth state check error:', error);
        }
    }
}); 
