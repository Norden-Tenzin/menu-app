import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
// style
import {
  auth,
  logInWithEmailAndPassword,
  signInWithGoogle,
} from "../utils/firebase";
import "../styles/Login.scss";
// internal
// import background from "../assets/background.png";
import { hostname } from "../utils/helper";
import logo from "../assets/google-color.svg";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, loading, error] = useAuthState(auth);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("LOGIN PAGE");
    if (loading) {
      // maybe trigger a loading screen
      return;
    }
    if (user) {
      if (hostname === "") navigate(`/`);
      else navigate(`/${hostname}/`);
    }
  }, [user, loading]);

  return (
    <div
      style={
        {
          // backgroundImage: `url(${background})`,
          // backgroundRepeat: "no-repeat",
          // backgroundSize: "cover",
        }
      }
      className="login-page"
    >
      <div className="login-space">
        <div className="login-container">
          <div className="login-title-container">
            <div className="title">Login</div>
            <button className="google-button" onClick={signInWithGoogle}>
              <img src={logo} className="google-button-icon" />
              Login with google
            </button>
          </div>
          <div className="login-or">
            <div className="divider"></div>
            <span>OR</span>
            <div className="divider"></div>
          </div>
          <div className="login-fields-container">
            <input
              type="text"
              className="login-text-box"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-mail Address"
            />
            <input
              type="password"
              className="login-text-box"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
            />
            <button
              className="login-button"
              onClick={() => logInWithEmailAndPassword(email, password)}
            >
              Login
            </button>
            <div className="login-bottom-text">
              <Link to={`${hostname}/reset}`}>Forgot Password</Link>
            </div>
            <div className="login-bottom-text">
              Don't have an account?{" "}
              <Link to={`${hostname}/register`}>Register</Link> now.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
