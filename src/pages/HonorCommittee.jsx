import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import AnnCard from '../components/AnnCard';
import { SkeletonGrid } from '../components/Skeleton';
import AnnouncementModal from '../components/AnnouncementModal';
import { useToast } from '../components/Toast';

export default function HonorCommittee({ isAdmin }) {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const toast = useToast();

  const fetchReminders = useCallback(async () => {
    setLoading(true);
    try {
        const { data, error } = await supabase
          .from('announcements')
          .select('*')
          .or('council.ilike.%honor%,tag.ilike.%honor%')
          .order('date', { ascending: false });

        if (error) {
          console.error("Error fetching honor reminders:", error);
        } else {
          // Transform keys to match expected AnnCard props
          const formattedData = data.map(item => ({
            id: item.id,
            Title: item.title,
            Body: item.body,
            Date: item.date,
            Council: item.council || 'Honor Committee',
            Priority: item.priority || 'low',
            Tag: item.tag || 'Reminder'
          }));
          setReminders(formattedData);
        }
      } catch (err) {
        console.error("Exception fetching honor reminders:", err);
      } finally {
        setLoading(false);
      }
  }, []);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  const handleSaveAnnouncement = async (ann) => {
    const { id, ...annData } = ann;
    const dbRow = {
      title: annData.Title,
      body: annData.Body,
      date: annData.Date,
      council: 'Honor Committee',
      tag: annData.Tag || 'important',
      priority: annData.Priority || 'normal'
    };

    const { error } = await supabase.from('announcements').insert([dbRow]);
    if (error) {
      console.error("Error adding honor announcement:", error);
      toast.error("Failed to save honor announcement.");
    } else {
      toast.success("Honor announcement published successfully.");
      fetchReminders(); // Refresh list
    }
    setIsModalOpen(false);
  };

  return (
    <div className="page active" id="page-honor">
      <div className="glass council-hero" style={{ background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(139, 0, 0, 0.1) 100%)', borderColor: 'rgba(212, 175, 55, 0.3)' }}>
        <div className="council-crest" style={{ fontSize: '48px' }}>⚖️</div>
        <div className="council-info">
          <h2 style={{ color: '#d4af37' }}>HONOR COMMITTEE</h2>
          <p>INTEGRITY & ACCOUNTABILITY</p>
          <div className="council-mission" style={{ fontSize: '1.2rem', fontStyle: 'italic', fontWeight: 'bold', color: 'var(--text)' }}>
            "We, the cadets, do not lie, cheat, steal, nor tolerate among us those who do."
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: '24px' }}>
        <div className="nexus-card">
          <h3 className="nexus-metric-title"><i className="fa-solid fa-scroll" style={{ color: '#d4af37' }}></i> THE HONOR SYSTEM</h3>
          <p style={{ color: 'var(--text)', fontSize: '14px', lineHeight: '1.6' }}>
            The Honor Code is the most fundamental principle of cadet life. It requires absolute truthfulness, unquestionable integrity, and the courage to uphold these standards under any circumstance.
          </p>
          <br/>
          <p style={{ color: 'var(--text)', fontSize: '14px', lineHeight: '1.6' }}>
            The Honor Committee is composed of elected representatives responsible for educating the Corps and investigating alleged violations.
          </p>
        </div>
        <div className="nexus-card">
           <h3 className="nexus-metric-title"><i className="fa-solid fa-hand-holding-heart" style={{ color: '#8b0000' }}></i> CORE VALUES</h3>
           <ul style={{ color: 'var(--text)', fontSize: '14px', lineHeight: '1.6', paddingLeft: '20px' }}>
             <li><strong>Truthfulness:</strong> Cadets speak and act the truth.</li>
             <li><strong>Fairness:</strong> Cadets do not seek an unfair advantage.</li>
             <li><strong>Respect for Property:</strong> Cadets respect the property of others and the institution.</li>
             <li><strong>Non-Toleration:</strong> Cadets have the moral courage to report violations.</li>
           </ul>
        </div>
      </div>

      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="section-title">
          <div className="section-icon" style={{ background: 'rgba(212, 175, 55, 0.2)', color: '#d4af37' }}>📌</div>
          <div><h2>HONOR CODE REMINDERS</h2><p>BULLETINS & NOTICES</p></div>
        </div>
        {isAdmin && (
          <button 
            className="sidebar-action-btn btn-success" 
            style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold' }}
            onClick={() => setIsModalOpen(true)}
          >
            <i className="fa-solid fa-plus"></i> ADD REMINDER
          </button>
        )}
      </div>
      
      {loading ? (
        <SkeletonGrid count={3} />
      ) : reminders.length ? (
        <div className="grid-3">
          {reminders.map((item, i) => <AnnCard key={i} item={item} />)}
        </div>
      ) : (
        <div className="glass empty-state" style={{gridColumn: '1/-1'}}>
          <i className="fa-solid fa-check-double" style={{ color: '#d4af37' }}></i>
          <p>
            No active honor code reminders at this time.
          </p>
        </div>
      )}

      {/* Local Add Announcement Modal */}
      <AnnouncementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveAnnouncement}
        toast={toast}
        initialData={{ Council: 'Honor Committee', Tag: 'important', Priority: 'high' }}
      />
    </div>
  );
}
