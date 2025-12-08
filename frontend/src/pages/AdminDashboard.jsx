import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { createUser, createProject, getAllProjects, getAllUsers } from '../utils/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Project Manager');
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectCardsNumber, setProjectCardsNumber] = useState('');
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeamMembers, setSelectedTeamMembers] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [usersCurrentPage, setUsersCurrentPage] = useState(1);
  const [projectsCurrentPage, setProjectsCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading } = useSelector((state) => state.auth);
  const [socket, setSocket] = useState(null);

  if (!loading && user?.role !== 'Admin') {
    navigate('/login');
    return null;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  useEffect(() => {
  const fetchProjects = async () => {
    try {
      console.log('Admin: Fetching all projects');
      const data = await getAllProjects();
      console.log('Admin: Projects fetched:', data);
      console.log('Admin: Setting projects state');
      setProjects(data);
      console.log('Admin: Projects state set, current projects:', data);
    } catch (error) {
      console.error('Failed to fetch projects');
    }
  };
    fetchProjects();

    const fetchUsers = async () => {
      try {
        console.log('Admin: Fetching all users');
        const data = await getAllUsers();
        console.log('Admin: Users fetched:', data);
        setUsers(data);
      } catch (error) {
        console.error('Failed to fetch users');
      }
    };
    fetchUsers();
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
      console.log('Admin Dashboard connected to Socket.IO server');
    });

    newSocket.on('projectStatusUpdated', (updatedProject) => {
      console.log('Received projectStatusUpdated event:', updatedProject);
      setProjects(prevProjects =>
        prevProjects.map(project =>
          project._id === updatedProject._id ? updatedProject : project
        )
      );
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Disconnected from Socket.IO server, reason:', reason);
    });

    return () => {
      console.log('Disconnecting socket');
      newSocket.disconnect();
    };
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await createUser({ email, name, password, role });
      alert('User created successfully');
      setEmail('');
      setName('');
      setPassword('');
      fetchUsers();
    } catch (error) {
      alert('Failed to create user');
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (selectedTeamMembers.length === 0) {
      alert('Please select at least one team member.');
      return;
    }
    try {
      await createProject({ name: projectName, description: projectDescription, createdBy: user.username, teamMembers: selectedTeamMembers, cardsNumber: parseInt(projectCardsNumber) || 0 });
      alert('Project created successfully');
      setProjectName('');
      setProjectDescription('');
      setProjectCardsNumber('');
      setSelectedTeamMembers([]);
      fetchProjects();
    } catch (error) {
      alert('Failed to create project');
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setShowSuggestions(e.target.value.length > 0);
  };

  const handleInputBlur = () => {
    setTimeout(() => setShowSuggestions(false), 300);
  };

  const allTeamMembers = users.filter(user => user.role === 'Team Member');
  const filteredUsers = users.filter(user => user.role === 'Team Member' && user.username.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleSelectTeamMember = (user) => {
    if (!selectedTeamMembers.includes(user.username)) {
      setSelectedTeamMembers([...selectedTeamMembers, user.username]);
    }
  };

  const handleRemoveTeamMember = (username) => {
    setSelectedTeamMembers(selectedTeamMembers.filter(member => member !== username));
  };

  const fetchProjects = async () => {
    try {
      const data = await getAllProjects();
      setProjects(data);
    } catch (error) {
      console.error('Failed to fetch projects');
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users');
    }
  };



  const handleEnterProject = (project) => {
    navigate(`/chat/${project._id}`);
  };

  // Pagination logic for users
  const usersIndexOfLastItem = usersCurrentPage * itemsPerPage;
  const usersIndexOfFirstItem = usersIndexOfLastItem - itemsPerPage;
  const currentUsers = users.slice(usersIndexOfFirstItem, usersIndexOfLastItem);
  const usersTotalPages = Math.ceil(users.length / itemsPerPage);

  // Pagination logic for projects
  const projectsIndexOfLastItem = projectsCurrentPage * itemsPerPage;
  const projectsIndexOfFirstItem = projectsIndexOfLastItem - itemsPerPage;
  const currentProjects = projects.slice(projectsIndexOfFirstItem, projectsIndexOfLastItem);
  const projectsTotalPages = Math.ceil(projects.length / itemsPerPage);

  const renderPagination = (currentPage, totalPages, setPage) => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          className={`pagination-button ${i === currentPage ? 'active' : ''}`}
          onClick={() => setPage(i)}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <div className="forms-container">
        <form onSubmit={handleCreateUser}>
          <h2>Create User</h2>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="Project Manager">Project Manager</option>
            <option value="Team Member">Team Member</option>
          </select>
          <button type="submit">Create User</button>
        </form>
        <form onSubmit={handleCreateProject}>
          <h2>Create Project</h2>
          <input
            type="text"
            placeholder="Project Name"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            required
          />
          <textarea
            placeholder="Project Description"
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Number of Cards"
            value={projectCardsNumber}
            onChange={(e) => setProjectCardsNumber(e.target.value)}
            required
            min="1"
          />
          <div className="search-container">
            <input
              type="text"
              placeholder="Search Team Members"
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
              autoComplete="off"
            />
            {showSuggestions && (
              <div className="suggestions-dropdown">
                {allTeamMembers.filter(user => (user.name || user.username).toLowerCase().startsWith(searchTerm.toLowerCase())).map(user => (
                  <div key={user._id} className="suggestion-item">
                    <span>{user.name || user.username}</span>
                    <button type="button" onClick={() => { handleSelectTeamMember(user); setSearchTerm(''); setShowSuggestions(false); }}>Select</button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="selected-team-members">
            <h3>Selected Team Members:</h3>
            {selectedTeamMembers.map(member => (
              <div key={member} className="selected-member">
                <span>{member}</span>
                <button type="button" onClick={() => handleRemoveTeamMember(member)}>Remove</button>
              </div>
            ))}
          </div>
          <button type="submit">Create Project</button>
        </form>
      </div>
      <div className="users-section">
        <h2>All Users</h2>
        <table className="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Created By</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map(user => (
              <tr key={user._id}>
                <td>{user.name || user.username}</td>
                <td>{user.username}</td>
                <td>{user.role}</td>
                <td>{user.createdBy || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {usersTotalPages > 1 && (
          <div className="pagination">
            {renderPagination(usersCurrentPage, usersTotalPages, setUsersCurrentPage)}
          </div>
        )}
      </div>
      <div className="projects-section">
        <h2>All Projects</h2>
        <table className="projects-table">
          <thead>
            <tr>
              <th>Project Name</th>
              <th>Created Date</th>
              <th>Created By</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentProjects.map(project => (
              <tr key={project._id}>
                <td>{project.name}</td>
                <td>{new Date(project.createdAt).toLocaleDateString()}</td>
                <td>{project.createdBy}</td>
                <td>
                  <button onClick={() => handleEnterProject(project)}>Enter</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {projectsTotalPages > 1 && (
          <div className="pagination">
            {renderPagination(projectsCurrentPage, projectsTotalPages, setProjectsCurrentPage)}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
