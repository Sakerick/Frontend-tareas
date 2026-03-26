<template>
  <v-app>
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

const auth = useAuthStore()
const router = useRouter()

const handleLogout = async () => {
  await auth.logout()
  router.push('/login')
}
</script>