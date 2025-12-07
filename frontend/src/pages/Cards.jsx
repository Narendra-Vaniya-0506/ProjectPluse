import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { getCards, createCard, updateCard, deleteCard, getProjectDetails, getAllProjects, getProjects } from '../utils/api';
import './Cards.css';

const Cards = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [projectDetails, setProjectDetails] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCard, setNewCard] = useState({
    nameOfWork: '',
    teamMember: '',
    startDate: '',
    endDate: '',
    workList: []
  });
  const [editingCard, setEditingCard] = useState(null);
  const [extendingCard, setExtendingCard] = useState(null);
  const [newEndDate, setNewEndDate] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const { user, loading } = useSelector((state) => state.auth);
  const [socket, setSocket] = useState(null);

  if (!loading && !user) {
    navigate('/login');
    return null;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        let projects = await getAllProjects();
        let project = projects.find(p => p._id === projectId);
        if (!project && user.role === 'Project Manager') {
          projects = await getProjects(user.username);
          project = projects.find(p => p._id === projectId);
        }
        setProjectDetails(project);
      } catch (error) {
        console.error('Failed to fetch project details');
      }
    };
    fetchProjectDetails();
  }, [projectId, user]);

  useEffect(() => {
    if (projectDetails) {
      fetchCards();
    }
  }, [projectDetails]);

  // Update current time every second for timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const newSocket = io('http://localhost:5000', {
      transports: ['websocket', 'polling'],
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to Socket.IO server, socket ID:', newSocket.id);
      if (projectId) {
        console.log('Joining project room:', projectId);
        newSocket.emit('joinProject', projectId);
      }
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Disconnected from Socket.IO server, reason:', reason);
    });

    newSocket.on('cardCreated', (newCard) => {
      console.log('Received cardCreated event:', newCard);
      setCards(prevCards => {
        // Check if card already exists to avoid duplicates
        const exists = prevCards.some(card => card._id === newCard._id);
        if (!exists) {
          return [...prevCards, newCard];
        }
        return prevCards;
      });
    });

    newSocket.on('cardUpdated', (updatedCard) => {
      console.log('Received cardUpdated event:', updatedCard);
      setCards(prevCards => prevCards.map(card =>
        card._id === updatedCard._id ? updatedCard : card
      ));
    });

    newSocket.on('cardDeleted', ({ cardId }) => {
      console.log('Received cardDeleted event:', cardId);
      setCards(prevCards => prevCards.filter(card => card._id !== cardId));
    });

    newSocket.on('projectStatusUpdated', (updatedProject) => {
      console.log('Received projectStatusUpdated event in Cards:', updatedProject);
      if (updatedProject._id === projectId) {
        setProjectDetails(updatedProject);
      }
    });

    return () => {
      console.log('Disconnecting socket');
      newSocket.disconnect();
    };
  }, [projectId]);

  const fetchCards = async () => {
    try {
      const data = await getCards(projectId);
      setCards(data);
    } catch (error) {
      console.error('Failed to fetch cards');
    }
  };

  const handleCreateCard = async () => {
    if (user.role !== 'Project Manager' && user.role !== 'Admin') return;
    try {
      await createCard(projectId, newCard);
      setNewCard({
        nameOfWork: '',
        teamMember: '',
        startDate: '',
        endDate: '',
        workList: []
      });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create card');
    }
  };

  const handleUpdateCard = async (cardId, updates) => {
    if (user.role !== 'Project Manager' && user.role !== 'Admin') return;
    try {
      await updateCard(cardId, updates);
    } catch (error) {
      console.error('Failed to update card');
    }
  };

  const handleDeleteCard = async (cardId) => {
    console.log('User role:', user?.role);
    console.log('User:', user);
    if (user.role !== 'Project Manager' && user.role !== 'Admin') {
      console.log('User does not have permission to delete cards');
      return;
    }
    try {
      console.log('Deleting card:', cardId);
      await deleteCard(cardId);
      console.log('Card deleted successfully');
    } catch (error) {
      console.error('Failed to delete card:', error);
    }
  };

  const handleToggleTask = async (cardId, taskIndex) => {
    const card = cards.find(c => c._id === cardId);
    if (!card) return;

    // Check permissions: only assigned team member, project manager, or admin can toggle tasks
    if (user.username !== card.teamMember && user.role !== 'Project Manager' && user.role !== 'Admin') {
      return;
    }

    const updatedWorkList = card.workList.map((task, index) =>
      index === taskIndex ? { ...task, completed: !task.completed } : task
    );
    const completedTasks = updatedWorkList.filter(task => task.completed).length;
    const percentage = updatedWorkList.length > 0 ? Math.round((completedTasks / updatedWorkList.length) * 100) : 0;

    // Update local state immediately for live update
    const updatedCards = cards.map(c =>
      c._id === cardId ? { ...c, workList: updatedWorkList, percentage } : c
    );
    setCards(updatedCards);

    // Call API to persist changes
    try {
      await updateCard(cardId, { workList: updatedWorkList, percentage });
    } catch (error) {
      // Revert on error
      setCards(cards);
      console.error('Failed to update task');
    }
  };

  const handleUnlockCard = async (cardId) => {
    const card = cards.find(c => c._id === cardId);
    if (!card) return;
    setExtendingCard(card);
    setNewEndDate(card.endDate ? new Date(card.endDate).toISOString().split('T')[0] : '');
  };

  const handleExtendDueDate = async () => {
    if (!extendingCard || !newEndDate) return;
    if (user.role !== 'Project Manager' && user.role !== 'Admin') return;
    try {
      await handleUpdateCard(extendingCard._id, { endDate: newEndDate, locked: false });
      setExtendingCard(null);
      setNewEndDate('');
    } catch (error) {
      console.error('Failed to extend due date');
    }
  };

  const calculateRemainingTime = (endDate) => {
    if (!endDate) return 'No deadline';
    const end = new Date(endDate);
    const now = currentTime;
    const diff = end - now;

    if (diff <= 0) return 'Expired';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  const isCardLocked = (card) => {
    if (card.locked) return true;
    if (!card.endDate) return false; // Allow editing of auto-generated cards with null endDate
    const endDate = new Date(card.endDate);
    const now = new Date();
    return endDate < now;
  };

  const totalCards = cards.length;
  const completedCards = cards.filter(card => card.workList.length > 0 && card.workList.every(task => task.completed)).length;
  const pendingCards = totalCards - completedCards;

  // Calculate overall project completion percentage
  const totalTasks = cards.reduce((sum, card) => sum + card.workList.length, 0);
  const completedTasks = cards.reduce((sum, card) => sum + card.workList.filter(task => task.completed).length, 0);
  const overallPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Update project status based on overall percentage
  useEffect(() => {
    if (!projectDetails) return;

    let newStatus = projectDetails.status;
    if (overallPercentage === 100 && projectDetails.status !== 'done') {
      newStatus = 'done';
    } else if (overallPercentage < 100 && projectDetails.status === 'done') {
      newStatus = 'running';
    }

    if (newStatus !== projectDetails.status) {
      const updateProjectStatus = async () => {
        try {
          const response = await fetch(`http://localhost:5000/api/projects/${projectId}/status`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: newStatus, percentage: overallPercentage }),
          });
          if (response.ok) {
            console.log(`Project status updated to ${newStatus} with percentage ${overallPercentage}`);
          } else {
            console.error('Failed to update project status');
          }
        } catch (error) {
          console.error('Failed to update project status:', error);
        }
      };
      updateProjectStatus();
    }
  }, [overallPercentage, projectDetails, projectId]);

  return (
    <div className="cards-page">
      <div className="cards-container">
        <div className="cards-header">
          <h1>Cards for {projectDetails?.name || 'Project'} - {overallPercentage}% Completed</h1>
          <div className="cards-stats">
            <div className="stat-card">Total Cards: {totalCards}</div>
            <div className="stat-card">Completed: {completedCards}</div>
            <div className="stat-card">Pending: {pendingCards}</div>
            <div className="stat-card">Overall Progress: {overallPercentage}%</div>
          </div>
          <div className="cards-actions">
            {(user.role === 'Project Manager' || user.role === 'Admin') && (
              <button onClick={() => setShowCreateForm(true)}>Create Card</button>
            )}
            <button onClick={() => navigate(`/chat/${projectId}`)}>Back to Chat</button>
          </div>
        </div>
      {showCreateForm && (user.role === 'Project Manager' || user.role === 'Admin') && (
        <div className="create-card-form">
          <h2>Create New Card</h2>
          <div className="form-row">
            <input
              type="text"
              placeholder="Name of Work"
              value={newCard.nameOfWork}
              onChange={(e) => setNewCard({ ...newCard, nameOfWork: e.target.value })}
            />
            <select
              value={newCard.teamMember}
              onChange={(e) => setNewCard({ ...newCard, teamMember: e.target.value })}
            >
              <option value="">Select Team Member</option>
              {projectDetails?.teamMembers.map(member => (
                <option key={member} value={member}>{member}</option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <input
              type="date"
              placeholder="Start Date"
              value={newCard.startDate}
              onChange={(e) => setNewCard({ ...newCard, startDate: e.target.value })}
            />
            <input
              type="date"
              placeholder="End Date"
              value={newCard.endDate}
              onChange={(e) => setNewCard({ ...newCard, endDate: e.target.value })}
            />
          </div>
          <button onClick={handleCreateCard}>Create</button>
          <button onClick={() => setShowCreateForm(false)}>Cancel</button>
        </div>
      )}
      <div className="cards-list">
        {cards.map(card => (
          <div key={card._id} className={`card ${isCardLocked(card) ? 'locked' : ''}`}>
            <div className="card-header">
              <h3 className="card-title">{card.nameOfWork}</h3>
              <div className="card-percentage">{card.percentage}%</div>
              {(user.role === 'Project Manager' || user.role === 'Admin') && (
                <div className="card-actions">
                  <button onClick={() => setEditingCard(card)}>Edit</button>
                  <button onClick={() => handleDeleteCard(card._id)}>Delete</button>
                  {isCardLocked(card) && <button onClick={() => handleUnlockCard(card._id)}>Unlock</button>}
                </div>
              )}
            </div>
            <div className="card-details">
              <p><strong>Team Member:</strong> {card.teamMember}</p>
              <p><strong>Start Date:</strong> {card.startDate ? new Date(card.startDate).toISOString().split('T')[0] : ''}</p>
              <p><strong>End Date:</strong> {card.endDate ? new Date(card.endDate).toISOString().split('T')[0] : ''}</p>
              <p><strong>Time Remaining:</strong> <span className={`timer ${calculateRemainingTime(card.endDate) === 'Expired' ? 'expired' : ''}`}>{calculateRemainingTime(card.endDate)}</span></p>
              <div className="work-list">
                <h4>List of Work:</h4>
                {card.workList.map((task, index) => (
                  <div key={index} className={`task-item ${task.completed ? 'completed' : ''}`}>
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => handleToggleTask(card._id, index)}
                    />
                    <span>{task.task}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      </div>
      {editingCard && (user.role === 'Project Manager' || user.role === 'Admin') && (
        <div className="modal-overlay">
          <div className="edit-card-modal">
            <h2>Edit Card</h2>
            <input
              type="text"
              value={editingCard.nameOfWork}
              onChange={(e) => setEditingCard({ ...editingCard, nameOfWork: e.target.value })}
            />
            <select
              value={editingCard.teamMember}
              onChange={(e) => setEditingCard({ ...editingCard, teamMember: e.target.value })}
            >
              <option value="">Select Team Member</option>
              {projectDetails?.teamMembers.map(member => (
                <option key={member} value={member}>{member}</option>
              ))}
            </select>
            <input
              type="date"
              value={editingCard.startDate}
              onChange={(e) => setEditingCard({ ...editingCard, startDate: e.target.value })}
            />
            <input
              type="date"
              value={editingCard.endDate}
              onChange={(e) => setEditingCard({ ...editingCard, endDate: e.target.value })}
            />
            <div className="work-list-edit">
              <h4>Work List:</h4>
              {editingCard.workList.map((task, index) => (
                <div key={index} className="task-edit-item">
                  <input
                    type="text"
                    value={task.task}
                    onChange={(e) => {
                      const updatedWorkList = [...editingCard.workList];
                      updatedWorkList[index].task = e.target.value;
                      setEditingCard({ ...editingCard, workList: updatedWorkList });
                    }}
                  />
                  <button onClick={() => {
                    const updatedWorkList = editingCard.workList.filter((_, i) => i !== index);
                    setEditingCard({ ...editingCard, workList: updatedWorkList });
                  }}>
                    Remove
                  </button>
                </div>
              ))}
              <button onClick={() => setEditingCard({ ...editingCard, workList: [...editingCard.workList, { task: '', completed: false }] })}>
                Add Task
              </button>
            </div>
            <button onClick={() => { handleUpdateCard(editingCard._id, editingCard); setEditingCard(null); }}>Save</button>
            <button onClick={() => setEditingCard(null)}>Cancel</button>
          </div>
        </div>
      )}
      {extendingCard && (user.role === 'Project Manager' || user.role === 'Admin') && (
        <div className="modal-overlay">
          <div className="edit-card-modal">
            <h2>Extend Due Date</h2>
            <p>Current End Date: {extendingCard.endDate ? new Date(extendingCard.endDate).toISOString().split('T')[0] : 'None'}</p>
            <label>New End Date:</label>
            <input
              type="date"
              value={newEndDate}
              onChange={(e) => setNewEndDate(e.target.value)}
            />
            <button onClick={handleExtendDueDate}>Extend</button>
            <button onClick={() => { setExtendingCard(null); setNewEndDate(''); }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cards;
