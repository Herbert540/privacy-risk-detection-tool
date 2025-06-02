import React from 'react';
import { Button } from 'react-bootstrap';
import { ArrowRight, ShieldCheck, EyeFill, PeopleFill, FileEarmarkText, CheckCircleFill } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import './Home.css';

function Home() {
  const navigate = useNavigate();

  const handleAnalyzePolicy = () => {
    navigate('/upload');
  };

  const handleLearnMore = () => {
    // You can implement this to scroll to how it works section or navigate to an about page
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-badge">
          <ShieldCheck className="badge-icon" />
          <span>Your Privacy Matters</span>
        </div>
        
        <h1 className="hero-title">
          Understand What You're 
          <span className="title-highlight"> Really Agreeing To</span>
        </h1>
        
        <p className="hero-description">
          Most people spend just 30 seconds reading privacy policies that govern years of their personal data. 
          Our tool analyzes complex legal language and shows you exactly what matters to you, in plain English.
        </p>

        <div className="hero-buttons">
          <Button 
            className="btn-primary-custom" 
            onClick={handleAnalyzePolicy}
          >
            <span>Analyze a Privacy Policy</span>
            <ArrowRight className="button-icon" />
          </Button>
          <Button 
            variant="outline-secondary" 
            className="btn-secondary-custom"
            onClick={handleLearnMore}
          >
            See How It Works
          </Button>
        </div>

        {/* Trust Indicators */}
        <div className="trust-indicators">
          <div className="trust-item">
            <CheckCircleFill className="trust-icon" />
            <span>Free to Use</span>
          </div>
          <div className="trust-item">
            <CheckCircleFill className="trust-icon" />
            <span>No Data Stored</span>
          </div>
          <div className="trust-item">
            <CheckCircleFill className="trust-icon" />
            <span>Instant Analysis</span>
          </div>
        </div>
      </div>

      {/* Problem/Solution Section */}
      <div className="problem-solution-section">
        <div className="comparison-grid">
          <div className="problem-box">
            <div className="box-header">
              <EyeFill className="box-icon problem-icon" />
              <h3>The Problem</h3>
            </div>
            <div className="box-content">
              <p>The average privacy policy is 2,500 words of legal jargon that takes 18 minutes to read properly.</p>
              <p>Companies often hide important details about data sharing, tracking, and your rights in dense paragraphs.</p>
              <p>Most people just click "I Agree" without understanding they're giving away control of their personal information.</p>
            </div>
          </div>

          <div className="solution-box">
            <div className="box-header">
              <ShieldCheck className="box-icon solution-icon" />
              <h3>Our Solution</h3>
            </div>
            <div className="box-content">
              <p>We break down privacy policies into clear, understandable sections that focus on what matters most to you.</p>
              <p>Our analysis highlights potential risks, your rights, and what data is being collected in plain language.</p>
              <p>Make informed decisions about your privacy in just 2-3 minutes instead of 18.</p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div id="how-it-works" className="how-it-works-section">
        <div className="section-header">
          <h2>How It Works</h2>
          <p className="section-description">
            Three simple steps to understand any privacy policy
          </p>
        </div>
        
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-icon-wrapper upload-step">
              <FileEarmarkText className="step-icon" />
            </div>
            <h3 className="step-title">1. Upload or Paste</h3>
            <p className="step-description">
              Simply paste the privacy policy URL or upload the document you want to analyze.
            </p>
          </div>
          
          <div className="step-card">
            <div className="step-icon-wrapper preferences-step">
              <PeopleFill className="step-icon" />
            </div>
            <h3 className="step-title">2. Set Your Preferences</h3>
            <p className="step-description">
              Tell us what privacy issues matter most to you - data sharing, tracking, retention periods, etc.
            </p>
          </div>
          
          <div className="step-card">
            <div className="step-icon-wrapper insights-step">
              <EyeFill className="step-icon" />
            </div>
            <h3 className="step-title">3. Get Clear Insights</h3>
            <p className="step-description">
              Receive a personalized breakdown highlighting potential risks and important details in plain English.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;