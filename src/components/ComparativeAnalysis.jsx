import React from 'react';
import { Zap, ThumbsUp, ThumbsDown, UserCheck } from 'lucide-react';

const ComparativeAnalysis = ({ results, candidatesToCompare, onShortlist, shortlist = [] }) => {
  // If candidatesToCompare is provided (e.g., from Shortlist view), use that.
  // Otherwise, use the top 5 from the results.
  const candidates = candidatesToCompare || (results ? results.rankedCandidates.slice(0, 5) : null);

  if (!candidates || candidates.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">
          <Zap size={32} />
        </div>
        <h3>ไม่มีข้อมูลสำหรับการเปรียบเทียบ</h3>
        <p>ให้ AI ทำการวิเคราะห์ก่อนถึงจะสามารถเปรียบเทียบผู้สมัครได้</p>
      </div>
    );
  }

  // To check if a candidate is already shortlisted
  const isCandidateShortlisted = (id) => shortlist.some(c => c.id === id);

  return (
    <div className="animate-fade-in">
      {!candidatesToCompare && (
        <div className="section-header">
          <div className="section-header-icon cyan"><Zap size={20} /></div>
          <div className="section-header-text">
            <h2>เปรียบเทียบ Top 5 โดย AI</h2>
            <p>วิเคราะห์จุดแข็งและจุดอ่อนของผู้สมัครที่ดีที่สุด 5 อันดับแรกแบบตัวต่อตัว</p>
          </div>
        </div>
      )}

      <div className="comparison-grid stagger-children">
        {candidates.map((candidate, idx) => {
          const isShortlisted = isCandidateShortlisted(candidate.id);
          // Highlight the best pick only if we are in the main comparison view (not shortlist compare view)
          const isBestPick = !candidatesToCompare && idx === 0;

          return (
            <div key={candidate.id} className={`comparison-card animate-slide-up ${isBestPick ? 'best' : ''}`}>
              {isBestPick && <span className="comparison-best-tag">แนะนำดีที่สุดโดย AI</span>}

              <div style={{ textAlign: 'center', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-subtle)' }}>
                <div className="comparison-score-circle" style={{ borderColor: isBestPick ? 'var(--accent)' : '' }}>
                  {candidate.score}
                </div>
                <h3 style={{ fontSize: '1.05rem', marginBottom: '0.2rem' }}>{candidate.name}</h3>
                <p className="text-sm text-secondary" style={{ margin: 0 }}>{candidate.currentRole}</p>
              </div>

              <div style={{ flex: 1 }}>
                <div className="comparison-section pros">
                  <h4 className="text-success"><ThumbsUp size={14} /> จุดแข็ง</h4>
                  <ul>
                    {candidate.pros && candidate.pros.length > 0 
                       ? candidate.pros.map((pro, i) => <li key={i}>{pro}</li>)
                       : <li className="text-muted">ไม่ระบุแน่ชัด</li>}
                  </ul>
                </div>

                <div className="comparison-section cons">
                  <h4 className="text-danger"><ThumbsDown size={14} /> จุดอ่อน / ควรระวัง</h4>
                  <ul>
                    {candidate.cons && candidate.cons.length > 0
                       ? candidate.cons.map((con, i) => <li key={i}>{con}</li>)
                       : <li className="text-muted">ไม่ระบุแน่ชัด</li>}
                  </ul>
                </div>
              </div>

              {onShortlist && (
                <button
                  className={`btn w-full mt-4 ${isShortlisted && !candidatesToCompare ? 'btn-danger' : isBestPick ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ justifyContent: 'center' }}
                  onClick={() => onShortlist(candidate)}
                >
                  <UserCheck size={14} />
                  {candidatesToCompare 
                    ? 'ลบออกจากรายการ' // If in Shortlist comparison mode
                    : (isShortlisted ? 'ลบออกจาก Shortlist' : 'เพิ่มลง Shortlist')}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ComparativeAnalysis;
