import React, { Component } from 'react';
import { Button, Form, Message, Icon, Header } from 'semantic-ui-react';
import Head from 'next/head';
import { withRouter } from 'next/router';
import Cookies from 'js-cookie';

class VoterLogin extends Component {
  state = { loading: false, error: '' };

  signin = async () => {
    const email    = document.getElementById('signin_email').value;
    const password = document.getElementById('signin_password').value;

    if (!email || !password) {
      this.setState({ error: 'Please enter your email and password.' });
      return;
    }

    this.setState({ loading: true, error: '' });

    try {
      const res  = await fetch('/api/auth/voter-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.status === 'success') {
        Cookies.set('voter_email', encodeURI(email));
        Cookies.set('address',     encodeURI(data.election_address));
        this.props.router.push('/vote');
      } else {
        this.setState({ error: data.message || 'Invalid credentials.' });
      }
    } catch (err) {
      this.setState({ error: 'Network error. Please try again.' });
    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    const { loading, error } = this.state;

    return (
      <div>
        <Head>
          <title>Voter Login | BlockVotes</title>
        </Head>

        <div style={{
          minHeight: '100vh',
          background: "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)",
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
        }}>
          <div style={{ width: '100%', maxWidth: 420 }}>

            {/* Logo / title */}
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <Icon name="checkmark" size="huge" style={{ color: '#4fc3f7' }} />
              <Header as="h1" style={{ color: 'white', marginTop: '0.5rem', fontWeight: 700 }}>
                BlockVotes
              </Header>
              <p style={{ color: '#aaa', margin: 0 }}>Voter Portal</p>
            </div>

            {/* Card */}
            <div style={{
              background: 'rgba(255,255,255,0.07)',
              backdropFilter: 'blur(12px)',
              borderRadius: 16,
              padding: '2rem',
              border: '1px solid rgba(255,255,255,0.12)',
            }}>
              <h3 style={{ color: 'white', textAlign: 'center', marginBottom: '1.5rem' }}>
                Sign in to cast your vote
              </h3>

              {error && (
                <Message negative style={{ marginBottom: '1rem' }}>
                  <Icon name="exclamation circle" /> {error}
                </Message>
              )}

              <Form size="large">
                <Form.Input
                  fluid id="signin_email" icon="mail"
                  iconPosition="left" placeholder="Your Email"
                  style={{ marginBottom: 12 }}
                />
                <Form.Input
                  fluid id="signin_password" icon="lock"
                  iconPosition="left" placeholder="Password"
                  type="password" style={{ marginBottom: 20 }}
                />
                <Button
                  onClick={this.signin} loading={loading}
                  disabled={loading} fluid size="large"
                  style={{ background: '#4fc3f7', color: '#0f2027', fontWeight: 700 }}
                >
                  <Icon name="sign in" /> Sign In
                </Button>
              </Form>
            </div>

            <p style={{ color: '#aaa', textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
              Are you a company?{' '}
              <a href="/company_login" style={{ color: '#4fc3f7' }}>Company Login →</a>
            </p>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(VoterLogin);