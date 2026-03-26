<template>
  <v-sheet class="bg-deep-purple pa-12" rounded>
    <v-card class="mx-auto px-6 py-8" max-width="344">
      <v-alert v-if="error" type="error" class="mb-4">{{ error }}</v-alert>
      <v-form v-model="form" @submit.prevent="onSubmit">
        <v-text-field
          v-model="email"
          :readonly="loading"
          :rules="[required]"
          class="mb-2"
          label="Email"
          clearable
        />
        <v-text-field
          v-model="apiKey"
          :readonly="loading"
          :rules="[required]"
          label="API Key"
          placeholder="Tu API Key"
          clearable
        />
        <br>
        <v-btn
          :disabled="!form"
          :loading="loading"
          color="success"
          size="large"
          type="submit"
          variant="elevated"
          block
        >
          Sign In
        </v-btn>
      </v-form>
    </v-card>
  </v-sheet>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const form = ref(false)
const email = ref('')
const apiKey = ref('')
const loading = ref(false)
const error = ref('')

const router = useRouter()
const auth = useAuthStore()

const onSubmit = async () => {
  if (!form.value) return
  loading.value = true
  error.value = ''
  try {
    await auth.login(email.value, apiKey.value)
    router.push('/') // Redirige al inicio tras login exitoso
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error al iniciar sesión'
  } finally {
    loading.value = false
  }
}

const required = (v: string) => !!v || 'Field is required'
</script>