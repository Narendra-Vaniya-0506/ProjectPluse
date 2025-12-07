import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';
import whyImage from '../images/Why ProjrctPluse.png';
import productImage from '../images/Product Dashboard.png';
import teamImage from '../images/team.png';
import chatImage from '../images/chat.png';
import createProjectImage from '../images/create project.png';
import flyingFoldersImage from '../images/flying folders.png';
import projectTimerImage from '../images/project timer.png';
import roleBasedControlImage from '../images/role based control.png';

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const images = [
    { src: teamImage, alt: 'Team Collaboration' },
    { src: chatImage, alt: 'Chat Feature' },
    { src: createProjectImage, alt: 'Create Project' },
    { src: flyingFoldersImage, alt: 'Flying Folders' },
    { src: projectTimerImage, alt: 'Project Timer' },
    { src: roleBasedControlImage, alt: 'Role Based Control' },
    { src: productImage, alt: 'Product Dashboard Preview' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % images.length);
    }, 3000); // Change slide every 3 seconds

    return () => clearInterval(interval);
  }, [images.length]);

  const scrollDown = () => {
    window.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
  };

  return (
    <div className="home-container">
      <header className="hero-section">
        <div className="hero-content">
          <h1>Welcome to ProjectPulse</h1>
          <p>Streamline your projects, empower your team.</p>
          <Link to="/choose-role" className="cta-button">Get Started</Link>
        </div>

        <div className="scroll-arrow" onClick={scrollDown}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 13L12 18L17 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </header>

      <section className="why-section">
        <div className="why-content">
          <h2>Why ProjectPulse ?</h2>
          <p>ProjectPulse takes the chaos out of project management and turns it into clarity.
             Whether you’re running a company, managing a classroom project, or coordinating a team, ProjectPulse gives you one place to plan, collaborate, and deliver results without the confusion.</p>
          <ul>
            <li><strong>Smart Role-Based Access:</strong> Admins, project managers, and team members each see only what they need nothing more, nothing less.</li>
            <li><strong>Seamless Team Collaboration:</strong> Chat in real time, share updates, and stay aligned without switching between apps.</li>
            <li><strong>Task Cards with Real Accountability:</strong> Assign tasks, set deadlines, track progress, and let team members update their work.</li>
            <li><strong>Performance Insights That Matter:</strong> See completion percentages, pending tasks, countdown timers, and project health in one dashboard.</li>
            <li><strong>Built for Every Industry:</strong> Perfect for companies, IT teams, schools, colleges, and organizations of all sizes.</li>
          </ul>
        </div>
        <div className="why-illustration">
          <img src={whyImage} alt="Team Collaboration Illustration" />
        </div>
      </section>

      <section className="how-it-works-section">
        <h2>How It Works</h2>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 6v6m0 0v6m0-6h6m-6 0H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="step-number">1</div>
            <h3>Create Your Project</h3>
            <p>Set up a new project in seconds define goals, add details, and get your workspace ready.</p>
          </div>
          <div className="step-card">
            <div className="step-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="step-number">2</div>
            <h3>Assign Tasks</h3>
            <p>Break your project into task cards and assign responsibilities to the right team members.</p>
          </div>
          <div className="step-card">
            <div className="step-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="step-number">3</div>
            <h3>Collaborate</h3>
            <p>Discuss ideas, share updates, and communicate directly inside project chat both group and individual messaging.</p>
          </div>
          <div className="step-card">
            <div className="step-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="step-number">4</div>
            <h3>Track Progress</h3>
            <p>View real time progress percentages, completed vs pending tasks, and detailed task timelines.</p>
          </div>
          <div className="step-card">
            <div className="step-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="step-number">5</div>
            <h3>Communicate</h3>
            <p>Stay connected through built-in chat, instant notifications, and activity updates.</p>
          </div>
          <div className="step-card">
            <div className="step-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="step-number">6</div>
            <h3>Monitor Deadlines</h3>
            <p>Each task card includes start dates, end dates, and an automatic countdown that locks the card when time is up.</p>
          </div>
          <div className="step-card">
            <div className="step-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="step-number">7</div>
            <h3>Review & Adjust</h3>
            <p>Evaluate performance, make changes, and reassign tasks as needed.</p>
          </div>
          <div className="step-card">
            <div className="step-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="step-number">8</div>
            <h3>Deliver & Succeed</h3>
            <p>Complete your project confidently and celebrate milestones with your team.</p>
          </div>
        </div>
      </section>

      <section className="product-preview-section">
        <h2>Product Preview</h2>
        <div className="preview-content">
          <p>Take a closer look at how ProjectPulse transforms the way teams work. Explore the intuitive dashboards for Admins, Project Managers, and Team Members. See how tasks, chat, deadlines, and progress tracking come together to create a smooth, efficient workflow perfect for organizations of any size.</p>
        </div>
        <div className="slideshow-container">
          <img src={images[currentSlide].src} alt={images[currentSlide].alt} className="slideshow-image" />
        </div>
      </section>

      <section className="features-section">
        <h2>Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3>Task Management</h3>
            <p>Organize and track your tasks efficiently</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3>Team Collaboration</h3>
            <p>Work together seamlessly with your team</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3>Progress Tracking</h3>
            <p>Monitor project progress in real-time</p>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-column">
            <h3>ProjectPulse Info</h3>
            <ul>
              <li><Link to="/developer">About Us</Link></li>
            </ul>
          </div>
          <div className="footer-column">
            <h3>Support</h3>
            <ul>
              <li><a href="mailto:codeyatra0605@gmail.com">Help Center</a></li>
              <li><a href="#docs">Documentation</a></li>
            </ul>
          </div>
          <div className="footer-column">
            <h3>Contact</h3>
            <ul>
              <li><a href="mailto:codeyatra0605@gmail.com">codeyatra0605@gmail.com</a></li>
              <li><a href="https://code-yatra-pi.vercel.app/">Code Yatra Website</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 ProjectPulse by Code Yatra. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
