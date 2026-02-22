import { Link } from "react-router-dom";
import "../components/AuthForm.css";

const Login = () => {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">BRDify Login</h2>

        <input className="auth-input" type="email" placeholder="Email" />
        <input className="auth-input" type="password" placeholder="Password" />

        <button className="auth-button">Login</button>

        <div className="auth-link">
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;