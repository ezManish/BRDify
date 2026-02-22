import { Link } from "react-router-dom";
import "../components/AuthForm.css";

const Signup = () => {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Create Account</h2>

        <input className="auth-input" type="text" placeholder="Full Name" />
        <input className="auth-input" type="email" placeholder="Email" />
        <input className="auth-input" type="password" placeholder="Password" />

        <button className="auth-button">Sign Up</button>

        <div className="auth-link">
          Already have an account? <Link to="/">Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;