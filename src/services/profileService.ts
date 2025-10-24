import { supabase } from '../lib/supabase'
import { MainTask, SubTask } from '../types'

export interface CloudGradeProfile {
  id: string
  name: string
  mainTasks: MainTask[]
  subTasks: SubTask[]
  useSubTasks: boolean
  createdAt: string
  updatedAt: string
}

export class ProfileService {
  static async saveProfile(
    userId: string, 
    name: string, 
    mainTasks: MainTask[], 
    subTasks: SubTask[], 
    useSubTasks: boolean
  ): Promise<CloudGradeProfile> {
    try {
      const { data: profile, error } = await supabase
        .from('grade_profiles')
        .insert({
          user_id: userId,
          name,
          main_tasks: mainTasks,
          sub_tasks: subTasks,
          use_sub_tasks: useSubTasks
        })
        .select()
        .single()

      if (error) throw error

      return {
        id: profile.id,
        name: profile.name,
        mainTasks: profile.main_tasks,
        subTasks: profile.sub_tasks,
        useSubTasks: profile.use_sub_tasks,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at
      }
    } catch (error) {
      console.error('Save profile error:', error)
      throw error
    }
  }

  static async getProfiles(userId: string): Promise<CloudGradeProfile[]> {
    try {
      const { data: profiles, error } = await supabase
        .from('grade_profiles')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })

      if (error) throw error

      return profiles.map(profile => ({
        id: profile.id,
        name: profile.name,
        mainTasks: profile.main_tasks,
        subTasks: profile.sub_tasks,
        useSubTasks: profile.use_sub_tasks,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at
      }))
    } catch (error) {
      console.error('Get profiles error:', error)
      throw error
    }
  }

  static async deleteProfile(profileId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('grade_profiles')
        .delete()
        .eq('id', profileId)

      if (error) throw error
    } catch (error) {
      console.error('Delete profile error:', error)
      throw error
    }
  }

  static async updateProfile(
    profileId: string,
    name: string,
    mainTasks: MainTask[],
    subTasks: SubTask[],
    useSubTasks: boolean
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('grade_profiles')
        .update({
          name,
          main_tasks: mainTasks,
          sub_tasks: subTasks,
          use_sub_tasks: useSubTasks,
          updated_at: new Date().toISOString()
        })
        .eq('id', profileId)

      if (error) throw error
    } catch (error) {
      console.error('Update profile error:', error)
      throw error
    }
  }
}