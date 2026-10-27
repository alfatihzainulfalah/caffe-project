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
          <v-icon size="64" color="primary">mdi-shield-account-outline</v-icon>
          <h1 class="text-h5 font-weight-bold mt-2" style="color: #6F4E37;">Daftar Admin</h1>
          <p class="text-body-2 text-medium-emphasis">Buat akun baru untuk mengelola cafe</p>
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

        <v-alert
          v-if="successMsg"
          type="success"
          variant="tonal"
          density="compact"
          class="mb-4"
        >
          {{ successMsg }}
        </v-alert>

        <v-form @submit.prevent="handleRegister" ref="formRef">
          <v-text-field
            v-model="fullName"
            label="Nama Lengkap"
            prepend-inner-icon="mdi-account-outline"
            variant="outlined"
            density="comfortable"
            :rules="[rules.required]"
            class="mb-2"
          />

          <v-text-field
            v-model="email"
            label="Email"
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
            :rules="[rules.required, rules.minLength]"
            class="mb-2"
            @click:append-inner="showPassword = !showPassword"
          />

          <v-text-field
            v-model="confirmPassword"
            label="Konfirmasi Password"
            :type="showPassword ? 'text' : 'password'"
            prepend-inner-icon="mdi-lock-check-outline"
            variant="outlined"
            density="comfortable"
            :rules="[rules.required, rules.matchPassword]"
            class="mb-2"
          />

          <v-select
            v-model="role"
            label="Role"
            prepend-inner-icon="mdi-badge-account-outline"
            variant="outlined"
            density="comfortable"
            :items="roleOptions"
            item-title="label"
            item-value="value"
            class="mb-4"
          />

          <v-btn
            type="submit"
            color="primary"
            size="large"
            block
            rounded="lg"
            :loading="submitting"
          >
            Daftar
          </v-btn>
        </v-form>

        <div class="text-center mt-4">
          <span class="text-body-2 text-medium-emphasis">Sudah punya akun?</span>
          <router-link
            :to="{ name: 'admin-login' }"
            class="text-body-2 font-weight-medium ms-1"
            style="color: #6F4E37;"
          >
            Masuk
          </router-link>
        </div>
      </v-card>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'

const router = useRouter()

const fullName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const role = ref('admin')
const submitting = ref(false)
const errorMsg = ref('')
const successMsg = ref('')
const formRef = ref(null)

const roleOptions = [
  { label: 'Admin', value: 'admin' },
  { label: 'Kasir', value: 'kasir' },
  { label: 'Dapur', value: 'dapur' },
]

const rules = {
  required: v => !!v || 'Wajib diisi',
  email: v => /.+@.+\..+/.test(v) || 'Email tidak valid',
  minLength: v => (v && v.length >= 6) || 'Minimal 6 karakter',
  matchPassword: v => v === password.value || 'Password tidak cocok',
}

async function handleRegister() {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  submitting.value = true
  errorMsg.value = ''
  successMsg.value = ''

  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
      options: {
        data: {
          full_name: fullName.value,
          role: role.value,
        },
      },
    })

    if (error) throw error

    if (data.session) {
      router.replace({ name: 'admin-dashboard' })
    } else {
      successMsg.value = 'Akun berhasil dibuat! Cek email untuk verifikasi, lalu login.'
      fullName.value = ''
      email.value = ''
      password.value = ''
      confirmPassword.value = ''
    }
  } catch (err) {
    errorMsg.value = err.message
  } finally {
    submitting.value = false
  }
}
</script>
