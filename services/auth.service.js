const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const config = require('../config/config');

// Path al archivo JSON de usuarios
const usersFilePath = path.join(__dirname, '../data/users.json');

// Función para leer el archivo de usuarios
const getUsers = () => {
  try {
    const data = fs.readFileSync(usersFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error al leer el archivo de usuarios:', error);
    return [];
  }
};

// Función para escribir en el archivo de usuarios
const saveUsers = (users) => {
  try {
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error al guardar el archivo de usuarios:', error);
    return false;
  }
};

/**
 * Servicio de autenticación
 */
const authService = {
  /**
   * Registra un nuevo usuario
   * @param {Object} userData - Datos del usuario
   * @returns {Object} Usuario creado o error
   */
  register: async (userData) => {
    try {
      const users = getUsers();
      
      // Verificar si el correo ya existe
      const emailExists = users.some(user => user.correo === userData.correo);
      if (emailExists) {
        return { success: false, message: 'El correo electrónico ya está registrado' };
      }
      
      // Encriptar contraseña
      const salt = await bcrypt.genSalt(config.SALT_ROUNDS);
      const hashedPassword = await bcrypt.hash(userData.contraseña, salt);
      
      // Crear nuevo usuario
      const newUser = {
        id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
        numeroDocumento: userData.numeroDocumento,
        nombre: userData.nombre,
        apellido: userData.apellido,
        correo: userData.correo,
        contraseña: hashedPassword,
        rol: userData.rol || 'cliente', // Rol por defecto: cliente
        fecha_registro: new Date().toISOString()
      };
      
      // Guardar usuario
      users.push(newUser);
      saveUsers(users);
      
      // Eliminar contraseña antes de devolver el usuario
      const { contraseña, ...userWithoutPassword } = newUser;
      
      return { success: true, user: userWithoutPassword };
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      return { success: false, message: 'Error al registrar usuario' };
    }
  },
  
  /**
   * Inicia sesión con un usuario
   * @param {string} email - Correo electrónico
   * @param {string} password - Contraseña
   * @returns {Object} Token JWT y datos del usuario, o error
   */
  login: async (email, password) => {
    try {
      const users = getUsers();
      
      // Buscar usuario por correo
      const user = users.find(u => u.correo === email);
      if (!user) {
        return { success: false, message: 'Usuario no encontrado' };
      }
      
      // Verificar contraseña
      const isPasswordValid = await bcrypt.compare(password, user.contraseña);
      if (!isPasswordValid) {
        return { success: false, message: 'Contraseña incorrecta' };
      }
      
      // Generar token JWT
      const token = jwt.sign(
        { id: user.id, email: user.correo, role: user.rol },
        config.JWT_SECRET,
        { expiresIn: config.JWT_EXPIRATION }
      );
      
      // Eliminar contraseña antes de devolver el usuario
      const { contraseña, ...userWithoutPassword } = user;
      
      return {
        success: true,
        token,
        user: userWithoutPassword
      };
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      return { success: false, message: 'Error al iniciar sesión' };
    }
  },
  
  /**
   * Obtiene la información de un usuario por ID
   * @param {number} userId - ID del usuario
   * @returns {Object} Datos del usuario o error
   */
  getUserById: (userId) => {
    try {
      const users = getUsers();
      
      const user = users.find(u => u.id === userId);
      if (!user) {
        return { success: false, message: 'Usuario no encontrado' };
      }
      
      // Eliminar contraseña antes de devolver el usuario
      const { contraseña, ...userWithoutPassword } = user;
      
      return { success: true, user: userWithoutPassword };
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      return { success: false, message: 'Error al obtener usuario' };
    }
  },
  
  /**
   * Actualiza los datos de un usuario
   * @param {number} userId - ID del usuario
   * @param {Object} userData - Nuevos datos del usuario
   * @returns {Object} Usuario actualizado o error
   */
  updateUser: async (userId, userData) => {
    try {
      const users = getUsers();
      
      const userIndex = users.findIndex(u => u.id === userId);
      if (userIndex === -1) {
        return { success: false, message: 'Usuario no encontrado' };
      }
      
      // Si se actualizará la contraseña, encriptarla
      if (userData.contraseña) {
        const salt = await bcrypt.genSalt(config.SALT_ROUNDS);
        userData.contraseña = await bcrypt.hash(userData.contraseña, salt);
      }
      
      // Actualizar usuario
      users[userIndex] = { ...users[userIndex], ...userData };
      
      // Guardar cambios
      saveUsers(users);
      
      // Eliminar contraseña antes de devolver el usuario
      const { contraseña, ...userWithoutPassword } = users[userIndex];
      
      return { success: true, user: userWithoutPassword };
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      return { success: false, message: 'Error al actualizar usuario' };
    }
  }
};

module.exports = authService;