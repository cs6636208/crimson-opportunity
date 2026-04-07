import React, { useState, useEffect } from 'react';
import { Users, Search, Zap, ClipboardList, LogOut, User } from 'lucide-react';
import JobRequirementsForm from './JobRequirementsForm';
import CandidateRanking from './CandidateRanking';
import ComparativeAnalysis from './ComparativeAnalysis';
import ShortlistView from './ShortlistView';
import { analyzeCandidates } from '../services/llmClient';

const Dashboard = ({ candidates, setCandidates, user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('requirements');
  const [jobReq, setJobReq] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [shortlist, setShortlist] = useState([]);

  useEffect(() => {
    const fetchShortlist = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetch('http://localhost:5000/api/candidates/shortlists', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) setShortlist(data);
      } catch (err) {
        console.error('Error fetching shortlist:', err);
      }
    };
    fetchShortlist();
  }, []);

  const handleShortlist = async (candidate) => {
    const isAlreadyShortlisted = shortlist.find(c => c.id === candidate.id);

    if (isAlreadyShortlisted) {
      setShortlist(prev => prev.filter(c => c.id !== candidate.id));
    } else {
      setShortlist(prev => [...prev, candidate]);
    }

    const isMockCandidate = candidate.id?.startsWith('CAND-') || candidate.id?.startsWith('RAND-');
    if (isMockCandidate) return;

    try {
      const token = localStorage.getItem('token');
      if (token) {
        await fetch(`http://localhost:5000/api/candidates/shortlist/${candidate.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ score: candidate.score, matchedSkills: candidate.matchedSkills, missingSkills: candidate.missingSkills })
        });
      }
    } catch (err) {
      console.warn('Backend shortlist sync skipped:', err.message);
      if (isAlreadyShortlisted) {
        setShortlist(prev => [...prev, candidate]);
      } else {
        setShortlist(prev => prev.filter(c => c.id !== candidate.id));
      }
    }
  };

  const handleRemoveFromShortlist = async (candidateId) => {
    setShortlist(prev => prev.filter(c => c.id !== candidateId));
    const isMockCandidate = candidateId?.startsWith('CAND-') || candidateId?.startsWith('RAND-');
    if (isMockCandidate) return;
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await fetch(`http://localhost:5000/api/candidates/shortlist/${candidateId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({})
        });
      }
    } catch (err) {
      console.warn('Backend shortlist removal sync skipped:', err.message);
    }
  };

  const handleRunAnalysis = async (autoSelect = false) => {
    if (!jobReq.trim()) { alert('Please enter job requirements.'); return; }
    if (candidates.length === 0) { alert("Please add candidates first by clicking 'Load Mock Resumes'."); return; }

    setIsAnalyzing(true);
    try {
      const response = await analyzeCandidates(jobReq, candidates);
      setAnalysisResults(response);
      setActiveTab(autoSelect === true ? 'comparison' : 'ranking');
    } catch (error) {
      alert('Error analyzing candidates: ' + error.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const tabs = [
    { id: 'requirements', label: 'Requirements', Icon: Search },
    { id: 'ranking',      label: 'Rankings',     Icon: Users,        disabled: !analysisResults },
    { id: 'comparison',   label: 'Comparison',   Icon: Zap,          disabled: !analysisResults },
    { id: 'shortlist',    label: 'Shortlist',    Icon: ClipboardList, badge: shortlist.length || 0 },
  ];

  return (
    <div className="dashboard-root">
      {/* ── TOP NAVBAR ── */}
      <nav className="top-navbar">
        <div className="navbar-inner">

          {/* Brand */}
          <div className="navbar-brand">
            <span className="brand-icon">🌪️</span>
            <span className="brand-name">LLM-Powered Job Matching and Candidate Analysis System</span>
          </div>

          {/* Center tabs */}
          <div className="navbar-tabs">
            {tabs.map(({ id, label, Icon, disabled, badge }) => (
              <button
                key={id}
                className={`nav-tab ${activeTab === id ? 'active' : ''}`}
                onClick={() => !disabled && setActiveTab(id)}
                disabled={disabled}
              >
                <Icon size={15} />
                {label}
                {badge > 0 && <span className="tab-badge">{badge}</span>}
              </button>
            ))}
          </div>

          {/* Right actions */}
          <div className="navbar-actions">
            <button
              className="auto-select-btn"
              onClick={() => handleRunAnalysis(true)}
              disabled={isAnalyzing || candidates.length === 0 || !jobReq.trim()}
              title="Let AI instantly pick the best candidates"
            >
              <Zap size={13} />
              {isAnalyzing ? 'Analyzing…' : 'Auto-Select'}
            </button>
            <div className="user-pill">
              <User size={13} />
              <span>{user?.name}</span>
            </div>
            <button className="logout-btn" onClick={onLogout} title="Sign out">
              <LogOut size={15} />
            </button>
          </div>

        </div>
      </nav>

      {/* ── PAGE CONTENT ── */}
      <main key={activeTab} className="page-content animate-fade-in">
        {activeTab === 'requirements' && (
          <JobRequirementsForm
            jobReq={jobReq}
            setJobReq={setJobReq}
            onAnalyze={handleRunAnalysis}
            isAnalyzing={isAnalyzing}
            candidatesCount={candidates.length}
            setCandidates={setCandidates}
            candidates={candidates}
          />
        )}
        {activeTab === 'ranking' && (
          <CandidateRanking results={analysisResults} />
        )}
        {activeTab === 'comparison' && (
          <ComparativeAnalysis results={analysisResults} onShortlist={handleShortlist} shortlist={shortlist} />
        )}
        {activeTab === 'shortlist' && (
          <ShortlistView shortlist={shortlist} onRemove={handleRemoveFromShortlist} />
        )}
      </main>
    </div>
  );
};

export default Dashboard;
