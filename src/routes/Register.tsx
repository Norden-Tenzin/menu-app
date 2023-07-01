import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { Link, useNavigate } from "react-router-dom";
// style
import {
  auth,
  registerWithEmailAndPassword,
  signInWithGoogle,
} from "../utils/firebase";
import "../styles/Register.scss";
// internal
// import background from "../assets/background.png";
import logo from "../assets/google-color.svg";
import { hostname } from "../utils/helper";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [user, loading, error] = useAuthState(auth);
  const navigate = useNavigate();
  const register = () => {
    if (!name) alert("Please enter name");
    registerWithEmailAndPassword(name, email, password);
  };
  useEffect(() => {
    console.log("REGISTER PAGE");
    if (loading) return;
    // if (user) navigate("/dashboard", { replace: true });
  }, [loading]);
  return (
    <div
      style={
        {
          // height: "100vh",
          // backgroundImage: `url("${background}")`,
          // backgroundRepeat: "no-repeat",
          // backgroundSize: "cover",
        }
      }
      className="register-page"
    >
      <div className="register-space">
        <div className="register-container">
          <div className="register-title-container">
            <div className="title">Register</div>
            <button className="google-button" onClick={signInWithGoogle}>
              <img className="google-button-icon" src={logo} />
              Register with google
            </button>
          </div>
          <div className="register-or">
            <div className="divider"></div>
            <span>OR</span>
            <div className="divider"></div>
          </div>
          <div className="register-fields-container">
            <input
              type="text"
              className="register-text-box"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full Name"
            />
            <input
              type="text"
              className="register-text-box"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-mail Address"
            />
            <input
              type="password"
              className="register-text-box"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
            />
            <button className="register-button" onClick={register}>
              Register
            </button>
            <div className="register-bottom-text">
              Already have an account?{" "}
              <Link to={`${hostname}/login}`}>Login</Link> now.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Register;
