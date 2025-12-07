import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ChooseYourRole.css';
import AdminImage from '../images/Admin.png';
import ProjectManagerImage from '../images/Project Manager.png';
import TeamMemberImage from '../images/Team member.png';
import SignInImage from '../images/Sign in.png';

const ChooseYourRole = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSelect = (role) => {
    setLoading(true);
    // Navigate to signin page for Sign In role, otherwise login
    if (role === 'Sign In') {
      navigate('/signin');
    } else {
      navigate('/login');
    }
    setLoading(false);
  };

  const scrollDown = () => {
    window.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
  };

  return (
    <div className="home-container">
      <header className="hero-section">
        <h1>Choose Your Role</h1>
        <p>Select the option that best describes you to get started</p>
        <div className="scroll-arrow" onClick={scrollDown}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 13L12 18L17 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </header>

      <section className="features-section">
        <div className="features-grid">
          <div className="feature-card">
            <h3>Sign In</h3>
            <img src={SignInImage} alt="Admin" style={{ width: '100px', height: '100px', marginBottom: '1rem' }} />
            <p>Create Admin account !</p>
            <p>Already have an Admin account? Sign in to access your Admin dashboard</p>
            <button className="cta-button" onClick={() => handleSelect('Sign In')}>Sign In</button>
          </div>
          <div className="feature-card">
            <h3>Admin</h3>
            <img src={AdminImage} alt="Admin" style={{ width: '100px', height: '100px', marginBottom: '1rem' }} />
            <p>Manage all users, create Project Managers, Team Members, and Clients</p>
            <button className="cta-button" onClick={() => handleSelect('Admin')}>Select</button>
          </div>
          <div className="feature-card">
            <h3>Project Manager</h3>
            <img src={ProjectManagerImage} alt="Project Manager" style={{ width: '100px', height: '100px', marginBottom: '1rem' }} />
            <p>Manage projects, assign tasks, and track progress</p>
            <button className="cta-button" onClick={() => handleSelect('Project Manager')}>Select</button>
          </div>
          <div className="feature-card">
            <h3>Team Member</h3>
            <img src={TeamMemberImage} alt="Team Member" style={{ width: '100px', height: '100px', marginBottom: '1rem' }} />
            <p>Collaborate on tasks and contribute to projects</p>
            <button className="cta-button" onClick={() => handleSelect('Team Member')}>Select</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ChooseYourRole;
