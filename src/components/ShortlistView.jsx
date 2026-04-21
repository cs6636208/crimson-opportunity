import React, { useState } from 'react';
import { ClipboardList, Trash2, UserCheck, Download, CheckCircle, Scale, Gavel } from 'lucide-react';
import ComparativeAnalysis from './ComparativeAnalysis';
import { judgeCandidates } from '../services/llmClient';

const ShortlistView = ({ shortlist, onRemove, jobReq }) => {
  const [isComparing, setIsComparing] = useState(false);
  const [isJudging, setIsJudging] = useState(false);
  const [verdict, setVerdict] = useState(null);

  if (!shortlist || shortlist.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">
          <ClipboardList size={32} />
        </div>
        <h3>รายชื่อผู้เข้ารอบยังว่างเปล่า</h3>
        <p>สร้างรายชื่อผู้เข้ารอบโดยการกดปุ่ม "เพิ่มลง Shortlist" ในหน้าเปรียบเทียบผู้สมัคร</p>
      </div>
    );
  }

  const handleExport = () => {
    const header = "ชื่อ-นามสกุล,ตำแหน่งปัจจุบัน,ประสบการณ์(ปี),คะแนน,ทักษะที่มี,ทักษะที่ขาด\n";
    const rows = shortlist.map(c =>
      `"${c.name}","${c.currentRole}",${c.yearsOfExperience},${c.score},"${(c.matchedSkills || []).join('; ')}","${(c.missingSkills || []).join('; ')}"`
    ).join('\n');
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), header + rows], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shortlisted_candidates_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleJudge = async () => {
    if (!jobReq) {
      alert("ไม่พบรายละเอียดความต้องการของตำแหน่งงาน โปรดกลับไปตรวจสอบหน้า 'รายละเอียดงาน' อีกครั้ง");
      return;
    }
    
    setIsJudging(true);
    setVerdict(null);
    try {
      const result = await judgeCandidates(jobReq, shortlist);
      setVerdict(result.verdict);
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการประเมิน: " + err.message);
    } finally {
      setIsJudging(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div className="section-header" style={{ marginBottom: 0 }}>
          <div className="section-header-icon green"><CheckCircle size={20} /></div>
          <div className="section-header-text">
            <h2 style={{ marginBottom: 0 }}>บุคคลที่ผ่านการคัดเลือก ({shortlist.length} คน)</h2>
            <p style={{ margin: 0 }}>รายชื่อแคนดิเดตที่ดีที่สุดที่คุณเลือกไว้สำหรับการพิจารณารอบสุดท้าย</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {shortlist.length >= 2 && (
            <button 
              className={`btn btn-glow`} 
              onClick={handleJudge}
              disabled={isJudging}
            >
              <Gavel size={14} /> 
              {isJudging ? 'AI กำลังตัดสิน...' : 'ให้ AI ช่วยฟันธงผู้ชนะ'}
            </button>
          )}

          {shortlist.length >= 2 && (
            <button 
              className={`btn ${isComparing ? 'btn-primary' : 'btn-secondary'}`} 
              onClick={() => setIsComparing(!isComparing)}
            >
              <Scale size={14} /> 
              {isComparing ? 'ปิดตารางเปรียบเทียบ' : 'เปิดตารางเปรียบเทียบ'}
            </button>
          )}
          <button className="btn btn-secondary" onClick={handleExport}>
            <Download size={14} /> ดาวน์โหลด CSV
          </button>
        </div>
      </div>

      {verdict && (
        <div className="jury-verdict-card glass-panel animate-slide-up" style={{ marginBottom: '2rem', padding: '2rem', border: '1px solid var(--warning)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: 'var(--warning)' }}>
            <Gavel size={24} />
            <h2 style={{ margin: 0 }}>คำตัดสินของ AI ประจำฝ่ายบุคคล</h2>
          </div>
          <p className="text-secondary text-sm mb-4">พิจารณาแบบเจาะลึกอิงจากความต้องการของตำแหน่งงานที่คุณสร้างไว้ ({jobReq.substring(0, 50)}...)</p>
          <div className="verdict-content" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
            {verdict}
          </div>
        </div>
      )}

      {isComparing ? (
        <div style={{ marginTop: '2rem' }}>
          <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--accent)' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
               <Scale size={18} /> เปรียบเทียบเฉพาะบุคลากรที่เข้ารอบ (Shortlist Comparison)
            </h3>
            <p className="text-secondary text-sm m-0 mt-1">
              นี่คือตารางเปรียบเทียบจุดแข็ง/จุดอ่อน แบบละเอียด เพื่อให้คุณสามารถตัดสินใจเลือกคนเดียวที่ดีที่สุดจากคนที่ผ่านเข้ารอบมาได้ง่ายขึ้น
            </p>
          </div>
          <ComparativeAnalysis 
            candidatesToCompare={shortlist} 
            shortlist={shortlist}
            onShortlist={(c) => onRemove(c.id)}
          />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }} className="stagger-children">
          {shortlist.map((candidate) => (
            <div key={candidate.id} className="candidate-card animate-slide-up">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flex: 1, minWidth: 0 }}>
                {/* Check Icon */}
                <div className="candidate-rank" style={{
                  background: 'var(--success-muted)',
                  borderColor: 'rgba(16, 185, 129, 0.25)',
                  color: 'var(--success)'
                }}>
                  <UserCheck size={20} />
                </div>

                {/* Info */}
                <div className="candidate-info">
                  <div className="candidate-name">{candidate.name}</div>
                  <div className="candidate-meta">
                    {candidate.currentRole} • ประสบการณ์ {candidate.yearsOfExperience} ปี
                  </div>
                  <div className="skill-tags">
                    {(candidate.matchedSkills || []).slice(0, 5).map(skill => (
                      <span key={skill} className="skill-tag matched">✓ {skill}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
                {/* Score */}
                <div className="candidate-score">
                  <div className="candidate-score-label">คะแนนความเหมาะสม</div>
                  <div style={{
                    fontSize: '1.4rem',
                    fontWeight: 800,
                    color: 'var(--success)',
                    fontFamily: "'JetBrains Mono', monospace"
                  }}>
                    {candidate.score}
                  </div>
                </div>
                {/* Remove */}
                <button
                  className="btn btn-danger"
                  onClick={() => onRemove(candidate.id)}
                  title="คัดออก"
                  style={{ padding: '0.5rem' }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShortlistView;
