import { supabase } from '../lib/supabase'
import { encryptPassword, verifyPassword, generateSalt } from '../utils/encryption'

export interface AuthUser {
  id: string
  email: string
  displayName?: string
  isAdmin?: boolean
  isSchoolManager?: boolean
  paymentStatus?: string
  trialExpiresAt?: string
}

export class AuthService {
  static async signUp(email: string, password: string, displayName?: string, invitationCode?: string): Promise<AuthUser> {
    try {
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single()

      if (existingUser) {
        throw new Error('E-Mail bereits registriert')
      }

      // Encrypt password
      const salt = generateSalt()
      const passwordHash = await encryptPassword(password, salt)

      // Determine payment status based on invitation
      let paymentStatus = 'pending'
      let trialExpiresAt = null

      if (invitationCode) {
        const { data: invitation } = await supabase
          .from('invitations')
          .select('*')
          .eq('code', invitationCode)
          .eq('is_active', true)
          .is('used_by', null)
          .gte('expires_at', new Date().toISOString())
          .single()

        if (invitation) {
          paymentStatus = 'trial'
          const expiryDate = new Date()
          expiryDate.setDate(expiryDate.getDate() + invitation.trial_days)
          trialExpiresAt = expiryDate.toISOString()

          // Mark invitation as used
          await supabase
            .from('invitations')
            .update({
              used_by: email,
              used_at: new Date().toISOString()
            })
            .eq('id', invitation.id)
        }
      }

      // Create user
      const { data: user, error } = await supabase
        .from('users')
        .insert({
          email,
          password_hash: passwordHash,
          salt,
          display_name: displayName || email.split('@')[0],
          payment_status: paymentStatus,
          trial_expires_at: trialExpiresAt,
          last_login: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      return {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        isAdmin: user.is_admin,
        paymentStatus: user.payment_status,
        trialExpiresAt: user.trial_expires_at
      }
    } catch (error) {
      console.error('Sign up error:', error)
      throw error
    }
  }

  static async signIn(email: string, password: string): Promise<AuthUser> {
    try {
      // Get user from database
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single()

      if (error || !user) {
        throw new Error('Konto nicht gefunden')
      }

      // Verify password
      const isValid = await verifyPassword(password, user.password_hash, user.salt)
      if (!isValid) {
        throw new Error('Ungültiges Passwort')
      }

      // Update last login
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', user.id)

      return {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        isAdmin: user.is_admin,
        isSchoolManager: user.is_school_manager,
        paymentStatus: user.payment_status,
        trialExpiresAt: user.trial_expires_at
      }
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    }
  }

  static async getCurrentUser(userId: string): Promise<AuthUser | null> {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error || !user) return null

      return {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        isAdmin: user.is_admin,
        isSchoolManager: user.is_school_manager,
        paymentStatus: user.payment_status,
        trialExpiresAt: user.trial_expires_at
      }
    } catch (error) {
      console.error('Get current user error:', error)
      return null
    }
  }

  static async updateUser(userId: string, updates: Partial<AuthUser>): Promise<void> {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          display_name: updates.displayName,
          payment_status: updates.paymentStatus
        })
        .eq('id', userId)

      if (error) throw error
    } catch (error) {
      console.error('Update user error:', error)
      throw error
    }
  }

  static async resetPassword(userId: string, newPassword: string): Promise<void> {
    try {
      const salt = generateSalt()
      const passwordHash = await encryptPassword(newPassword, salt)

      const { error } = await supabase
        .from('users')
        .update({
          password_hash: passwordHash,
          salt
        })
        .eq('id', userId)

      if (error) throw error
    } catch (error) {
      console.error('Reset password error:', error)
      throw error
    }
  }

  static async getAllUsers(): Promise<AuthUser[]> {
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      return users.map(user => ({
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        isAdmin: user.is_admin,
        isSchoolManager: user.is_school_manager,
        paymentStatus: user.payment_status,
        trialExpiresAt: user.trial_expires_at
      }))
    } catch (error) {
      console.error('Get all users error:', error)
      throw error
    }
  }

  static async deleteUser(userId: string): Promise<void> {
    try {
      // Delete user's data first
      await supabase.from('grade_profiles').delete().eq('user_id', userId)
      await supabase.from('todos').delete().eq('user_id', userId)
      
      // Delete user
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId)

      if (error) throw error
    } catch (error) {
      console.error('Delete user error:', error)
      throw error
    }
  }
    static async logout(): Promise<void> {
    try {
      localStorage.removeItem('currentUser');
      sessionStorage.removeItem('currentUser');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }
}