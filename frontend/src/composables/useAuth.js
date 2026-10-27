import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'

const currentUser = ref(null)
const profile = ref(null)
const loading = ref(true)

export function useAuth() {
  const isLoggedIn = computed(() => !!currentUser.value)
  const userRole = computed(() => profile.value?.role ?? currentUser.value?.user_metadata?.role ?? null)
  const isAdmin = computed(() => ['admin', 'kasir', 'dapur'].includes(userRole.value))
  const isCustomer = computed(() => userRole.value === 'customer')

  async function fetchProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.warn('fetchProfile error:', error.message)
      // Fallback: pakai user_metadata dari Supabase Auth
      profile.value = {
        id: userId,
        full_name: currentUser.value?.user_metadata?.full_name ?? 'User',
        role: currentUser.value?.user_metadata?.role ?? 'customer',
      }
      return
    }
    profile.value = data
  }

  async function init() {
    loading.value = true
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        currentUser.value = session.user
        await fetchProfile(session.user.id)
      }
    } finally {
      loading.value = false
    }

    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        currentUser.value = session.user
        await fetchProfile(session.user.id)
      } else {
        currentUser.value = null
        profile.value = null
      }
    })
  }

  async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    currentUser.value = data.user
    await fetchProfile(data.user.id)
    return data
  }

  async function logout() {
    await supabase.auth.signOut()
    currentUser.value = null
    profile.value = null
  }

  return {
    currentUser,
    profile,
    loading,
    isLoggedIn,
    userRole,
    isAdmin,
    isCustomer,
    init,
    login,
    logout,
    fetchProfile,
  }
}
