<template>
  <v-container>
    <v-card class="pa-6">
      <v-card-title>Panel de Administrador</v-card-title>
      <v-card-text>
        <v-alert type="info" class="mb-4">
          Usuario root local: <strong>root@local</strong> / <strong>rootpass</strong>
        </v-alert>

        <v-row class="mb-4" align="center">
          <v-col cols="12" md="4">
            <v-sheet class="pa-4" elevation="1">
              <div class="text-caption text-uppercase mb-2">Tareas</div>
              <div class="text-h4">{{ stats.tareas }}</div>
            </v-sheet>
          </v-col>
          <v-col cols="12" md="4">
            <v-sheet class="pa-4" elevation="1">
              <div class="text-caption text-uppercase mb-2">Usuarios</div>
              <div class="text-h4">{{ stats.usuarios }}</div>
            </v-sheet>
          </v-col>
          <v-col cols="12" md="4">
            <v-sheet class="pa-4" elevation="1">
              <div class="text-caption text-uppercase mb-2">Tags</div>
              <div class="text-h4">{{ stats.tags }}</div>
            </v-sheet>
          </v-col>
        </v-row>

        <v-card class="mb-4" v-if="users.length">
          <v-card-title>Usuarios registrados</v-card-title>
          <v-simple-table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.id">
                <td>{{ user.id }}</td>
                <td>{{ user.nombre || '—' }}</td>
                <td>{{ user.email }}</td>
              </tr>
            </tbody>
          </v-simple-table>
        </v-card>

        <v-alert v-if="error" type="error">{{ error }}</v-alert>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useApi } from '@/composables/useApi'

const { fetchWithAuth } = useApi()
const stats = ref({ usuarios: 0, tareas: 0, tags: 0 })
const users = ref<Array<{ id: number; nombre?: string; email: string }>>([])
const error = ref('')

const loadAdminData = async () => {
  try {
    const statsRes = await fetchWithAuth('/api/admin/stats')
    if (!statsRes.ok) throw new Error('No se pudo cargar estadísticas')
    stats.value = await statsRes.json()

    const usersRes = await fetchWithAuth('/api/admin/usuarios')
    if (!usersRes.ok) throw new Error('No se pudo cargar usuarios')
    users.value = await usersRes.json()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error de administrador'
  }
}

onMounted(loadAdminData)
</script>
