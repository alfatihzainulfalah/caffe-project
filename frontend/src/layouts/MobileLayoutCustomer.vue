<template>
  <v-app>
    <!-- App Bar -->
    <v-app-bar color="primary" density="compact" flat>
      <v-app-bar-title>
        <v-icon class="me-1" size="small">mdi-coffee</v-icon>
        Caffe App
      </v-app-bar-title>
      <template #append>
        <v-chip
          variant="tonal"
          size="small"
          class="me-1"
          @click="showNameDialog = true"
          style="cursor: pointer;"
        >
          <v-icon start size="small">mdi-account-circle</v-icon>
          {{ customerName || 'Isi Nama' }}
        </v-chip>
      </template>
    </v-app-bar>

    <v-main>
      <router-view />
    </v-main>

    <v-bottom-navigation
      :model-value="activeTab"
      color="primary"
      bg-color="surface"
      mode="shift"
      grow
      elevation="8"
      @update:model-value="goTo"
    >
      <v-btn value="menu">
        <v-icon>mdi-silverware-fork-knife</v-icon>
        <span>Menu</span>
      </v-btn>

      <v-btn value="pesanan">
        <v-icon>mdi-receipt-text-outline</v-icon>
        <span>Pesanan</span>
      </v-btn>

      <v-btn value="riwayat">
        <v-icon>mdi-history</v-icon>
        <span>Riwayat</span>
      </v-btn>
    </v-bottom-navigation>

    <!-- Dialog isi nama customer -->
    <v-dialog v-model="showNameDialog" max-width="360" persistent>
      <v-card rounded="xl" class="pa-5">
        <div class="text-center mb-4">
          <v-icon size="48" color="primary">mdi-account-edit-outline</v-icon>
          <h3 class="text-h6 font-weight-bold mt-2" style="color: #6F4E37;">
            Siapa nama kamu?
          </h3>
          <p class="text-body-2 text-medium-emphasis">
            Nama ini akan ditampilkan di pesanan kamu
          </p>
        </div>

        <v-text-field
          v-model="nameInput"
          label="Nama"
          prepend-inner-icon="mdi-account-outline"
          variant="outlined"
          density="comfortable"
          autofocus
          :rules="[v => !!v?.trim() || 'Nama wajib diisi']"
          @keyup.enter="saveName"
        />

        <v-btn
          color="primary"
          size="large"
          block
          rounded="lg"
          class="mt-2"
          :disabled="!nameInput?.trim()"
          @click="saveName"
        >
          Simpan
        </v-btn>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script setup>
  import { ref, computed, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { getCustomerName, setCustomerName } from '@/lib/session'

  const route = useRoute()
  const router = useRouter()

  const customerName = ref(getCustomerName())
  const nameInput = ref('')
  const showNameDialog = ref(false)

  onMounted(() => {
    if (!customerName.value) {
      showNameDialog.value = true
    }
  })

  function saveName() {
    const name = nameInput.value?.trim()
    if (!name) return
    setCustomerName(name)
    customerName.value = name
    showNameDialog.value = false
  }

  const tabs = {
    'customer-menu': 'menu',
    'customer-pesanan': 'pesanan',
    'customer-riwayat': 'riwayat',
  }

  const activeTab = computed(() => tabs[route.name] ?? 'menu')

  function goTo (tab) {
    const routeName = Object.keys(tabs).find(name => tabs[name] === tab)
    if (routeName && route.name !== routeName) {
      router.push({ name: routeName })
    }
  }
</script>
