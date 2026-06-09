import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '../lib/supabase';

const TAG_COLORS = {
  urgent: 'tag-red',
  important: 'tag-gold',
  info: 'tag-blue',
  training: 'tag-green',
  activity: 'tag-green',
  default: 'tag-green'
};

function tagClass(tag) {
  return TAG_COLORS[tag?.toLowerCase()] || 'tag-green';
}

export default function AnnCard({ item }) {
  const [isOpen, setIsOpen] = useState(false);
  const [reactions, setReactions] = useState({ like: 0, heart: 0, clap: 0, salute: 0 });
  const [userReaction, setUserReaction] = useState(null);

  const itemKey = item.id ? `id_${item.id}` : `title_${item.Title?.replace(/\s+/g, '_')}`;

  useEffect(() => {
    // Load local user reaction
    const storedUserReaction = localStorage.getItem(`alfa_user_reaction_${itemKey}`);
    if (storedUserReaction) {
      setUserReaction(storedUserReaction);
    }

    // Fallback to local storage for immediate UI rendering
    const storedReactions = localStorage.getItem(`alfa_reactions_${itemKey}`);
    if (storedReactions) {
      try { setReactions(JSON.parse(storedReactions)); } catch (e) {}
    }

    // Fetch global reactions from Supabase
    async function fetchReactions() {
      try {
        const { data, error } = await supabase
          .from('reactions')
          .select('like_count, heart_count, clap_count, salute_count')
          .eq('item_key', itemKey)
          .single();
          
        if (data && !error) {
          const fetchedReactions = {
            like: data.like_count || 0,
            heart: data.heart_count || 0,
            clap: data.clap_count || 0,
            salute: data.salute_count || 0
          };
          setReactions(fetchedReactions);
          localStorage.setItem(`alfa_reactions_${itemKey}`, JSON.stringify(fetchedReactions));
        }
      } catch (err) {
        console.error("Error fetching reactions:", err);
      }
    }
    fetchReactions();
  }, [itemKey]);

  const handleReaction = async (e, type) => {
    e.stopPropagation();
    let newReactions = { ...reactions };
    let newUserReaction = userReaction;
    const oldReaction = userReaction;

    if (userReaction === type) {
      // Toggle off
      newReactions[type] = Math.max(0, newReactions[type] - 1);
      newUserReaction = null;
    } else {
      // Remove old reaction if exists
      if (userReaction) {
        newReactions[userReaction] = Math.max(0, newReactions[userReaction] - 1);
      }
      // Add new reaction
      newReactions[type] = (newReactions[type] || 0) + 1;
      newUserReaction = type;
    }

    // Optimistic UI Update
    setReactions(newReactions);
    setUserReaction(newUserReaction);
    localStorage.setItem(`alfa_reactions_${itemKey}`, JSON.stringify(newReactions));
    
    if (newUserReaction) {
      localStorage.setItem(`alfa_user_reaction_${itemKey}`, newUserReaction);
    } else {
      localStorage.removeItem(`alfa_user_reaction_${itemKey}`);
    }

    // Update in Supabase
    try {
      await supabase.rpc('toggle_reaction', {
        p_item_key: itemKey,
        p_reaction_type: newUserReaction,
        p_old_reaction_type: oldReaction
      });
    } catch (err) {
      console.error("Error updating reaction:", err);
    }
  };

  const totalReactions = Object.values(reactions).reduce((a, b) => a + b, 0);

  return (
    <>
      <div className="glass ann-card" onClick={() => setIsOpen(true)}>
        <div className="ann-meta">
          <span className={`tag ${tagClass(item.Tag)}`}>
            {(item.Tag || 'INFO').toUpperCase()}
          </span>
          {item.Priority === 'high' && (
            <span className="tag tag-red" style={{marginLeft: '8px'}}>PRIORITY</span>
          )}
          <span className="ann-date" style={{marginLeft: 'auto'}}>{item.Date || ''}</span>
        </div>
        <div className="ann-title">{item.Title || 'Untitled'}</div>
        <div className="ann-body">{item.Body || ''}</div>
        
        <div className="ann-card-footer" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px'}}>
          <div className="ann-source" style={{margin: 0}}>
            <i className="fa-brands fa-google"></i>
            {item.Council ? item.Council.toUpperCase() + ' COUNCIL' : 'ALFA CO.'}
          </div>
          {totalReactions > 0 && (
            <div className="ann-reactions-summary" style={{fontSize: '12px', color: 'var(--text-dim)', display: 'flex', gap: '4px'}}>
              {reactions.like > 0 && <span>👍 {reactions.like}</span>}
              {reactions.heart > 0 && <span>❤️ {reactions.heart}</span>}
              {reactions.clap > 0 && <span>👏 {reactions.clap}</span>}
              {reactions.salute > 0 && <span>🫡 {reactions.salute}</span>}
            </div>
          )}
        </div>
      </div>

      {isOpen && createPortal(
        <div className="modal-overlay" onClick={(e) => {
          if (e.target.className === 'modal-overlay') setIsOpen(false);
        }}>
          <div className="modal glass" style={{maxWidth: '600px'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px'}}>
              <div className="ann-meta" style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                <span className={`tag ${tagClass(item.Tag)}`}>
                  {(item.Tag || 'INFO').toUpperCase()}
                </span>
                {item.Priority === 'high' && (
                  <span className="tag tag-red">PRIORITY</span>
                )}
                <span className="ann-date">{item.Date || ''}</span>
              </div>
              <button className="btn-icon" onClick={() => setIsOpen(false)} style={{border: 'none', background: 'transparent'}}><i className="fa fa-xmark"></i></button>
            </div>
            
            <h3 style={{marginBottom: '16px', fontSize: '22px', lineHeight: '1.3'}}>{item.Title || 'Untitled'}</h3>
            <div style={{color: 'var(--text-muted)', lineHeight: '1.6', whiteSpace: 'pre-wrap', marginBottom: '24px', fontSize: '14px'}}>
              {item.Body || ''}
            </div>

            <div className="reactions-container" style={{display: 'flex', gap: '8px', marginBottom: '16px'}}>
              <button 
                onClick={(e) => handleReaction(e, 'like')} 
                className="btn" 
                style={{padding: '4px 10px', fontSize: '14px', background: userReaction === 'like' ? 'var(--bg-glass-strong)' : 'transparent', border: '1px solid var(--border-strong)', borderRadius: '20px'}}
              >
                👍 {reactions.like || ''}
              </button>
              <button 
                onClick={(e) => handleReaction(e, 'heart')} 
                className="btn" 
                style={{padding: '4px 10px', fontSize: '14px', background: userReaction === 'heart' ? 'var(--bg-glass-strong)' : 'transparent', border: '1px solid var(--border-strong)', borderRadius: '20px'}}
              >
                ❤️ {reactions.heart || ''}
              </button>
              <button 
                onClick={(e) => handleReaction(e, 'clap')} 
                className="btn" 
                style={{padding: '4px 10px', fontSize: '14px', background: userReaction === 'clap' ? 'var(--bg-glass-strong)' : 'transparent', border: '1px solid var(--border-strong)', borderRadius: '20px'}}
              >
                👏 {reactions.clap || ''}
              </button>
              <button 
                onClick={(e) => handleReaction(e, 'salute')} 
                className="btn" 
                style={{padding: '4px 10px', fontSize: '14px', background: userReaction === 'salute' ? 'var(--bg-glass-strong)' : 'transparent', border: '1px solid var(--border-strong)', borderRadius: '20px'}}
              >
                🫡 {reactions.salute || ''}
              </button>
            </div>

            <div className="ann-source" style={{paddingTop: '16px', borderTop: '1px solid var(--border-strong)', color: 'var(--text-dim)', fontSize: '12px'}}>
              <i className="fa-brands fa-google" style={{marginRight: '6px'}}></i> 
              Posted by {item.Council ? item.Council.toUpperCase() + ' COUNCIL' : 'ALFA CO.'}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
