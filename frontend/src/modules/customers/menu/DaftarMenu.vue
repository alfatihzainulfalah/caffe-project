<template>
  <div class="daftar-menu" :class="{ 'daftar-menu--with-cart-bar': totalQty > 0 }">

    <v-text-field
      v-model="search"
      density="comfortable"
      variant="solo"
      flat
      rounded="pill"
      bg-color="surface"
      prepend-inner-icon="mdi-magnify"
      placeholder="Cari menu favoritmu..."
      clearable
      hide-details
      class="search-field mb-5"
    />

    <div class="category-tabs mb-6">
      <v-chip-group v-model="selectedCategory" mandatory>
        <v-chip
          v-for="category in categories"
          :key="category"
          :value="category"
          :prepend-icon="categoryIcons[category] || 'mdi-silverware'"
          :color="selectedCategory === category ? 'primary' : undefined"
          :variant="selectedCategory === category ? 'flat' : 'outlined'"
          :class="['category-chip', { 'category-chip--active': selectedCategory === category }]"
          rounded="pill"
          size="large"
        >
          {{ category }}
          <span class="category-count ml-2">{{ categoryCount(category) }}</span>
        </v-chip>
      </v-chip-group>
    </div>

    <v-empty-state
      v-if="filteredMenu.length === 0"
      icon="mdi-silverware-fork-knife"
      title="Menu tidak ditemukan"
      text="Coba kata kunci atau kategori lain."
    />

    <v-row v-else dense>
      <v-col
        v-for="item in filteredMenu"
        :key="item.id"
        cols="6"
        sm="4"
        md="3"
      >
        <v-card
          :class="['menu-card d-flex flex-column fill-height', { 'menu-card--soldout': !item.available }]"
          rounded="xl"
          elevation="0"
          border
        >
          <div class="menu-card__media">
            <v-icon :icon="item.icon" size="44" color="primary" />

            <span class="menu-card__category">{{ item.category }}</span>

            <div v-if="!item.available" class="menu-card__soldout">
              <span>Habis</span>
            </div>
          </div>

          <div class="pa-4 d-flex flex-column flex-grow-1">
            <div class="text-subtitle-1 font-weight-bold menu-card__title">
              {{ item.name }}
            </div>
            <div class="text-caption text-medium-emphasis menu-card__desc mt-1">
              {{ item.description }}
            </div>

            <v-spacer />

            <div class="d-flex align-center justify-space-between mt-4">
              <span class="text-subtitle-1 font-weight-bold text-primary">
                {{ formatPrice(item.price) }}
              </span>

              <v-badge
                :model-value="quantityOf(item.id) > 0"
                :content="quantityOf(item.id)"
                color="secondary"
                floating
              >
                <v-btn
                  icon="mdi-plus"
                  color="primary"
                  variant="flat"
                  size="small"
                  :disabled="!item.available"
                  :aria-label="`Tambah ${item.name}`"
                  @click="add(item)"
                />
              </v-badge>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-slide-y-reverse-transition>
      <div v-if="totalQty > 0" class="cart-bar-wrap">
        <v-btn
          class="cart-bar"
          color="primary"
          variant="flat"
          rounded="pill"
          size="large"
          block
          @click="sheetOpen = true"
        >
          <span class="cart-bar__badge">{{ totalQty }}</span>
          <span class="cart-bar__label">Lihat Pesanan</span>
          <v-spacer />
          <span class="cart-bar__price">{{ formatPrice(totalPrice) }}</span>
          <v-icon icon="mdi-chevron-right" class="ml-1" />
        </v-btn>
      </div>
    </v-slide-y-reverse-transition>

    <OrderSummarySheet v-model="sheetOpen" @submit="handleOrderSubmit" />

    <v-snackbar v-model="snackbar.show" color="primary" location="top" timeout="3000">
      {{ snackbar.message }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { formatPrice } from '@/utils/formatPrice'
import { supabase } from '@/lib/supabase'
import { getSessionId } from '@/lib/session'
import { generateOrderCode } from '@/lib/orderCode'
import OrderSummarySheet from './OrderSummarySheet.vue'
import { useCart } from './useCart'

const menuItems = ref([])
const loading = ref(true)

async function fetchMenu() {
  loading.value = true
  const { data, error } = await supabase
    .from('menu_items')
    .select('*, categories(name, icon)')
    .order('id')

  if (!error && data) {
    menuItems.value = data.map((item) => ({
      id: item.id,
      name: item.name,
      category: item.categories?.name || '',
      description: item.description || '',
      price: item.price,
      icon: item.icon || 'mdi-silverware',
      available: item.is_available,
    }))
  }
  loading.value = false
}

onMounted(fetchMenu)

const categoryIcons = {
  'Semua': 'mdi-view-grid-outline',
  'Kopi': 'mdi-coffee-outline',
  'Non-Kopi': 'mdi-cup-outline',
  'Makanan': 'mdi-food-outline',
  'Snack': 'mdi-french-fries',
  'Dessert': 'mdi-cupcake',
}

const search = ref('')
const selectedCategory = ref('Semua')
const sheetOpen = ref(false)
const snackbar = reactive({ show: false, message: '' })

const { quantityOf, totalQty, totalPrice, add, clear } = useCart()

const categories = computed(() => [
  'Semua',
  ...new Set(menuItems.value.map((item) => item.category)),
])

const filteredMenu = computed(() => {
  const keyword = (search.value || '').trim().toLowerCase()

  return menuItems.value.filter((item) => {
    const matchCategory = selectedCategory.value === 'Semua' || item.category === selectedCategory.value
    const matchKeyword = !keyword || item.name.toLowerCase().includes(keyword)
    return matchCategory && matchKeyword
  })
})

function categoryCount (category) {
  if (category === 'Semua') return menuItems.value.length
  return menuItems.value.filter((item) => item.category === category).length
}

async function handleOrderSubmit ({ tableNumber, items, total }) {
  // Find table by number
  const { data: tableData } = await supabase
    .from('tables')
    .select('id')
    .eq('number', tableNumber)
    .single()

  if (!tableData) {
    snackbar.message = `Meja ${tableNumber} tidak ditemukan`
    snackbar.show = true
    return
  }

  const orderCode = generateOrderCode()
  const sessionId = getSessionId()

  // Insert order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      order_code: orderCode,
      table_id: tableData.id,
      session_id: sessionId,
      status: 'pending',
      total,
    })
    .select('id')
    .single()

  if (orderError || !order) {
    snackbar.message = 'Gagal membuat pesanan. Coba lagi.'
    snackbar.show = true
    return
  }

  // Insert order items
  const orderItems = items.map((line) => ({
    order_id: order.id,
    menu_item_id: line.id,
    item_name: line.name,
    item_price: line.price,
    qty: line.qty,
    subtotal: line.price * line.qty,
  }))

  await supabase.from('order_items').insert(orderItems)

  // Insert initial status log
  await supabase.from('order_status_logs').insert({
    order_id: order.id,
    status: 'pending',
  })

  clear()
  snackbar.message = `Pesanan ${orderCode} untuk Meja ${tableNumber} berhasil dibuat!`
  snackbar.show = true
}
</script>

<style scoped>
.daftar-menu--with-cart-bar {
  padding-bottom: 96px;
}

.cart-bar-wrap {
  position: fixed;
  left: 0;
  right: 0;
  bottom: calc(56px + env(safe-area-inset-bottom, 0px));
  z-index: 5;
  padding: 10px 16px;
}

.cart-bar :deep(.v-btn__content) {
  width: 100%;
  display: flex;
  align-items: center;
}

.cart-bar__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.25);
  font-size: 12px;
  font-weight: 700;
  margin-right: 10px;
}

.cart-bar__label {
  font-weight: 600;
}

.cart-bar__price {
  font-weight: 700;
}

.brand__title {
  margin: 0;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 1.75rem;
  font-weight: 700;
  letter-spacing: -0.5px;
  line-height: 1.2;
  color: rgb(var(--v-theme-primary));
}

.search-field :deep(.v-field) {
  border: 1px solid rgba(111, 78, 55, 0.18);
}

.category-tabs :deep(.v-slide-group__content) {
  gap: 4px;
  padding: 4px 0;
}

.category-chip {
  font-weight: 600;
  letter-spacing: 0.2px;
  border-color: rgba(111, 78, 55, 0.25) !important;
  color: rgb(var(--v-theme-primary));
  transition: background-color 0.15s ease, color 0.15s ease;
}

.category-chip--active {
  color: #fff !important;
}

.category-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 20px;
  padding: 0 6px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  background: rgba(111, 78, 55, 0.1);
}

.category-chip--active .category-count {
  background: rgba(255, 255, 255, 0.25);
}

.menu-card {
  overflow: hidden;
  border-color: rgba(111, 78, 55, 0.12) !important;
  transition: border-color 0.15s ease;
}

.menu-card:hover {
  border-color: rgba(111, 78, 55, 0.4) !important;
}

.menu-card__media {
  position: relative;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F6EFE6;
}

.menu-card__category {
  position: absolute;
  top: 10px;
  left: 12px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  color: rgba(111, 78, 55, 0.7);
}

.menu-card__soldout {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(246, 239, 230, 0.8);
}

.menu-card__soldout span {
  padding: 3px 12px;
  border-radius: 999px;
  background: #3E2C20;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
}

.menu-card--soldout .menu-card__title,
.menu-card--soldout .text-primary {
  opacity: 0.5;
}

.menu-card__title {
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.menu-card__desc {
  line-height: 1.45;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 2.9em;
}
</style>
