import { UserProgress } from "../types.ts";
import { INITIAL_PROGRESS } from "../constants.ts";

const USERS_KEY = 'hoot_auth_db_v1';
const PROGRESS_PREFIX = 'hoot_progress_v1_';

interface AuthDB {
  users: Record<string, { password: string; created: number }>;
}

export const authService = {
  // Get database
  getDB: (): AuthDB => {
    const db = localStorage.getItem(USERS_KEY);
    return db ? JSON.parse(db) : { users: {} };
  },

  // Save database
  saveDB: (db: AuthDB) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(db));
  },

  // Register a new user
  register: (username: string, password: string): { success: boolean; message: string } => {
    if (username.trim().toLowerCase() === 'guest') {
      return { success: false, message: 'The name "Guest" is reserved. Please choose another.' };
    }

    const db = authService.getDB();
    if (db.users[username]) {
      return { success: false, message: 'Username already exists.' };
    }
    
    db.users[username] = { password, created: Date.now() };
    authService.saveDB(db);
    
    // Initialize progress
    authService.saveUserProgress(username, INITIAL_PROGRESS);
    
    return { success: true, message: 'Account created successfully!' };
  },

  // Login
  login: (username: string, password: string): { success: boolean; message: string } => {
    const db = authService.getDB();
    const user = db.users[username];
    
    if (!user) {
      return { success: false, message: 'User not found.' };
    }
    
    if (user.password !== password) {
      return { success: false, message: 'Incorrect password.' };
    }
    
    return { success: true, message: 'Login successful!' };
  },

  // Load User Progress
  getUserProgress: (username: string): UserProgress => {
    const data = localStorage.getItem(PROGRESS_PREFIX + username);
    if (data) {
      try {
        return JSON.parse(data);
      } catch (e) {
        console.error("Error parsing progress", e);
      }
    }
    return INITIAL_PROGRESS;
  },

  // Save User Progress
  saveUserProgress: (username: string, progress: UserProgress) => {
    localStorage.setItem(PROGRESS_PREFIX + username, JSON.stringify(progress));
  }
};