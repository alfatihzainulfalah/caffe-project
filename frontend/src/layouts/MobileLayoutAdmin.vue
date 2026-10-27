<template>
  <v-app>
    <v-app-bar color="primary" density="compact">
      <v-app-bar-title>
        <v-icon class="me-2">mdi-coffee</v-icon>
        Caffe Admin
      </v-app-bar-title>
      <template #append>
        <v-chip variant="tonal" size="small" class="me-2">
          <v-icon start size="small">mdi-account-circle</v-icon>
          {{ profile?.full_name ?? 'Admin' }}
        </v-chip>
        <v-btn icon="mdi-logout" variant="text" @click="handleLogout" />
      </template>
    </v-app-bar>

    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { profile, logout } = useAuth()

async function handleLogout() {
  await logout()
  router.replace({ name: 'admin-login' })
}
</script>