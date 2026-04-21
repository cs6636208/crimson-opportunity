import React, { useState } from 'react';
import { Trophy, Star, BarChart3, ChevronDown, ChevronUp, ThumbsUp, ThumbsDown, BookOpen } from 'lucide-react';

const CandidateRanking = ({ results, originalCandidates = [] }) => {
  const [expandedId, setExpandedId] = useState(null);

  if (!results || !results.rankedCandidates) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">
          <BarChart3 size={32} />
        </div>
        <h3>ยังไม่มีข้อมูลการจัดอันดับ</h3>
        <p>กรุณาสั่งให้ AI ช่วยคัดกรองผู้สมัครในหน้า "รายละเอียดงาน" ก่อนครับ</p>
      </div>
    );
  }

  const { rankedCandidates } = results;

  const getScoreClass = (score) => {
    if (score >= 80) return 'score-high';
    if (score >= 60) return 'score-medium';
    return 'score-low';
  };

  const getRankClass = (index) => {
    if (index === 0) return 'gold';
    if (index === 1) return 'silver';
    if (index === 2) return 'bronze';
    return '';
  };

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="animate-fade-in">
      <div className="section-header">
        <div className="section-header-icon yellow"><Trophy size={20} /></div>
        <div className="section-header-text">
          <h2>การจัดอันดับผู้สมัครทั้งหมด</h2>
          <p>จัดอันดับโดย AI ตามเปอร์เซ็นต์ความตรงกันกับสายงาน พร้อมดูเหตุผลการให้คะแนนและคุณสมบัติจริงของผู้สมัคร</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }} className="stagger-children">
        {rankedCandidates.map((candidate, index) => {
          const isExpanded = expandedId === candidate.id;
          const originalProfile = originalCandidates.find(c => c.id === candidate.id);

          return (
            <div key={candidate.id} className="candidate-card animate-slide-up" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                {/* Rank Badge */}
                <div className={`candidate-rank ${getRankClass(index)}`}>
                  {index < 3 ? medals[index] : `#${index + 1}`}
                </div>

                {/* Info */}
                <div className="candidate-info">
                  <div className="candidate-name" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {candidate.name}
                      {index === 0 && <Star size={14} fill="var(--warning)" style={{ color: 'var(--warning)' }} />}
                    </div>
                  </div>
                  <div className="candidate-meta">
                    {candidate.currentRole} • ประสบการณ์ {candidate.yearsOfExperience} ปี
                    {candidate.education && (
                      <span className="edu-tag">🎓 {candidate.education}</span>
                    )}
                  </div>
                  <div className="skill-tags" style={{ marginBottom: '0.5rem' }}>
                    {candidate.matchedSkills.slice(0, 4).map(skill => (
                      <span key={skill} className="skill-tag matched">✓ {skill}</span>
                    ))}
                    {candidate.missingSkills.length > 0 && (
                      <span className="skill-tag missing">✗ ขาด: {candidate.missingSkills[0]}</span>
                    )}
                  </div>
                </div>

                {/* Score & Expand */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
                  <div className="candidate-score text-right">
                    <div className="candidate-score-label">ความเข้ากันได้</div>
                    <div className={`score-badge ${getScoreClass(candidate.score)}`}>
                      {candidate.score}
                    </div>
                  </div>
                  
                  <button 
                    className="btn btn-secondary" 
                    style={{ padding: '0.5rem' }}
                    onClick={() => setExpandedId(isExpanded ? null : candidate.id)}
                  >
                    {isExpanded ? <ChevronUp size={16} /> : <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>ดูเหตุผลและประวัติ <ChevronDown size={14}/></span>}
                  </button>
                </div>
              </div>

              {/* Expanded Reason & Profile Section */}
              {isExpanded && (
                <div style={{ 
                  marginTop: '1rem', 
                  paddingTop: '1rem', 
                  borderTop: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.5rem',
                  animation: 'fadeIn 0.2s ease-out'
                }}>
                  {/* Original Profile from DB */}
                  {originalProfile && originalProfile.summary && (
                    <div className="comparison-section" style={{ marginBottom: 0, padding: '1rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-lg)' }}>
                      <h4 className="text-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><BookOpen size={14} /> ข้อมูลประวัติโดยย่อ (Profile Summary)</h4>
                      <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.5' }}>{originalProfile.summary}</p>
                      
                      {originalProfile.skills && (
                        <div style={{ marginTop: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginRight: '0.5rem' }}>ทักษะดั้งเดิมทั้งหมด:</span>
                          {originalProfile.skills.map(s => <span key={s} style={{ fontSize: '0.75rem', background: 'var(--bg-card)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>{s}</span>)}
                        </div>
                      )}
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div className="comparison-section pros" style={{ marginBottom: 0 }}>
                      <h4 className="text-success"><ThumbsUp size={14} /> ทำไมถึงได้คะแนนเท่านี้ (จุดแข็ง)</h4>
                      <ul>
                        {candidate.pros && candidate.pros.length > 0 
                          ? candidate.pros.map((pro, i) => <li key={i}>{pro}</li>)
                          : <li className="text-muted">ไม่มีข้อมูลจุดแข็งที่ระบุได้ชัดเจน</li>}
                      </ul>
                    </div>

                    <div className="comparison-section cons" style={{ marginBottom: 0 }}>
                      <h4 className="text-danger"><ThumbsDown size={14} /> ข้อควรระวัง (จุดอ่อน / สิ่งที่ขาด)</h4>
                      <ul>
                        {candidate.cons && candidate.cons.length > 0
                          ? candidate.cons.map((con, i) => <li key={i}>{con}</li>)
                          : <li className="text-muted">ไม่พบจุดอ่อนที่น่ากังวล</li>}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CandidateRanking;
