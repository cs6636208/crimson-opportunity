import React from 'react';
import { X, Key } from 'lucide-react';

const SettingsModal = ({ apiKey, setApiKey, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content glass-panel animate-fade-in">
        <div className="modal-header flex justify-between items-center mb-4">
          <h2 className="flex items-center gap-2"><Key size={20} /> ตั้งค่าการเชื่อมต่อ API</h2>
          <button className="btn-close" onClick={onClose}><X size={20} /></button>
        </div>
        
        <div className="modal-body">
          <p className="mb-4 text-sm text-secondary">
            ระบบใช้ AI อัจฉริยะ (LLM) ในการวิเคราะห์และประเมินผู้สมัคร กรุณาระบุ API Key ของ OpenTyphoon AI (หรือ API ที่รองรับมาตรฐาน OpenAI รูปแบบอื่น) ด้านล่างครับ
          </p>
          
          <div className="input-group">
            <label className="input-label">รหัสผ่าน API (API Key)</label>
            <input 
              type="password" 
              className="input-field" 
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
            />
          </div>
          
          <div className="flex justify-end mt-4">
            <button className="btn btn-primary" onClick={onClose}>บันทึกและปิดหน้าต่าง</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
