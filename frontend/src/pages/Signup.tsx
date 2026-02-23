import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { Mail, Lock, User, UserPlus, AlertCircle, Loader2, FileText } from 'lucide-react';
import "../components/AuthForm.css";

const Signup = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) return;

    try {
      setError("");
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: fullName });
      navigate('/dashboard');
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError("This email is already in use.");
      } else if (err.code === 'auth/weak-password') {
        setError("Password should be at least 6 characters.");
      } else {
        setError("Failed to create an account. Try again.");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      setError("");
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
      navigate('/dashboard');
    } catch (err: any) {
      setError("Failed to sign up with Google.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split-container">
      {/* Add reverse-layout class here to flip sides for signup */}
      <div className="auth-split-wrapper">

        {/* Sign up form area */}
        <div className="auth-form-section">
          <div className="auth-form-content">
            <div className="auth-header">
              <div className="auth-logo-icon">
                <FileText size={28} />
              </div>
              <h2 className="auth-title">Create Account</h2>
              <p className="auth-subtitle">Join BRDify and build better requirements</p>
            </div>

            {error && (
              <div className="auth-error">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <form className="auth-form" onSubmit={handleSignup}>
              <div className="input-group">
                <input
                  className="auth-input"
                  type="text"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
                <User size={18} className="input-icon" />
              </div>

              <div className="input-group">
                <input
                  className="auth-input"
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Mail size={18} className="input-icon" />
              </div>

              <div className="input-group">
                <input
                  className="auth-input"
                  type="password"
                  placeholder="Password (min. 6 char)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Lock size={18} className="input-icon" />
              </div>

              <button className="auth-button" type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 size={18} className="button-spinner" />
                    Creating...
                  </>
                ) : (
                  <>
                    Create account <UserPlus size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="divider">or continue with</div>

            <button className="google-button" type="button" onClick={handleGoogleSignup} disabled={loading}>
              <svg className="google-icon" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google
            </button>

            <div className="auth-footer">
              Already have an account? <Link to="/login">Log in</Link>
            </div>
          </div>
        </div>

        {/* Visual area for Signup (Right side on code, rendered left side on screen due to row-reverse) */}
        <div className="auth-visual-section">
          <div className="visual-content">
            <span className="visual-badge">Community</span>
            <h1 className="visual-title">Join a new era of engineering.</h1>
            <p className="visual-text">Translate concepts into structured data natively. Set up your workspace in seconds.</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Signup;