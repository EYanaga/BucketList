import React, { useEffect, useState } from 'react';
import OldestItemsChart from './OldestItemsChart';
import './App.css';
import { db } from './firebase';
import { collection, addDoc, onSnapshot, updateDoc, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { auth } from './firebase';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';

function App() {
  // Edit modal state
  const [editItem, setEditItem] = useState(null);
  const [editText, setEditText] = useState("");
  const [editCreatedAt, setEditCreatedAt] = useState("");
  const [editCompletedAt, setEditCompletedAt] = useState("");
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Listen for auth changes
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthChecked(true);
    });
    return unsub;
  }, []);

  // Login with Google
  const login = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  // Logout
  const logout = async () => {
    await signOut(auth);
  };

  const [bucketList, setBucketList] = useState([]);
  const [newItem, setNewItem] = useState("");

  // Listen for real-time updates from Firestore
  useEffect(() => {
    // Listen for real-time updates
    const unsubscribe = onSnapshot(collection(db, 'bucketlist'), (snapshot) => {
      setBucketList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, []);

  // Add a new item
  const addItem = async (e) => {
    e.preventDefault();
    if (newItem.trim() === "") return;
    await addDoc(collection(db, "bucketlist"), {
      text: newItem,
      completed: false,
      createdAt: serverTimestamp(),
      completedAt: null,
    });
    setNewItem("");
  };

  // Warning modal state
  const [pendingDelete, setPendingDelete] = useState(null);

  // Delete an item (after confirm)
  const deleteItem = async (item) => {
    await deleteDoc(doc(db, "bucketlist", item.id));
    setPendingDelete(null);
  };

  // Open warning modal
  const handleDeleteClick = (item) => {
    setPendingDelete(item);
  };

  // Cancel warning modal
  const cancelDelete = () => {
    setPendingDelete(null);
  };

  // Toggle accomplished status
  const toggleComplete = async (item) => {
    await updateDoc(doc(db, "bucketlist", item.id), {
      completed: !item.completed,
      completedAt: !item.completed ? serverTimestamp() : null,
    });
  };

  // Edit modal logic
  const handleEditClick = (item) => {
    setEditItem(item);
    setEditText(item.text);
    setEditCreatedAt(item.createdAt && item.createdAt.seconds ? new Date(item.createdAt.seconds * 1000).toISOString().slice(0,16) : "");
    setEditCompletedAt(item.completedAt && item.completedAt.seconds ? new Date(item.completedAt.seconds * 1000).toISOString().slice(0,16) : "");
  };
  const handleEditCancel = () => {
    setEditItem(null);
    setEditText("");
    setEditCreatedAt("");
    setEditCompletedAt("");
  };
  const handleEditSave = async () => {
    if (!editItem) return;
    const updates = { text: editText };
    if (editCreatedAt) updates.createdAt = new Date(editCreatedAt);
    if (editCompletedAt) updates.completedAt = new Date(editCompletedAt);
    await updateDoc(doc(db, "bucketlist", editItem.id), updates);
    handleEditCancel();
  };

  // Creative display: Not completed as balloons, completed as checked cards
  return (
    <div className="App1980s">
      <div className="mountain-bg"></div>
      <h1 className="retro-title mountain-title">My Bucket List</h1>
      <div className="auth-bar">
        {authChecked && user ? (
          <>
            <span className="auth-status">
              {user.photoURL ? (
                <img src={user.photoURL} alt="avatar" className="auth-avatar" />
              ) : (
                <span className="auth-avatar" style={{fontSize: '1.7rem', background: '#b2a97e', display: 'flex', alignItems: 'center', justifyContent: 'center'}} role="img" aria-label="mountain avatar">🏔️</span>
              )}
              Signed in as <b>{user.displayName || user.email}</b>
            </span>
            <button className="retro-small-btn" onClick={logout}>Logout</button>
          </>
        ) : (
          <button className="retro-btn" onClick={login}>Sign in to Edit</button>
        )}
      </div>
      {user && (
        <form onSubmit={addItem} className="retro-form">
      
        <input
          value={newItem}
          onChange={e => setNewItem(e.target.value)}
          placeholder="New item..."
          className="retro-input"
        />
        <button type="submit" className="retro-btn">ADD</button>
      </form>
      )}
      <div className="retro-lists">
        <div className="retro-list">
          <h2 className="retro-subtitle">TO BE ACCOMPLISHED</h2>
          <ul>
            {bucketList.filter(item => !item.completed).map(item => (
              <li key={item.id} className="retro-li">
                <span>{item.text}</span>
                <div className="retro-btn-group">
                  {user ? (
                    <>
                      <button className="retro-small-btn btn-green" onClick={() => toggleComplete(item)}>✔</button>
                      <button className="retro-delete-btn" onClick={() => handleDeleteClick(item)} title="Delete">✖</button>
                    </>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="retro-list">
          <h2 className="retro-subtitle">ACCOMPLISHED</h2>
          <ul>
            {bucketList.filter(item => item.completed).map(item => (
              <li key={item.id} className="retro-li retro-li-done">
                <span>{item.text}</span>
                <div className="retro-btn-group">
                  {user ? (
                    <>
                      <button className="retro-small-btn btn-green" onClick={() => toggleComplete(item)}>↩</button>
                      <button className="retro-delete-btn" onClick={() => handleDeleteClick(item)} title="Delete">✖</button>
                    </>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>


      {/* Warning Modal */}
      {pendingDelete && (
        <div className="retro-modal-overlay">
          <div className="retro-modal">
            <div className="retro-modal-title">Warning!</div>
            <div className="retro-modal-text">
              Are you sure you want to delete this item?<br/>
              <span className="retro-modal-item">{pendingDelete.text}</span>
            </div>
            <div className="retro-modal-btns">
              <button className="retro-btn" onClick={() => deleteItem(pendingDelete)}>Delete</button>
              <button className="retro-small-btn" onClick={cancelDelete}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Oldest Items Bar Chart */}
      <OldestItemsChart items={bucketList} />

      {/* Horizontal TimelineBar above accomplished wall */}
      <TimelineBar 
        items={bucketList.filter(i => i.completed && i.completedAt).sort((a, b) => (a.completedAt?.seconds || 0) - (b.completedAt?.seconds || 0))}
        onMilestoneClick={user ? handleEditClick : undefined}
      />

      {/* Creative Accomplished Wall */}
      <div className="accomplished-wall wooden-sign">
        <div className="accomplished-wall-title">🏆 Accomplished 🏆</div>
        <div className="accomplished-badges">
          {bucketList.filter(item => item.completed && item.completedAt).length === 0 ? (
            <span className="accomplished-wall-empty">No accomplishments yet. Get started!</span>
          ) : (
            bucketList.filter(item => item.completed && item.completedAt)
              .sort((a, b) => (b.completedAt?.seconds || 0) - (a.completedAt?.seconds || 0))
              .map(item => (
                <span key={item.id} className="accomplished-badge">
                  {item.text}
                  {user && (
                    <button className="retro-small-btn" onClick={() => handleEditClick(item)} style={{marginLeft: '12px'}}>Edit</button>
                  )}
                </span>
              ))
          )}
        </div>
      </div>


      {/* Edit Modal */}
      {editItem && (
        <div className="retro-modal-overlay">
          <div className="retro-modal">
            <div className="retro-modal-title">Edit Item</div>
            <div className="retro-modal-text">
              <label>
                Text:<br/>
                <input
                  type="text"
                  value={editText}
                  onChange={e => setEditText(e.target.value)}
                  className="retro-input"
                  style={{marginBottom: '10px'}}
                />
              </label>
              <br/>
              <label>
                Created At:<br/>
                <input
                  type="datetime-local"
                  value={editCreatedAt}
                  onChange={e => setEditCreatedAt(e.target.value)}
                  className="retro-input"
                  style={{marginBottom: '10px'}}
                />
              </label>
              <br/>
              <label>
                Completed At:<br/>
                <input
                  type="datetime-local"
                  value={editCompletedAt}
                  onChange={e => setEditCompletedAt(e.target.value)}
                  className="retro-input"
                />
              </label>
            </div>
            <div className="retro-modal-btns">
              <button className="retro-btn" onClick={handleEditSave}>Save</button>
              <button className="retro-small-btn" onClick={handleEditCancel}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      <footer className="retro-footer">1980s Bucket List App &copy; 2025</footer>
    </div>
  );
}

// TimelineBar component
function TimelineBar({ items, onMilestoneClick }) {
  if (!items.length) return null;
  return (
    <div className="timeline-bar-container">
      <div className="timeline-bar">
        {items.map((item, idx) => {
          const dateObj = item.completedAt && item.completedAt.seconds ? new Date(item.completedAt.seconds * 1000) : null;
          const year = dateObj ? dateObj.getFullYear() : '';
          const dateStr = dateObj ? dateObj.toLocaleDateString() : '';
          return (
            <div
              className="timeline-milestone"
              key={item.id}
              style={{ left: `${(idx/(items.length-1||1))*100}%`, cursor: onMilestoneClick ? 'pointer' : 'default' }}
              onClick={onMilestoneClick ? () => onMilestoneClick(item) : undefined}
              title={onMilestoneClick ? 'Edit this accomplishment' : undefined}
            >
              <div className="timeline-circle">{year}</div>
              <div className="timeline-label">{item.text}</div>
              <div className="timeline-date-label">{dateStr}</div>
            </div>
          );
        })}
        <div className="timeline-horizontal" />
      </div>
    </div>
  );
}

export default App;
