<template>
  <v-bottom-sheet
    :model-value="modelValue"
    inset
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card rounded="t-xl">
      <v-card-title class="d-flex align-center pt-4 px-4">
        <span class="text-h6 font-weight-bold">Ringkasan Pesanan</span>
        <v-spacer />
        <v-btn
          icon="mdi-close"
          variant="text"
          density="comfortable"
          aria-label="Tutup"
          @click="close"
        />
      </v-card-title>

      <v-divider />

      <v-card-text class="order-list px-4 pt-2">
        <v-empty-state
          v-if="lines.length === 0"
          icon="mdi-cart-outline"
          title="Keranjang kosong"
          text="Pilih menu terlebih dahulu."
        />

        <div
          v-for="line in lines"
          :key="line.id"
          class="order-line d-flex align-center py-3"
        >
          <div class="flex-grow-1 pr-3">
            <div class="text-body-2 font-weight-medium">{{ line.name }}</div>
            <div class="text-caption text-medium-emphasis">{{ formatPrice(line.price) }}</div>
          </div>

          <div class="qty-stepper d-flex align-center">
            <v-btn
              icon="mdi-minus"
              size="x-small"
              variant="tonal"
              color="primary"
              :aria-label="`Kurangi ${line.name}`"
              @click="decrease(line.id)"
            />
            <span class="qty-stepper__value">{{ line.qty }}</span>
            <v-btn
              icon="mdi-plus"
              size="x-small"
              variant="flat"
              color="primary"
              :aria-label="`Tambah ${line.name}`"
              @click="add(line)"
            />
          </div>

          <div class="text-body-2 font-weight-bold order-line__subtotal">
            {{ formatPrice(line.price * line.qty) }}
          </div>
        </div>
      </v-card-text>

      <v-divider />

      <v-card-text class="px-4 py-4">
        <div class="d-flex align-center justify-space-between mb-4">
          <span class="text-subtitle-1 font-weight-bold">Total</span>
          <span class="text-subtitle-1 font-weight-bold text-primary">{{ formatPrice(totalPrice) }}</span>
        </div>

        <v-text-field
          v-model="tableNumber"
          label="Nomor Meja"
          placeholder="Contoh: 12"
          prepend-inner-icon="mdi-table-furniture"
          variant="outlined"
          density="comfortable"
          inputmode="numeric"
          :rules="[v => !!v || 'Nomor meja wajib diisi']"
          hide-details="auto"
          class="mb-4"
        />

        <v-btn
          block
          size="large"
          color="primary"
          rounded="pill"
          :disabled="!canSubmit"
          @click="submitOrder"
        >
          Buat Pesanan
        </v-btn>
      </v-card-text>
    </v-card>
  </v-bottom-sheet>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { formatPrice } from '@/utils/formatPrice'
import { useCart } from './useCart'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'submit'])

const { lines, totalPrice, add, decrease } = useCart()

const tableNumber = ref('')

const canSubmit = computed(() => lines.value.length > 0 && tableNumber.value.trim() !== '')

watch(tableNumber, (value) => {
  const digitsOnly = value.replace(/\D/g, '')
  if (digitsOnly !== value) tableNumber.value = digitsOnly
})

watch(() => props.modelValue, (open) => {
  if (!open) tableNumber.value = ''
})

function close () {
  emit('update:modelValue', false)
}

function submitOrder () {
  if (!canSubmit.value) return

  emit('submit', {
    tableNumber: tableNumber.value.trim(),
    items: lines.value.map((line) => ({ ...line })),
    total: totalPrice.value,
  })
  close()
}
</script>

<style scoped>
.order-list {
  max-height: 42vh;
  overflow-y: auto;
}

.order-line + .order-line {
  border-top: 1px solid rgba(111, 78, 55, 0.1);
}

.order-line__subtotal {
  min-width: 76px;
  text-align: right;
}

.qty-stepper {
  gap: 8px;
  margin-right: 12px;
}

.qty-stepper__value {
  min-width: 18px;
  text-align: center;
  font-weight: 600;
}
</style>
