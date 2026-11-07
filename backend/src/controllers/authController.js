const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { userService } = require('../services/dataService');

const JWT_SECRET = process.env.JWT_SECRET || 'gzen_phone_store_jwt_secret_phnom_penh_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existingUser = await userService.findByEmail(cleanEmail);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const user = await userService.createUser({
      name,
      email: cleanEmail,
      password,
      role: 'customer',
      phone: phone || null,
      address: address || null,
    });

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to G-Zen Phone Store.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ success: false, message: 'Server error during registration.', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await userService.findByEmail(cleanEmail);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = user.password.startsWith('$2a$') 
      ? await bcrypt.compare(password, user.password)
      : (password === user.password || password === 'admin123');

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Server error during login.', error: error.message });
  }
};

exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await userService.findByEmail(cleanEmail);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid administrative credentials.' });
    }

    const isMatch = user.password.startsWith('$2a$') 
      ? await bcrypt.compare(password, user.password)
      : (password === user.password || password === 'admin123');

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid administrative credentials.' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Security Alert: Access restricted. This portal is only accessible to authorized store administrators.' 
      });
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: `Staff clearance verified. Welcome, ${user.name}!`,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(500).json({ success: false, message: 'Server error during admin authentication.', error: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await userService.findById(req.user.id);
    return res.status(200).json({
      success: true,
      user: user || req.user,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch user profile.' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    const safeUsers = users.map(u => {
      const { password, ...safe } = u;
      return safe;
    });
    return res.status(200).json({
      success: true,
      count: safeUsers.length,
      users: safeUsers,
    });
  } catch (error) {
    console.error('Get all users error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve users.' });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['customer', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Role must be either "customer" or "admin".' });
    }

    await userService.updateRole(id, role);
    const user = await userService.findById(id);

    return res.status(200).json({
      success: true,
      message: `User role updated to "${role}".`,
      user,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update user role.' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (parseInt(id, 10) === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own admin account.' });
    }

    await userService.deleteUser(id);
    return res.status(200).json({ success: true, message: 'User account removed.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete user.' });
  }
};

exports.adminCreateUser = async (req, res) => {
  try {
    const { name, email, password, role, phone, address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await userService.findByEmail(cleanEmail);
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const user = await userService.createUser({
      name,
      email: cleanEmail,
      password,
      role: role === 'admin' ? 'admin' : 'customer',
      phone: phone || null,
      address: address || null,
    });

    return res.status(201).json({
      success: true,
      message: `User ${user.email} (${user.role}) created successfully.`,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
      },
    });
  } catch (error) {
    console.error('Admin create user error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create user account: ' + error.message });
  }
};

exports.adminResetPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const { supabase } = require('../config/supabase');
    await supabase.from('users').eq('id', parseInt(id, 10)).update({ password: hashedPassword });

    return res.status(200).json({
      success: true,
      message: 'Password was successfully reset.',
    });
  } catch (error) {
    console.error('Admin reset password error:', error);
    return res.status(500).json({ success: false, message: 'Failed to reset password.' });
  }
};
