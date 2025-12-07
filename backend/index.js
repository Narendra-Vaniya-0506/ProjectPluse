// @ts-nocheck
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const crypto = require('crypto');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('joinProject', (projectId) => {
    socket.join(projectId);
    console.log(`User ${socket.id} joined project ${projectId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// User schema
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  role: String,
  createdBy: String,
  name: String,
  selectedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema, 'users');

// Project schema
const projectSchema = new mongoose.Schema({
  name: String,
  description: String,
  createdBy: String,
  teamMembers: [String],
  cardsNumber: { type: Number, default: 0 },
  status: { type: String, default: 'created' },
  percentage: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const getProjectModel = (pmId) => {
  if (pmId === 'narendra@gmail.com') {
    return mongoose.model('admin_projects', projectSchema, 'admin_projects');
  }
  pmId = pmId.trim().replace(/@/g, '_').replace(/\./g, '_').replace(/[^a-zA-Z0-9_]/g, '');
  return mongoose.model(`pm_projects_${pmId}`, projectSchema, `pm_projects_${pmId}`);
};
const getUserModel = (pmId) => {
  pmId = pmId.trim().replace(/@/g, '_').replace(/\./g, '_').replace(/[^a-zA-Z0-9_]/g, '');
  return mongoose.model(`pm_users_${pmId}`, userSchema, `pm_users_${pmId}`);
};

// Encryption functions
const encryptMessage = (text, key) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
};

const decryptMessage = (encrypted, key) => {
  const parts = encrypted.split(':');
  const iv = Buffer.from(parts.shift(), 'hex');
  const encryptedText = parts.join(':');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

const generateChatKey = (user1, user2) => {
  // Create a consistent key from the two usernames
  const sortedUsers = [user1, user2].sort();
  return crypto.createHash('sha256').update(sortedUsers.join('')).digest('hex');
};

// Chat message schema
const chatMessageSchema = new mongoose.Schema({
  projectId: String,
  chatType: { type: String, enum: ['admin', 'pm', 'group', 'individual'], required: true },
  participants: [String], // usernames
  sender: String,
  message: String,
  encryptedMessage: String, // For individual chats
  status: { type: String, enum: ['sent', 'delivered', 'read'], default: 'sent' },
  isDeleted: { type: Boolean, default: false },
  editedAt: Date,
  timestamp: { type: Date, default: Date.now }
});

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema, 'chatmessages');

// Card schema
const cardSchema = new mongoose.Schema({
  projectId: String,
  nameOfWork: String,
  teamMember: String,
  startDate: Date,
  endDate: Date,
  workList: [{ task: String, completed: Boolean }],
  percentage: { type: Number, default: 0 },
  locked: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const Card = mongoose.model('Card', cardSchema, 'cards');

const getChatModel = () => {
  return ChatMessage;
};



// API endpoint for login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (email === 'narendra@gmail.com' && password === '12345678') {
      res.status(200).json({ user: { role: 'Admin', username: 'narendra@gmail.com', email: 'narendra@gmail.com', name: 'Admin' } });
    } else {
      // First check global users (PMs and Admin-created users)
      let user = await User.findOne({ username: email, password });
      if (user) {
        res.status(200).json({ user: { role: user.role, username: user.username, email: user.username, name: user.name } });
      } else {
        // If not found in global, check PM-created users
        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        const userCollections = collections.filter(col => col.name.startsWith('pm_users_'));
        for (const col of userCollections) {
          const UserModel = mongoose.model(col.name, userSchema, col.name);
          user = await UserModel.findOne({ username: email, password });
          if (user) {
            res.status(200).json({ user: { role: user.role, username: user.username, email: user.username, name: user.name } });
            return;
          }
        }
        res.status(401).json({ message: 'Invalid credentials' });
      }
    }
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// API endpoint for Admin to create users
app.post('/api/create-user', async (req, res) => {
  try {
    const { email, name, password, role } = req.body;
    console.log('Creating user:', { email, name, password, role });
    // For now, no auth check; assume only Admin calls this
    if (!['Project Manager', 'Team Member'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    // Check for duplicate email across all collections
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    const userCollections = collections.filter(col => col.name.startsWith('pm_users_') || col.name === 'users');
    for (const col of userCollections) {
      const UserModel = mongoose.model(col.name, userSchema, col.name);
      const existingUser = await UserModel.findOne({ username: email });
      if (existingUser) {
        return res.status(400).json({ error: 'This email is already taken try other' });
      }
    }
    const user = new User({ username: email, password, role, createdBy: 'Admin', name });
    const savedUser = await user.save();
    console.log('User saved:', savedUser);
    res.status(201).json({ message: 'User created successfully', user: savedUser });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// API endpoint for Project Manager to create users
app.post('/api/pm/create-user', async (req, res) => {
  try {
    const { email, name, password, role, pmId } = req.body;
    console.log('Creating user for PM:', { email, name, password, role, pmId });
    if (!['Team Member'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role for PM creation' });
    }
    // Check for duplicate email across all collections
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    const userCollections = collections.filter(col => col.name.startsWith('pm_users_') || col.name === 'users');
    for (const col of userCollections) {
      const UserModel = mongoose.model(col.name, userSchema, col.name);
      const existingUser = await UserModel.findOne({ username: email });
      if (existingUser) {
        return res.status(400).json({ error: 'This email is already taken try other' });
      }
    }
    const UserModel = getUserModel(pmId);
    const user = new UserModel({ username: email, password, role, createdBy: pmId, name });
    const savedUser = await user.save();
    console.log('User saved:', savedUser);
    res.status(201).json({ message: 'User created successfully', user: savedUser });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// API endpoint for Project Manager to create projects
app.post('/api/create-project', async (req, res) => {
  try {
    const { name, description, createdBy, teamMembers: tm, cardsNumber } = req.body;
    let teamMembers = tm || [];
    teamMembers = Array.isArray(teamMembers) ? teamMembers : [];
    console.log('Creating project:', { name, description, createdBy, teamMembers, cardsNumber });
    if (teamMembers.length === 0) {
      return res.status(400).json({ error: 'At least one team member is required' });
    }
    const ProjectModel = getProjectModel(createdBy);
    const project = new ProjectModel({ name, description, createdBy, teamMembers, cardsNumber });
    const savedProject = await project.save();
    console.log('Project saved:', savedProject);

    // Create the specified number of cards
    if (cardsNumber && cardsNumber > 0) {
      const cards = [];
      for (let i = 0; i < cardsNumber; i++) {
        cards.push({
          projectId: savedProject._id.toString(),
          nameOfWork: '',
          teamMember: '',
          startDate: null,
          endDate: null,
          workList: [],
          percentage: 0,
          locked: false
        });
      }
      await Card.insertMany(cards);
      console.log(`Created ${cardsNumber} cards for project ${savedProject._id}`);
    }

    res.status(201).json({ message: 'Project created successfully', project: savedProject });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// API endpoint for PM to get their projects
app.get('/api/pm/projects/:pmId', async (req, res) => {
  try {
    const { pmId } = req.params;
    const ProjectModel = getProjectModel(pmId);
    const projects = await ProjectModel.find();
    const formattedProjects = await Promise.all(projects.map(async (project) => {
      const cards = await Card.find({ projectId: project._id.toString() });
      const totalTasks = cards.reduce((sum, card) => sum + card.workList.length, 0);
      const completedTasks = cards.reduce((sum, card) => sum + card.workList.filter(task => task.completed).length, 0);
      const overallPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      await ProjectModel.findByIdAndUpdate(project._id, { percentage: overallPercentage });
      const projectObj = project.toObject();
      delete projectObj.status; // Remove status from dashboard response
      return {
        ...projectObj,
        createdBy: `created by - ${pmId}`,
        percentage: overallPercentage
      };
    }));
    res.status(200).json(formattedProjects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// API endpoint for Admin to get all projects
app.get('/api/admin/projects', async (req, res) => {
  try {
    console.log('Fetching all projects for admin');
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('All collections:', collections.map(c => c.name));
    const projectCollections = collections.filter(col => (col.name.startsWith('pm_projects_') || col.name === 'admin_projects'));
    console.log('Project collections found:', projectCollections.map(c => c.name));
    let allProjects = [];
    for (const col of projectCollections) {
      const ProjectModel = mongoose.model(col.name, projectSchema, col.name);
      const projects = await ProjectModel.find();
      const formattedProjects = await Promise.all(projects.map(async (project) => {
        const cards = await Card.find({ projectId: project._id.toString() });
        const totalTasks = cards.reduce((sum, card) => sum + card.workList.length, 0);
        const completedTasks = cards.reduce((sum, card) => sum + card.workList.filter(task => task.completed).length, 0);
        const overallPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        await ProjectModel.findByIdAndUpdate(project._id, { percentage: overallPercentage });
        const projectObj = project.toObject();
        delete projectObj.status; // Remove status from dashboard response
        return {
          ...projectObj,
          createdBy: `created by - ${project.createdBy || 'Unknown'}`,
          percentage: overallPercentage
        };
      }));
      allProjects = allProjects.concat(formattedProjects);
    }
    console.log('Total projects returned for admin:', allProjects.length);
    res.status(200).json(allProjects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// API endpoint for PM to get their users
app.get('/api/pm/users/:pmId', async (req, res) => {
  try {
    const { pmId } = req.params;
    const UserModel = getUserModel(pmId);
    const users = await UserModel.find();
    const formattedUsers = users.map(user => ({
      ...user.toObject(),
      createdBy: `created by - ${user.createdBy}`
    }));
    res.status(200).json(formattedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// API endpoint for Admin to get all users
app.get('/api/admin/users', async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    const userCollections = collections.filter(col => col.name.startsWith('pm_users_'));
    let allUsers = [];
    for (const col of userCollections) {
      const UserModel = mongoose.model(col.name, userSchema, col.name);
      const users = await UserModel.find();
      allUsers = allUsers.concat(users);
    }
    // Also include global users (PMs)
    const globalUsers = await User.find();
    allUsers = allUsers.concat(globalUsers);
    res.status(200).json(allUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// API endpoint for Team Member to get their projects
app.get('/api/team-member/projects/:username', async (req, res) => {
  try {
    const { username } = req.params;
    console.log('Fetching projects for team member:', username);
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    const projectCollections = collections.filter(col => col.name.startsWith('pm_projects_') || col.name === 'admin_projects');
    console.log('Project collections found:', projectCollections.map(c => c.name));
    let userProjects = [];
    for (const col of projectCollections) {
      const ProjectModel = mongoose.model(col.name, projectSchema, col.name);
      const projects = await ProjectModel.find({ teamMembers: { $in: [username] } });
      console.log(`Projects found in ${col.name} for ${username}:`, projects.length);
      console.log('Team members in projects:', projects.map(p => p.teamMembers));
      const formattedProjects = await Promise.all(projects.map(async (project) => {
        const cards = await Card.find({ projectId: project._id.toString() });
        const totalTasks = cards.reduce((sum, card) => sum + card.workList.length, 0);
        const completedTasks = cards.reduce((sum, card) => sum + card.workList.filter(task => task.completed).length, 0);
        const overallPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        const projectObj = project.toObject();
        delete projectObj.status; // Remove status from dashboard response
        return {
          ...projectObj,
          createdBy: `created by - ${project.createdBy || 'Unknown'}`,
          percentage: overallPercentage
        };
      }));
      userProjects = userProjects.concat(formattedProjects);
    }
    console.log('Total projects returned for', username, ':', userProjects.length);
    res.status(200).json(userProjects);
  } catch (error) {
    console.error('Error fetching projects for team member:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});



// API endpoint for Admin to delete a user
app.delete('/api/admin/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (user.role === 'Project Manager') {
      // Delete associated collections
      const db = mongoose.connection.db;
      const normalizedUsername = user.username.replace(/@/g, '_').replace(/\./g, '_');
      const projectsCollection = `pm_projects_${normalizedUsername}`;
      const usersCollection = `pm_users_${normalizedUsername}`;
      await db.dropCollection(projectsCollection).catch(() => {});
      await db.dropCollection(usersCollection).catch(() => {});
    }
    await User.findByIdAndDelete(id);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// API endpoint to get chat list for a project
app.get('/api/chat/:projectId/list', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { currentUser } = req.query;
    // Get project details to determine chat types
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    const projectCollections = collections.filter(col => col.name.startsWith('pm_projects_') || col.name === 'admin_projects');
    let project = null;
    for (const col of projectCollections) {
      const ProjectModel = mongoose.model(col.name, projectSchema, col.name);
      project = await ProjectModel.findById(projectId);
      if (project) break;
    }
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const participants = ['narendra@gmail.com', project.createdBy, ...project.teamMembers];
    const uniqueParticipants = [...new Set(participants)];

    const chatList = [
      { id: 'group', name: 'Group Chat', type: 'group', participants: uniqueParticipants }
    ];

    // Add individual chats for each project participant except the current user
    for (const participant of uniqueParticipants) {
      if (participant === currentUser) continue; // Skip self-chat

      let displayName = participant;
      // Try to get the name from users if available
      try {
        let user = await User.findOne({ username: participant });
        if (!user) {
          // Check PM collections
          const db = mongoose.connection.db;
          const collections = await db.listCollections().toArray();
          const userCollections = collections.filter(col => col.name.startsWith('pm_users_'));
          for (const col of userCollections) {
            const UserModel = mongoose.model(col.name, userSchema, col.name);
            user = await UserModel.findOne({ username: participant });
            if (user) break;
          }
        }
        if (user && user.name) {
          displayName = user.name;
        }
      } catch (error) {
        console.error('Error fetching user name:', error);
      }

      chatList.push({ id: `individual_${participant}`, name: displayName, type: 'individual', participants: [participant] });
    }

    res.status(200).json(chatList);
  } catch (error) {
    console.error('Error fetching chat list:', error);
    res.status(500).json({ error: 'Failed to fetch chat list' });
  }
});

// API endpoint to get chat messages for a specific chat
app.get('/api/chat/:projectId/:chatType/:chatId', async (req, res) => {
  try {
    const { projectId, chatType, chatId } = req.params;
    const { currentUser } = req.query; // Pass current user to check authorization
    let query = { projectId, chatType };
    if (chatType === 'individual') {
      query.participants = { $all: [currentUser, chatId].sort() };
    }
    const messages = await ChatMessage.find({ ...query, isDeleted: { $ne: true } }).sort({ timestamp: 1 });

    // Update status to 'delivered' for messages sent to current user if not already read
    await Promise.all(messages.map(async (msg) => {
      if (msg.sender !== currentUser && msg.status === 'sent') {
        await ChatMessage.findByIdAndUpdate(msg._id, { status: 'delivered' });
      }
    }));

    // Decrypt messages for chats with 2 participants for authorized users
    const processedMessages = messages.map(msg => {
      const msgObj = msg.toObject();
      if (msgObj.participants.length === 2 && msgObj.encryptedMessage) {
        // Check if current user is authorized to view this message
        if (msgObj.participants.includes(currentUser)) {
          try {
            const receiver = msgObj.participants.find(p => p !== msgObj.sender);
            const chatKey = generateChatKey(msgObj.sender, receiver);
            const decryptedMessage = decryptMessage(msgObj.encryptedMessage, chatKey);
            msgObj.message = decryptedMessage;
          } catch (error) {
            console.error('Error decrypting message:', error);
            msgObj.message = '[Decryption Error]';
          }
        } else {
          msgObj.message = '[Encrypted Message - Access Denied]';
        }
      }
      return msgObj;
    });

    res.status(200).json(processedMessages);
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    res.status(500).json({ error: 'Failed to fetch chat messages' });
  }
});

// API endpoint to post a chat message
app.post('/api/chat/:projectId/:chatType/:chatId', async (req, res) => {
  try {
    const { projectId, chatType, chatId } = req.params;
    const { sender, message } = req.body;

    // Get project details to determine participants
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    const projectCollections = collections.filter(col => col.name.startsWith('pm_projects_') || col.name === 'admin_projects');
    let project = null;
    for (const col of projectCollections) {
      const ProjectModel = mongoose.model(col.name, projectSchema, col.name);
      project = await ProjectModel.findById(projectId);
      if (project) break;
    }
    if (!project) return res.status(404).json({ error: 'Project not found' });

    let participants = [];
    if (chatType === 'group') participants = ['narendra@gmail.com', project.createdBy, ...project.teamMembers];
    else participants = [sender, chatId].sort(); // For individual, admin, pm chats

    let messageData = { projectId, chatType, participants, sender, message };

    // Encrypt messages for chats with 2 participants only (individual, admin, pm)
    if (participants.length === 2) {
      const receiver = chatId;
      const chatKey = generateChatKey(sender, receiver);
      const encryptedMessage = encryptMessage(message, chatKey);
      messageData.encryptedMessage = encryptedMessage;
      messageData.message = '[Encrypted Message]'; // Store a placeholder in the message field
    }

    const newMessage = new ChatMessage(messageData);
    const savedMessage = await newMessage.save();
    res.status(201).json(savedMessage);
  } catch (error) {
    console.error('Error posting chat message:', error);
    res.status(500).json({ error: 'Failed to post chat message' });
  }
});

// API endpoint to update message status
app.put('/api/chat/message/:messageId/status', async (req, res) => {
  try {
    const { messageId } = req.params;
    const { status } = req.body;
    if (!['sent', 'delivered', 'read'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const updatedMessage = await ChatMessage.findByIdAndUpdate(messageId, { status }, { new: true });
    if (!updatedMessage) return res.status(404).json({ error: 'Message not found' });
    res.status(200).json(updatedMessage);
  } catch (error) {
    console.error('Error updating message status:', error);
    res.status(500).json({ error: 'Failed to update message status' });
  }
});

// API endpoint to delete a message
app.delete('/api/chat/message/:messageId', async (req, res) => {
  try {
    const { messageId } = req.params;
    const { sender } = req.body; // Verify sender
    const message = await ChatMessage.findById(messageId);
    if (!message) return res.status(404).json({ error: 'Message not found' });
    if (message.sender !== sender) return res.status(403).json({ error: 'Unauthorized' });
    message.isDeleted = true;
    await message.save();
    res.status(200).json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

// API endpoint to edit a message
app.put('/api/chat/message/:messageId', async (req, res) => {
  try {
    const { messageId } = req.params;
    const { sender, message: newMessage } = req.body;
    const msg = await ChatMessage.findById(messageId);
    if (!msg) return res.status(404).json({ error: 'Message not found' });
    if (msg.sender !== sender) return res.status(403).json({ error: 'Unauthorized' });

    if (msg.chatType === 'individual') {
      // Re-encrypt the new message for individual chats
      const receiver = msg.participants.find(p => p !== msg.sender);
      const chatKey = generateChatKey(msg.sender, receiver);
      const encryptedMessage = encryptMessage(newMessage, chatKey);
      msg.encryptedMessage = encryptedMessage;
      msg.message = '[Encrypted Message]'; // Update placeholder
    } else {
      msg.message = newMessage;
    }

    msg.editedAt = new Date();
    await msg.save();
    res.status(200).json(msg);
  } catch (error) {
    console.error('Error editing message:', error);
    res.status(500).json({ error: 'Failed to edit message' });
  }
});

// API endpoints for cards

// Get cards for a project
app.get('/api/cards/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const cards = await Card.find({ projectId });

    // Update project status to 'running' if it's 'created' when someone accesses the cards
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    const projectCollections = collections.filter(col => col.name.startsWith('pm_projects_') || col.name === 'admin_projects');
    for (const col of projectCollections) {
      const ProjectModel = mongoose.model(col.name, projectSchema, col.name);
      const project = await ProjectModel.findById(projectId);
      if (project && project.status === 'created') {
        await ProjectModel.findByIdAndUpdate(projectId, { status: 'running' });
        console.log('Project status updated to running on card access:', projectId);
        break;
      }
    }

    res.status(200).json(cards);
  } catch (error) {
    console.error('Error fetching cards:', error);
    res.status(500).json({ error: 'Failed to fetch cards' });
  }
});

// Create a new card
app.post('/api/cards', async (req, res) => {
  try {
    const cardData = req.body;
    const newCard = new Card(cardData);
    const savedCard = await newCard.save();
    console.log('Card created:', savedCard._id, 'for project:', cardData.projectId);
    io.to(cardData.projectId).emit('cardCreated', savedCard);
    console.log('Emitted cardCreated event to room:', cardData.projectId);
    res.status(201).json(savedCard);
  } catch (error) {
    console.error('Error creating card:', error);
    res.status(500).json({ error: 'Failed to create card' });
  }
});

// Update a card
app.put('/api/cards/:cardId', async (req, res) => {
  try {
    const { cardId } = req.params;
    const updates = req.body;
    const updatedCard = await Card.findByIdAndUpdate(cardId, updates, { new: true });
    if (!updatedCard) return res.status(404).json({ error: 'Card not found' });

    // Recalculate project percentage and update status
    const cards = await Card.find({ projectId: updatedCard.projectId });
    const totalTasks = cards.reduce((sum, card) => sum + card.workList.length, 0);
    const completedTasks = cards.reduce((sum, card) => sum + card.workList.filter(task => task.completed).length, 0);
    const overallPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Find and update project status based on percentage
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    const projectCollections = collections.filter(col => col.name.startsWith('pm_projects_') || col.name === 'admin_projects');
    let updatedProject = null;
    for (const col of projectCollections) {
      const ProjectModel = mongoose.model(col.name, projectSchema, col.name);
      updatedProject = await ProjectModel.findById(updatedCard.projectId);
      if (updatedProject) {
        let newStatus = updatedProject.status;
        if (overallPercentage === 100) {
          newStatus = 'done';
        } else if (updatedProject.status === 'done' && overallPercentage < 100) {
          newStatus = 'running';
        }
        if (newStatus !== updatedProject.status) {
          updatedProject = await ProjectModel.findByIdAndUpdate(updatedCard.projectId, { status: newStatus, percentage: overallPercentage }, { new: true });
          io.emit('projectStatusUpdated', updatedProject);
          console.log('Project status updated to', newStatus, 'with percentage:', overallPercentage);
        } else {
          // Update percentage even if status didn't change
          updatedProject = await ProjectModel.findByIdAndUpdate(updatedCard.projectId, { percentage: overallPercentage }, { new: true });
          io.emit('projectStatusUpdated', updatedProject);
        }
        break;
      }
    }

    io.to(updatedCard.projectId).emit('cardUpdated', updatedCard);
    res.status(200).json(updatedCard);
  } catch (error) {
    console.error('Error updating card:', error);
    res.status(500).json({ error: 'Failed to update card' });
  }
});

// Delete a card
app.delete('/api/cards/:cardId', async (req, res) => {
  try {
    const { cardId } = req.params;
    const deletedCard = await Card.findByIdAndDelete(cardId);
    if (!deletedCard) return res.status(404).json({ error: 'Card not found' });
    io.to(deletedCard.projectId).emit('cardDeleted', { cardId });
    res.status(200).json({ message: 'Card deleted successfully' });
  } catch (error) {
    console.error('Error deleting card:', error);
    res.status(500).json({ error: 'Failed to delete card' });
  }
});


// Update project status
app.put('/api/projects/:projectId/status', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { status } = req.body;
    console.log('Updating project status:', projectId, 'to', status);

    // Find the project in all collections
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    const projectCollections = collections.filter(col => col.name.startsWith('pm_projects_') || col.name === 'admin_projects');
    let updatedProject = null;
    let collectionName = null;
    for (const col of projectCollections) {
      const ProjectModel = mongoose.model(col.name, projectSchema, col.name);
      updatedProject = await ProjectModel.findByIdAndUpdate(projectId, { status }, { new: true });
      if (updatedProject) {
        collectionName = col.name;
        break;
      }
    }

    if (!updatedProject) {
      console.log('Project not found:', projectId);
      return res.status(404).json({ error: 'Project not found' });
    }

    // Recalculate percentage after status update
    const cards = await Card.find({ projectId: updatedProject._id.toString() });
    const totalTasks = cards.reduce((sum, card) => sum + card.workList.length, 0);
    const completedTasks = cards.reduce((sum, card) => sum + card.workList.filter(task => task.completed).length, 0);
    const overallPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    updatedProject.percentage = overallPercentage;

    console.log('Project status updated successfully:', updatedProject._id, 'to', status, 'with percentage:', overallPercentage);
    io.emit('projectStatusUpdated', updatedProject);
    console.log('Emitted projectStatusUpdated event globally for project:', updatedProject._id);
    res.status(200).json(updatedProject);
  } catch (error) {
    console.error('Error updating project status:', error);
    res.status(500).json({ error: 'Failed to update project status' });
  }
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


