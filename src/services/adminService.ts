import { supabase } from '../lib/supabase'
import { AuthUser } from './authService'

export interface DatabaseUser {
  id: string
  email: string
  display_name?: string
  is_admin?: boolean
  is_school_manager?: boolean
  payment_status?: 'pending' | 'paid' | 'expired' | 'free' | 'trial'
  trial_expires_at?: string
  created_at: string
  last_login?: string
}

export interface DatabaseStats {
  totalUsers: number
  adminUsers: number
  activeUsers: number
  trialUsers: number
  paidUsers: number
  totalProfiles: number
  totalTodos: number
  recentSignups: number
  revenue: number // NEU: Umsatz in Euro
}

export interface ConnectionLog {
  id: string
  timestamp: string
  status: 'online' | 'offline' | 'error'
  message: string
  duration?: number
}

export class AdminService {
  private static connectionLogs: ConnectionLog[] = []
  private static lastConnectionCheck = Date.now()
  private static isOnline = true

  // Connection monitoring
  static async checkConnection(): Promise<boolean> {
    try {
      const { error } = await supabase.from('users').select('count').limit(1)
      
      if (error) {
        this.logConnection('error', `Database error: ${error.message}`)
        this.isOnline = false
        return false
      }
      
      if (!this.isOnline) {
        const downtime = Date.now() - this.lastConnectionCheck
        this.logConnection('online', 'Database connection restored', downtime)
      }
      
      this.isOnline = true
      this.lastConnectionCheck = Date.now()
      return true
    } catch (error) {
      this.logConnection('offline', 'Database connection lost')
      this.isOnline = false
      return false
    }
  }

  static logConnection(status: 'online' | 'offline' | 'error', message: string, duration?: number) {
    const log: ConnectionLog = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      status,
      message,
      duration
    }
    
    this.connectionLogs.unshift(log)
    
    // Keep only last 100 logs
    if (this.connectionLogs.length > 100) {
      this.connectionLogs = this.connectionLogs.slice(0, 100)
    }
    
    // Store in localStorage for persistence
    localStorage.setItem('adminConnectionLogs', JSON.stringify(this.connectionLogs))
  }

  static getConnectionLogs(): ConnectionLog[] {
    // Load from localStorage on first call
    if (this.connectionLogs.length === 0) {
      const stored = localStorage.getItem('adminConnectionLogs')
      if (stored) {
        this.connectionLogs = JSON.parse(stored)
      }
    }
    return this.connectionLogs
  }

  static getConnectionStatus(): { isOnline: boolean; lastCheck: number } {
    return {
      isOnline: this.isOnline,
      lastCheck: this.lastConnectionCheck
    }
  }

  // User management
  static async getAllUsers(): Promise<DatabaseUser[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        this.logConnection('error', `Failed to fetch users: ${error.message}`)
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Get all users error:', error)
      throw error
    }
  }

  static async updateUserPaymentStatus(userId: string, status: 'pending' | 'paid' | 'expired' | 'free' | 'trial'): Promise<void> {
    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          payment_status: status,
          trial_expires_at: status === 'trial' ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() : null
        })
        .eq('id', userId)

      if (error) throw error
    } catch (error) {
      console.error('Update payment status error:', error)
      throw error
    }
  }

  static async deleteUser(userId: string): Promise<void> {
    try {
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

  static async resetUserPassword(userId: string, newPassword: string): Promise<void> {
    try {
      // This would require a server-side function in production
      // For now, we'll update with a placeholder
      const { error } = await supabase
        .from('users')
        .update({ 
          password_hash: 'reset_required',
          salt: 'reset_required'
        })
        .eq('id', userId)

      if (error) throw error
    } catch (error) {
      console.error('Reset password error:', error)
      throw error
    }
  }

  static async toggleAdminStatus(userId: string, isAdmin: boolean): Promise<void> {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_admin: isAdmin })
        .eq('id', userId)

      if (error) throw error
    } catch (error) {
      console.error('Toggle admin status error:', error)
      throw error
    }
  }

  static async toggleSchoolManagerStatus(userId: string, isSchoolManager: boolean): Promise<void> {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_school_manager: isSchoolManager })
        .eq('id', userId)

      if (error) throw error
    } catch (error) {
      console.error('Toggle school manager status error:', error)
      throw error
    }
  }

  // Statistics
  static async getDatabaseStats(): Promise<DatabaseStats> {
    try {
      // Get user counts
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('payment_status, is_admin, created_at')

      if (usersError) throw usersError

      // Get profile count
      const { count: profileCount, error: profileError } = await supabase
        .from('grade_profiles')
        .select('*', { count: 'exact', head: true })

      if (profileError) throw profileError

      // Get todo count
      const { count: todoCount, error: todoError } = await supabase
        .from('todos')
        .select('*', { count: 'exact', head: true })

      if (todoError) throw todoError

      // Calculate stats
      const totalUsers = users?.length || 0
      const adminUsers = users?.filter(u => u.is_admin).length || 0
      const trialUsers = users?.filter(u => u.payment_status === 'trial').length || 0
      const paidUsers = users?.filter(u => u.payment_status === 'paid').length || 0
      const revenue = paidUsers * 2.99 // NEU: Umsatzberechnung
      
      // Active users (logged in within last 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      const { count: activeCount, error: activeError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('last_login', thirtyDaysAgo)

      if (activeError) throw activeError

      // Recent signups (last 7 days)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      const { count: recentCount, error: recentError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo)

      if (recentError) throw recentError

      return {
        totalUsers,
        adminUsers,
        activeUsers: activeCount || 0,
        trialUsers,
        paidUsers,
        totalProfiles: profileCount || 0,
        totalTodos: todoCount || 0,
        recentSignups: recentCount || 0,
        revenue // NEU
      }
    } catch (error) {
      console.error('Get database stats error:', error)
      throw error
    }
  }

  // Invitation management
  static async createInvitation(trialDays: number = 7): Promise<string> {
    try {
      const code = this.generateInvitationCode()
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

      const { error } = await supabase
        .from('invitations')
        .insert({
          code,
          trial_days: trialDays,
          expires_at: expiresAt,
          is_active: true
        })

      if (error) throw error
      return code
    } catch (error) {
      console.error('Create invitation error:', error)
      throw error
    }
  }

  static async getInvitations(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Get invitations error:', error)
      throw error
    }
  }

  static async deactivateInvitation(invitationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('invitations')
        .update({ is_active: false })
        .eq('id', invitationId)

      if (error) throw error
    } catch (error) {
      console.error('Deactivate invitation error:', error)
      throw error
    }
  }

  static async deleteInvitation(invitationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('invitations')
        .delete()
        .eq('id', invitationId)

      if (error) throw error
    } catch (error) {
      console.error('Delete invitation error:', error)
      throw error
    }
  }

  private static generateInvitationCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  // Invitation management
  static async createInvitation(trialDays: number = 7): Promise<string> {
    try {
      const code = this.generateInvitationCode()
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

      const { error } = await supabase
        .from('invitations')
        .insert({
          code,
          trial_days: trialDays,
          expires_at: expiresAt,
          is_active: true
        })

      if (error) throw error
      return code
    } catch (error) {
      console.error('Create invitation error:', error)
      throw error
    }
  }

  static async getInvitations(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Get invitations error:', error)
      throw error
    }
  }

  static async deactivateInvitation(invitationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('invitations')
        .update({ is_active: false })
        .eq('id', invitationId)

      if (error) throw error
    } catch (error) {
      console.error('Deactivate invitation error:', error)
      throw error
    }
  }

  static async deleteInvitation(invitationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('invitations')
        .delete()
        .eq('id', invitationId)

      if (error) throw error
    } catch (error) {
      console.error('Delete invitation error:', error)
      throw error
    }
  }

  private static generateInvitationCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  // Database maintenance
  static async cleanupExpiredTrials(): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ payment_status: 'free' })
        .eq('payment_status', 'trial')
        .lt('trial_expires_at', new Date().toISOString())
        .select()

      if (error) throw error
      return data?.length || 0
    } catch (error) {
      console.error('Cleanup expired trials error:', error)
      throw error
    }
  }

  static async getSystemHealth(): Promise<{
    database: boolean
    responseTime: number
    lastError?: string
  }> {
    const startTime = Date.now()
    
    try {
      await this.checkConnection()
      const responseTime = Date.now() - startTime
      
      return {
        database: this.isOnline,
        responseTime,
      }
    } catch (error) {
      return {
        database: false,
        responseTime: Date.now() - startTime,
        lastError: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}
