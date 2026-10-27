<template>
  <v-app>
    <v-main class="d-flex align-center justify-center" style="min-height: 100vh; background: #3E2723;">
      <v-card
        max-width="400"
        width="100%"
        class="mx-4 pa-6"
        rounded="xl"
        elevation="8"
      >
        <div class="text-center mb-6">
          <v-icon size="64" color="primary">mdi-shield-lock-outline</v-icon>
          <h1 class="text-h5 font-weight-bold mt-2" style="color: #6F4E37;">Admin Panel</h1>
          <p class="text-body-2 text-medium-emphasis">Login untuk mengelola cafe</p>
        </div>

        <v-alert
          v-if="errorMsg"
          type="error"
          variant="tonal"
          density="compact"
          closable
          class="mb-4"
          @click:close="errorMsg = ''"
        >
          {{ errorMsg }}
        </v-alert>

        <v-form @submit.prevent="handleLogin" ref="formRef">
          <v-text-field
            v-model="email"
            label="Email Admin"
            type="email"
            prepend-inner-icon="mdi-email-outline"
            variant="outlined"
            density="comfortable"
            :rules="[rules.required, rules.email]"
            class="mb-2"
          />

          <v-text-field
            v-model="password"
            label="Password"
            :type="showPassword ? 'text' : 'password'"
            prepend-inner-icon="mdi-lock-outline"
            :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
            variant="outlined"
            density="comfortable"
            :rules="[rules.required]"
            class="mb-4"
            @click:append-inner="showPassword = !showPassword"
          />

          <v-btn
            type="submit"
            color="primary"
            size="large"
            block
            rounded="lg"
            :loading="submitting"
          >
            Masuk sebagai Admin
          </v-btn>
        </v-form>

        <div class="text-center mt-4">
          <span class="text-body-2 text-medium-emphasis">Belum punya akun?</span>
          <router-link
            :to="{ name: 'admin-register' }"
            class="text-body-2 font-weight-medium ms-1"
            style="color: #6F4E37;"
          >
            Daftar
          </router-link>
        </div>

        <div class="text-center mt-2">
          <router-link
            to="/"
            class="text-body-2 text-medium-emphasis"
          >
            ← Kembali ke halaman utama
          </router-link>
        </div>
      </v-card>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { login, profile } = useAuth()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const submitting = ref(false)
const errorMsg = ref('')
const formRef = ref(null)

const rules = {
  required: v => !!v || 'Wajib diisi',
  email: v => /.+@.+\..+/.test(v) || 'Email tidak valid',
}

async function handleLogin() {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  submitting.value = true
  errorMsg.value = ''
  try {
    await login(email.value, password.value)

    const role = profile.value?.role
    if (!['admin', 'kasir', 'dapur'].includes(role)) {
      errorMsg.value = 'Akun ini bukan akun admin/staff'
      return
    }

    router.replace({ name: 'admin-dashboard' })
  } catch (err) {
    errorMsg.value = err.message === 'Invalid login credentials'
      ? 'Email atau password salah'
      : err.message
  } finally {
    submitting.value = false
  }
}
</script>
