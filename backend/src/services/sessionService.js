const crypto = require('crypto');
const { Op } = require('sequelize');
const { sequelize } = require('../database/config/database');

class SessionService {
  /**
   * Generate a secure session token
   */
  static generateSessionToken() {
    return crypto.randomBytes(64).toString('hex');
  }

  /**
   * Create a new session for a user
   * @param {number} userId - User ID
   * @param {Object} deviceInfo - Device/browser information
   * @param {string} ipAddress - Client IP address
   * @returns {Object} Session data
   */
  static async createSession(userId, deviceInfo = {}, ipAddress = null) {
    try {
      const { UserSession } = require('../models');
      
      // Generate unique session token
      const sessionToken = this.generateSessionToken();
      
      // Set expiration to 2 days from now
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 2);
      
      // Create session record
      const session = await UserSession.create({
        user_id: userId,
        session_token: sessionToken,
        expires_at: expiresAt,
        is_active: true,
        device_info: JSON.stringify(deviceInfo),
        ip_address: ipAddress,
      });

      console.log(`✅ New session created for user ${userId}:`, {
        sessionId: session.id,
        token: sessionToken.substring(0, 10) + '...',
        expiresAt: expiresAt.toISOString(),
      });

      return {
        sessionId: session.id,
        sessionToken,
        expiresAt,
        userId,
      };
    } catch (error) {
      console.error('❌ Error creating session:', error);
      throw new Error('Failed to create session');
    }
  }

  /**
   * Validate a session token
   * @param {string} sessionToken - Session token to validate
   * @returns {Object|null} Session data with user info or null if invalid
   */
  static async validateSession(sessionToken) {
    try {
      const { UserSession, User } = require('../models');
      
      const session = await UserSession.findOne({
        where: {
          session_token: sessionToken,
          is_active: true,
          expires_at: {
            [Op.gt]: new Date(), // Not expired
          },
        },
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'phone'],
        }],
      });

      if (!session) {
        console.log('🚫 Invalid or expired session token');
        return null;
      }

      // Update last accessed time
      await session.update({ updated_at: new Date() });

      return {
        sessionId: session.id,
        userId: session.user_id,
        user: session.user,
        expiresAt: session.expires_at,
      };
    } catch (error) {
      console.error('❌ Error validating session:', error);
      return null;
    }
  }

  /**
   * Invalidate a specific session
   * @param {string} sessionToken - Session token to invalidate
   */
  static async invalidateSession(sessionToken) {
    try {
      const { UserSession } = require('../models');
      
      await UserSession.update(
        { is_active: false },
        {
          where: {
            session_token: sessionToken,
            is_active: true,
          },
        }
      );

      console.log('🔒 Session invalidated');
    } catch (error) {
      console.error('❌ Error invalidating session:', error);
    }
  }

  /**
   * Invalidate all sessions for a user
   * @param {number} userId - User ID
   */
  static async invalidateUserSessions(userId) {
    try {
      const { UserSession } = require('../models');
      
      await UserSession.update(
        { is_active: false },
        {
          where: {
            user_id: userId,
            is_active: true,
          },
        }
      );

      console.log(`🔒 All sessions invalidated for user ${userId}`);
    } catch (error) {
      console.error('❌ Error invalidating user sessions:', error);
    }
  }

  /**
   * Clean up expired sessions (run periodically)
   */
  static async cleanupExpiredSessions() {
    try {
      const { UserSession } = require('../models');
      
      const result = await UserSession.destroy({
        where: {
          [Op.or]: [
            {
              expires_at: {
                [Op.lt]: new Date(), // Expired
              },
            },
            {
              is_active: false,
              created_at: {
                [Op.lt]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Inactive for 7 days
              },
            },
          ],
        },
      });

      if (result > 0) {
        console.log(`🧹 Cleaned up ${result} expired/inactive sessions`);
      }

      return result;
    } catch (error) {
      console.error('❌ Error cleaning up sessions:', error);
    }
  }

  /**
   * Get active sessions for a user
   * @param {number} userId - User ID
   * @returns {Array} List of active sessions
   */
  static async getUserSessions(userId) {
    try {
      const { UserSession } = require('../models');
      
      const sessions = await UserSession.findAll({
        where: {
          user_id: userId,
          is_active: true,
          expires_at: {
            [Op.gt]: new Date(),
          },
        },
        attributes: ['id', 'device_info', 'ip_address', 'created_at', 'expires_at'],
        order: [['created_at', 'DESC']],
      });

      return sessions.map(session => ({
        sessionId: session.id,
        deviceInfo: JSON.parse(session.device_info || '{}'),
        ipAddress: session.ip_address,
        createdAt: session.created_at,
        expiresAt: session.expires_at,
      }));
    } catch (error) {
      console.error('❌ Error fetching user sessions:', error);
      return [];
    }
  }
}

module.exports = SessionService;
