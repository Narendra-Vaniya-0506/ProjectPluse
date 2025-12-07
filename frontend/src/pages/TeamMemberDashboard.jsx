import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { getProjectsForTeamMember, updateProjectStatus } from '../utils/api';
import './TeamMemberDashboard.css';

const TeamMemberDashboard = () => {
  const [projects, setProjects] = useState([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading } = useSelector((state) => state.auth);
  const [socket, setSocket] = useState(null);

  if (!loading && user?.role !== 'Team Member') {
    navigate('/login');
    return null;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await getProjectsForTeamMember(user.username);
        setProjects(data);
      } catch (error) {
        console.error('Failed to fetch projects');
      }
    };
    fetchProjects();
  }, [user.username]);

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
      console.log('Team Member Dashboard connected to Socket.IO server');
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

  const handleEnterProject = (project) => {
    navigate(`/chat/${project._id}`);
  };

  return (
    <div className="tm-dashboard">
      <h1>Team Member Dashboard</h1>
      <div className="projects-section">
        <h2>My Projects</h2>
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
            {projects.map(project => (
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
      </div>
    </div>
  );
};

export default TeamMemberDashboard;
