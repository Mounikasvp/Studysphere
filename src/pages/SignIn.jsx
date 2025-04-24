import React from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { Link } from "react-router-dom";
import {
  Button,
  Col,
  Container,
  Grid,
  Message,
  Panel,
  Row,
  toaster,
  Form,
  Input,
  Toggle,
} from "rsuite";
import { ref, serverTimestamp, set } from "firebase/database";
import { auth, database } from "../misc/firebase.config.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock, faArrowLeft } from "@fortawesome/free-solid-svg-icons";

const SignIn = () => {
  const [formValue, setFormValue] = React.useState({
    email: '',
    password: '',
  });
  const [isSignUp, setIsSignUp] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  // Form validation
  const validateForm = () => {
    if (!formValue.email) {
      toaster.push(<Message type="error">Email is required</Message>);
      return false;
    }

    if (!formValue.password) {
      toaster.push(<Message type="error">Password is required</Message>);
      return false;
    }

    if (isSignUp && formValue.password.length < 6) {
      toaster.push(<Message type="error">Password must be at least 6 characters</Message>);
      return false;
    }

    return true;
  };

  const handleEmailAuth = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      let credential;

      if (isSignUp) {
        // Sign up with email/password
        credential = await createUserWithEmailAndPassword(
          auth,
          formValue.email,
          formValue.password
        );

        // Create user profile in database
        await set(ref(database, "users/" + credential.user.uid), {
          name: formValue.email.split('@')[0], // Use part of email as display name
          createdAt: serverTimestamp(),
          avatar: null, // Add empty avatar field for profile completeness
        });
      } else {
        // Sign in with email/password
        credential = await signInWithEmailAndPassword(
          auth,
          formValue.email,
          formValue.password
        );
      }

      toaster.push(
        <Message type="success" closable duration={4000}>
          {isSignUp ? 'Account created successfully' : 'Signed In'}
        </Message>
      );
    } catch (error) {
      console.error('Email authentication error:', error);
      toaster.push(
        <Message type="error" closable duration={4000}>
          {error.message}
        </Message>
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signin-page">
      <div className="geometric-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
      </div>

      <div className="signin-container">
        <div className="signin-card">
          <Link to="/" className="back-link" style={{ position: 'absolute', top: '20px', left: '20px', color: '#64748b', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <FontAwesomeIcon icon={faArrowLeft} /> Back to Home
          </Link>

          <div className="logo-container">
            <div className="logo">
              <div className="logo-icon"></div>
              <h1>StudySphere</h1>
            </div>
            <p>Connect, collaborate, and learn together</p>
          </div>

          <div className="form-header">
            <h2>{isSignUp ? 'Create an Account' : 'Welcome Back'}</h2>
            <p>{isSignUp ? 'Join our community of learners today' : 'Sign in to continue your learning journey'}</p>
          </div>

          <Form fluid formValue={formValue} onChange={value => setFormValue(value)}>
            <Form.Group>
              <Form.ControlLabel>Email</Form.ControlLabel>
              <Form.Control
                name="email"
                type="email"
                placeholder="Enter your email"
                style={{ paddingLeft: '40px' }}
              />
              <FontAwesomeIcon
                icon={faEnvelope}
                style={{ position: 'absolute', left: '15px', top: '42px', color: '#64748b' }}
              />
            </Form.Group>

            <Form.Group>
              <Form.ControlLabel>Password</Form.ControlLabel>
              <Form.Control
                name="password"
                type="password"
                placeholder="Enter your password"
                style={{ paddingLeft: '40px' }}
              />
              <FontAwesomeIcon
                icon={faLock}
                style={{ position: 'absolute', left: '15px', top: '42px', color: '#64748b' }}
              />
              {isSignUp && <Form.HelpText>Password must be at least 6 characters long</Form.HelpText>}
            </Form.Group>

            <div className="toggle-container">
              <Toggle
                checked={isSignUp}
                onChange={setIsSignUp}
                checkedChildren="Sign Up"
                unCheckedChildren="Sign In"
              />
              <span className="toggle-label">{isSignUp ? 'Creating new account' : 'Already have an account'}</span>
            </div>

            <Button
              block
              appearance="primary"
              onClick={handleEmailAuth}
              loading={isLoading}
              className="submit-btn"
            >
              {isSignUp ? 'Create Account' : 'Sign In'}
            </Button>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
