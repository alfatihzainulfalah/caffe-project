<template>
  <v-container>
    <h1 class="text-h5 mb-4">Riwayat</h1>

    <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4" />

    <v-empty-state
      v-if="!loading && orders.length === 0"
      icon="mdi-history"
      title="Belum ada riwayat"
      text="Riwayat transaksi akan tampil di sini."
    />

    <v-card
      v-for="order in orders"
      :key="order.id"
      class="mb-3"
      rounded="xl"
      border
      elevation="0"
    >
      <v-card-title class="d-flex align-center justify-space-between">
        <span class="text-subtitle-1 font-weight-bold">{{ order.order_code }}</span>
        <v-chip
          :color="order.status === 'completed' ? 'success' : 'error'"
          size="small"
          variant="flat"
        >
          {{ order.status === 'completed' ? 'Selesai' : 'Dibatalkan' }}
        </v-chip>
      </v-card-title>

      <v-card-subtitle>
        Meja {{ order.tables?.number }} &bull; {{ formatTime(order.created_at) }}
      </v-card-subtitle>

      <v-card-text>
        <div
          v-for="item in order.order_items"
          :key="item.id"
          class="d-flex justify-space-between text-body-2 py-1"
        >
          <span>{{ item.item_name }} x{{ item.qty }}</span>
          <span class="font-weight-medium">{{ formatPrice(item.subtotal) }}</span>
        </div>
        <v-divider class="my-2" />
        <div class="d-flex justify-space-between text-subtitle-2 font-weight-bold">
          <span>Total</span>
          <span class="text-primary">{{ formatPrice(order.total) }}</span>
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { supabase } from '@/lib/supabase'
import { getSessionId } from '@/lib/session'
import { formatPrice } from '@/utils/formatPrice'

const orders = ref([])
const loading = ref(true)

function formatTime(iso) {
  return new Date(iso).toLocaleString('id-ID', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  })
}

async function fetchOrders() {
  loading.value = true
  const sessionId = getSessionId()
  const { data } = await supabase
    .from('orders')
    .select('*, tables(number), order_items(*)')
    .eq('session_id', sessionId)
    .in('status', ['completed', 'cancelled'])
    .order('created_at', { ascending: false })

  if (data) orders.value = data
  loading.value = false
}

onMounted(fetchOrders)
</script>
