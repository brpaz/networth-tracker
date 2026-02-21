<script setup lang="ts">
import { accountTypes } from '~/types';

definePageMeta({ layout: 'default' });

const {
  accounts,
  loading,
  fetchAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
  recordSnapshot,
} = useAccounts();
const { formatCurrency } = useFormatters();
const toast = useToast();

await fetchAccounts();

const totalValue = computed(() =>
  accounts.value.reduce((sum, a) => sum + (a.currentValue || 0), 0),
);

function pct(value: number | null) {
  if (!totalValue.value || !value) return '0.0%';
  return ((value / totalValue.value) * 100).toFixed(1) + '%';
}

const showForm = ref(false);
const editingAccount = ref<{
  id: number;
  name: string;
  type: string;
  currency: string;
} | null>(null);
const formData = reactive({
  name: '',
  type: 'stocks' as string,
  currency: 'EUR',
});

const showUpdateValue = ref(false);
const updatingAccountId = ref<number | null>(null);
const newValue = ref(0);

function openCreateForm() {
  editingAccount.value = null;
  formData.name = '';
  formData.type = 'stocks';
  formData.currency = 'EUR';
  showForm.value = true;
}

function openEditForm(account: { id: number; name: string; type: string; currency: string }) {
  editingAccount.value = account;
  formData.name = account.name;
  formData.type = account.type;
  formData.currency = account.currency;
  showForm.value = true;
}

async function submitForm() {
  try {
    if (editingAccount.value) {
      await updateAccount(editingAccount.value.id, { ...formData });
      toast.add({ title: 'Account updated', color: 'success' });
    } else {
      await createAccount({ ...formData });
      toast.add({ title: 'Account created', color: 'success' });
    }
    showForm.value = false;
  } catch {
    toast.add({ title: 'Error saving account', color: 'error' });
  }
}

function openUpdateValue(accountId: number, currentValue: number | null) {
  updatingAccountId.value = accountId;
  newValue.value = currentValue || 0;
  showUpdateValue.value = true;
}

async function submitValue() {
  if (updatingAccountId.value === null) return;
  try {
    await recordSnapshot(updatingAccountId.value, newValue.value);
    toast.add({ title: 'Value updated', color: 'success' });
    showUpdateValue.value = false;
  } catch {
    toast.add({ title: 'Error updating value', color: 'error' });
  }
}

async function handleDelete(id: number) {
  try {
    await deleteAccount(id);
    toast.add({ title: 'Account deleted', color: 'success' });
  } catch {
    toast.add({ title: 'Error deleting account', color: 'error' });
  }
}

const typeOptions = accountTypes.map((t) => ({
  label: t.charAt(0).toUpperCase() + t.slice(1),
  value: t,
}));
</script>

<template>
  <div class="p-6 space-y-6">
    <div class="flex justify-between items-center">
      <h2 class="text-xl font-bold">Accounts</h2>
      <UButton icon="i-lucide-plus" label="Add Account" @click="openCreateForm" />
    </div>

    <UCard v-if="loading">
      <div class="text-center py-4">Loading...</div>
    </UCard>

    <div v-else class="space-y-4">
      <UCard v-for="account in accounts" :key="account.id">
        <div class="flex items-center justify-between">
          <NuxtLink :to="`/accounts/${account.id}`" class="hover:underline">
            <h3 class="font-semibold">{{ account.name }}</h3>
            <p class="text-sm text-muted">{{ account.type }} &middot; {{ account.currency }}</p>
          </NuxtLink>
          <div class="flex items-center gap-4">
            <div class="text-right">
              <p class="text-xl font-bold text-primary">
                {{ formatCurrency(account.currentValue || 0, account.currency) }}
              </p>
              <UBadge variant="subtle" color="primary" class="mt-0.5">
                {{ pct(account.currentValue) }}
              </UBadge>
            </div>
            <div class="flex gap-1">
              <UButton
                icon="i-lucide-refresh-cw"
                aria-label="Update value"
                variant="ghost"
                size="sm"
                @click="openUpdateValue(account.id, account.currentValue)"
              />
              <UButton
                icon="i-lucide-pencil"
                aria-label="Edit account"
                variant="ghost"
                size="sm"
                @click="openEditForm(account)"
              />
              <UButton
                icon="i-lucide-trash-2"
                aria-label="Delete account"
                variant="ghost"
                size="sm"
                color="error"
                @click="handleDelete(account.id)"
              />
            </div>
          </div>
        </div>
      </UCard>

      <UCard v-if="accounts.length === 0">
        <div class="text-center py-8 text-muted">
          <p>No accounts yet. Create one to get started.</p>
        </div>
      </UCard>
    </div>

    <UModal v-model:open="showForm">
      <template #header>
        <h3 class="font-semibold">
          {{ editingAccount ? 'Edit Account' : 'Create Account' }}
        </h3>
      </template>
      <template #body>
        <div class="space-y-4">
          <UFormField label="Name">
            <UInput v-model="formData.name" placeholder="Account name" />
          </UFormField>
          <UFormField label="Type">
            <USelect v-model="formData.type" :items="typeOptions" />
          </UFormField>
          <UFormField label="Currency">
            <UInput v-model="formData.currency" placeholder="EUR" maxlength="3" />
          </UFormField>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton label="Cancel" variant="ghost" @click="showForm = false" />
          <UButton :label="editingAccount ? 'Update' : 'Create'" @click="submitForm" />
        </div>
      </template>
    </UModal>

    <UModal v-model:open="showUpdateValue">
      <template #header>
        <h3 class="font-semibold">Update Value</h3>
      </template>
      <template #body>
        <UFormField label="Current Total Value">
          <UInputNumber v-model="newValue" :step="100" />
        </UFormField>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton label="Cancel" variant="ghost" @click="showUpdateValue = false" />
          <UButton label="Update" @click="submitValue" />
        </div>
      </template>
    </UModal>
  </div>
</template>
