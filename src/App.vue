<template>
  <v-app>
    <v-main v-if="!initialized">
      <v-container class="text-center">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
        <p class="mt-2">Cargando...</p>
      </v-container>
    </v-main>
    <v-app-bar app>
      <v-toolbar-title>My App</v-toolbar-title>
      <v-btn to="/" color="primary">Main</v-btn>
      <template v-if="auth.isAuthenticated">
        <span class="mr-3 text-caption">{{ auth.user?.email }}</span>
        <v-btn color="error" @click="handleLogout">Logout</v-btn>
      </template>
      <v-btn v-else to="/login" color="primary">Login</v-btn>
    </v-app-bar>
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ref, onMounted } from 'vue'

const auth = useAuthStore()
const initialized = ref(false)
const router = useRouter()

const handleLogout = async () => {
  // Redirigir al endpoint de logout del backend
  window.location.href = 'https://localhost:3100/api/auth/logout';
}
onMounted(async () => {
  await auth.checkSession()
  initialized.value = true
}) 

</script>