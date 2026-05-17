import React, { Component } from "react";
import { Button, Form, Message, Icon, Header } from "semantic-ui-react";
import Head from 'next/head';
import { withRouter } from 'next/router';
import { ethers } from 'ethers';
import { getElectionFact } from '../config/ethers.client';
import Cookies from 'js-cookie';

class CompanyLogin extends Component {
  state = { visible: true, loading: false, error: '' };

  // FIX: replaced Semantic UI <Transition> (triggers findDOMNode warning) with
  // plain CSS display toggle — identical visual result, zero warnings.
  signup = async () => {
    const email           = document.getElementById('signup_email').value;
    const password        = document.getElementById('signup_password').value;
    const repeat_password = document.getElementById('signup_repeat_password').value;

    if (!email || !password) {
      this.setState({ error: 'Please fill in all fields.' });
      return;
    }
    if (password !== repeat_password) {
      this.setState({ error: 'Passwords do not match.' });
      return;
    }

    this.setState({ loading: true, error: '' });
    try {
      const res  = await fetch('/api/auth/company-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        alert('Registered! Please sign in.');
        this.setState({ visible: false }); // switch to sign-in tab
      } else {
        this.setState({ error: data.message || 'Registration failed.' });
      }
    } catch (err) {
      console.log('FETCH ERROR:', err);
      this.setState({ error: err.message });
      //this.setState({ error: 'Network errorsss. Please try again.'});
    } finally {
      this.setState({ loading: false });
    }
  };

  signin = async () => {
    const email    = document.getElementById('signin_email').value;
    const password = document.getElementById('signin_password').value;

    if (!email || !password) {
      this.setState({ error: 'Please enter your email and password.' });
      return;
    }

    this.setState({ loading: true, error: '' });

    try {
      const res  = await fetch('/api/auth/company-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.status !== 'success') {
        this.setState({ error: data.message || 'Invalid credentials.', loading: false });
        return;
      }

      // FIX: backend now returns data.data.id and data.data.email
      Cookies.set('company_id',    encodeURI(data.data.id || ''));
      Cookies.set('company_email', encodeURI(email));

    } catch (err) {
      this.setState({ error: 'Server error. Please try again.', loading: false });
      return;
    }

    // MetaMask + blockchain check
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider     = new ethers.BrowserProvider(window.ethereum);
      const electionFact = getElectionFact(provider);
      const summary      = await electionFact.getDeployedElection(email);

      if (summary[2] === "Create an election.") {
        this.props.router.push('/election/create_election');
      } else {
        Cookies.set('address', summary[0]);
        this.props.router.push('/election/company_dashboard');
      }
    } catch (err) {
      console.error(err);
      this.setState({
        error: 'MetaMask connection failed. Make sure MetaMask is installed and unlocked.',
        loading: false,
      });
    }
  };

  render() {
    const { visible, loading, error } = this.state;

    const tabStyle = (active) => ({
      flex: 1,
      padding: '0.75rem',
      background: active ? '#627eea' : 'rgba(255,255,255,0.08)',
      color: 'white',
      border: 'none',
      cursor: 'pointer',
      fontWeight: active ? 700 : 400,
      fontSize: '1rem',
      transition: 'background 0.2s',
    });

    return (
      <div>
        <Head>
          <title>Company Login | BlockVotes</title>
        </Head>

        <div style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
        }}>
          <div style={{ width: '100%', maxWidth: 460 }}>

            {/* Logo */}
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <Icon name="shield alternate" size="huge" style={{ color: '#627eea' }} />
              <Header as="h1" style={{ color: 'white', marginTop: '0.5rem', fontWeight: 700 }}>
                BlockVotes
              </Header>
              <p style={{ color: '#aaa', margin: 0 }}>Company Portal</p>
            </div>

            {/* Tab toggle — CSS only, no Transition component */}
            <div style={{ display: 'flex', marginBottom: '1.5rem', borderRadius: 8, overflow: 'hidden' }}>
              <button style={tabStyle(visible)}  onClick={() => this.setState({ visible: true,  error: '' })}>Sign Up</button>
              <button style={tabStyle(!visible)} onClick={() => this.setState({ visible: false, error: '' })}>Sign In</button>
            </div>

            {/* Card */}
            <div style={{
              background: 'rgba(255,255,255,0.07)',
              backdropFilter: 'blur(12px)',
              borderRadius: 16,
              padding: '2rem',
              border: '1px solid rgba(255,255,255,0.12)',
            }}>
              {error && (
                <Message negative style={{ marginBottom: '1rem' }}>
                  <Icon name="exclamation circle" /> {error}
                </Message>
              )}

              {/* Sign Up — CSS display toggle instead of <Transition> */}
              <div style={{ display: visible ? 'block' : 'none' }}>
                <Form size="large">
                  <h3 style={{ color: 'white', textAlign: 'center', marginBottom: '1.5rem' }}>
                    Create your company account
                  </h3>
                  <Form.Input fluid id="signup_email"           icon="mail"  iconPosition="left" placeholder="Company Email"    style={{ marginBottom: 12 }} />
                  <Form.Input fluid id="signup_password"        icon="lock"  iconPosition="left" placeholder="Password"         type="password" style={{ marginBottom: 12 }} />
                  <Form.Input fluid id="signup_repeat_password" icon="lock"  iconPosition="left" placeholder="Confirm Password"  type="password" style={{ marginBottom: 20 }} />
                  <Button
                    onClick={this.signup} loading={loading} disabled={loading}
                    fluid size="large"
                    style={{ background: '#627eea', color: 'white', fontWeight: 700 }}
                  >
                    Create Account
                  </Button>
                </Form>
              </div>

              {/* Sign In — CSS display toggle instead of <Transition> */}
              <div style={{ display: !visible ? 'block' : 'none' }}>
                <Form size="large">
                  <h3 style={{ color: 'white', textAlign: 'center', marginBottom: '1.5rem' }}>
                    Welcome back
                  </h3>
                  <Form.Input fluid id="signin_email"    icon="mail" iconPosition="left" placeholder="Company Email" style={{ marginBottom: 12 }} />
                  <Form.Input fluid id="signin_password" icon="lock" iconPosition="left" placeholder="Password"      type="password" style={{ marginBottom: 20 }} />
                  <Button
                    onClick={this.signin} loading={loading} disabled={loading}
                    fluid size="large"
                    style={{ background: '#627eea', color: 'white', fontWeight: 700 }}
                  >
                    Sign In with MetaMask <Icon name="ethereum" />
                  </Button>
                </Form>
              </div>
            </div>

            <p style={{ color: '#aaa', textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
              Are you a voter?{' '}
              <a href="/voter_login" style={{ color: '#627eea' }}>Voter Login →</a>
            </p>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(CompanyLogin);