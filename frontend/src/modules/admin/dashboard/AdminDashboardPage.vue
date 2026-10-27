<template>
  <v-container>
    <h2 class="text-h5 font-weight-bold mb-4">Dashboard</h2>

    <v-row>
      <v-col cols="6">
        <v-card rounded="xl" class="pa-4 text-center" color="primary" variant="tonal">
          <v-icon size="32">mdi-receipt-text-outline</v-icon>
          <div class="text-h6 font-weight-bold mt-1">{{ orderCount }}</div>
          <div class="text-caption">Pesanan Hari Ini</div>
        </v-card>
      </v-col>
      <v-col cols="6">
        <v-card rounded="xl" class="pa-4 text-center" color="secondary" variant="tonal">
          <v-icon size="32">mdi-clock-alert-outline</v-icon>
          <div class="text-h6 font-weight-bold mt-1">{{ pendingCount }}</div>
          <div class="text-caption">Menunggu Konfirmasi</div>
        </v-card>
      </v-col>
    </v-row>

    <h3 class="text-subtitle-1 font-weight-bold mt-6 mb-3">Pesanan Terbaru</h3>
    <v-card v-if="!recentOrders.length" rounded="xl" class="pa-6 text-center" variant="outlined">
      <v-icon size="48" color="medium-emphasis">mdi-inbox-outline</v-icon>
      <p class="text-body-2 text-medium-emphasis mt-2">Belum ada pesanan</p>
    </v-card>

    <v-card
      v-for="order in recentOrders"
      :key="order.id"
      rounded="xl"
      class="pa-4 mb-3"
      variant="outlined"
    >
      <div class="d-flex justify-space-between align-center">
        <div>
          <span class="font-weight-bold">{{ order.order_code }}</span>
          <v-chip
            :color="statusColor(order.status)"
            size="x-small"
            class="ms-2"
          >
            {{ order.status }}
          </v-chip>
        </div>
        <span class="text-caption text-medium-emphasis">
          Meja {{ order.tables?.number ?? '-' }}
        </span>
      </div>
      <div class="text-body-2 text-medium-emphasis mt-1">
        Rp {{ order.total?.toLocaleString('id-ID') }}
      </div>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'

const orderCount = ref(0)
const pendingCount = ref(0)
const recentOrders = ref([])

const statusColor = (s) => ({
  pending: 'warning',
  confirmed: 'info',
  preparing: 'primary',
  ready: 'success',
  completed: 'default',
  cancelled: 'error',
}[s] ?? 'default')

onMounted(async () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { data: orders } = await supabase
    .from('orders')
    .select('*, tables(number)')
    .gte('created_at', today.toISOString())
    .order('created_at', { ascending: false })
    .limit(20)

  recentOrders.value = orders ?? []
  orderCount.value = orders?.length ?? 0
  pendingCount.value = orders?.filter(o => o.status === 'pending').length ?? 0
})
</script>
