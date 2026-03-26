<template>
  <v-container>
    <v-card class="pa-4 ma-4">
      <v-card-title>Agregar Tarea</v-card-title>
      <v-card-text>
        <v-text-field
          v-model="newTask"
          label="Nombre de la tarea"
          @keyup.enter="addTask"
        ></v-text-field>
        <v-btn color="primary" @click="addTask">Agregar</v-btn>
      </v-card-text>
    </v-card>

    <v-card class="pa-4 ma-4">
      <v-card-title>Tareas Actuales</v-card-title>
      <v-card-text>
        <v-alert v-if="error" type="error" class="mb-4">{{ error }}</v-alert>
        <v-progress-circular v-if="loading" indeterminate color="primary"></v-progress-circular>
        <v-list v-else-if="tasks.length > 0">
          <v-list-item v-for="task in tasks" :key="task.id">
  <v-list-item-title :class="{ 'text-decoration-line-through': task.completada }">
    {{ task.titulo }}
  </v-list-item-title>
  <v-list-item-subtitle>
    Estado: {{ task.completada ? 'Completada' : 'Pendiente' }}
  </v-list-item-subtitle>

  <template #append>
    <v-btn icon @click="toggleTaskStatus(task)">
      <v-icon>{{ task.completada ? 'mdi-check-circle' : 'mdi-circle-outline' }}</v-icon>
    </v-btn>
    <v-btn icon @click="editTask(task)">
      <v-icon>mdi-pencil</v-icon>
    </v-btn>
    <v-btn icon color="error" @click="deleteTask(task.id)">
      <v-icon>mdi-delete</v-icon>
    </v-btn>
  </template>
</v-list-item>
        </v-list>
        <p v-else-if="!loading">No hay tareas disponibles.</p>
      </v-card-text>
    </v-card>

    <!-- Edit Dialog -->
    <v-dialog v-model="editDialog" max-width="500">
      <v-card>
        <v-card-title>Editar Tarea</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="editingTask.titulo"
            label="Nombre de la tarea"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="editDialog = false">Cancelar</v-btn>
          <v-btn color="primary" @click="saveEdit">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useApi } from '@/composables/useApi'

const { fetchWithAuth } = useApi()
const TAREAS_PATH = '/api/tareas'

const tasks = ref<{ id: number; titulo: string; completada: boolean }[]>([])
const newTask = ref('')
const editDialog = ref(false)
const editingTask = ref<{ id: number; titulo: string; completada: boolean }>({ id: 0, titulo: '', completada: false })
const loading = ref(false)
const error = ref('')

const fetchTasks = async () => {
  try {
    loading.value = true
    error.value = ''
    const response = await fetchWithAuth(TAREAS_PATH)
    if (!response.ok) throw new Error('Error al cargar tareas')
    const data = await response.json()
    tasks.value = data.data || []
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error desconocido'
    console.error('Error al cargar tareas:', err)
  } finally {
    loading.value = false
  }
}

const addTask = async () => {
  if (!newTask.value.trim()) return

  try {
    const response = await fetchWithAuth(TAREAS_PATH, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        titulo: newTask.value.trim(),
        completada: false
      }),
    })

    if (!response.ok) throw new Error('Error al crear tarea')

    const data = await response.json()
    tasks.value.push(data.data)
    newTask.value = ''
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error al crear tarea'
    console.error('Error al crear tarea:', err)
  }
}

const editTask = (task: { id: number; titulo: string; completada: boolean }) => {
  editingTask.value = { ...task }
  editDialog.value = true
}

const toggleTaskStatus = async (task: { id: number; titulo: string; completada: boolean }) => {
  try {
    const response = await fetchWithAuth(`${TAREAS_PATH}/${task.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        completada: !task.completada
      }),
    })

    if (!response.ok) throw new Error('Error al actualizar estado de tarea')

    const data = await response.json()
    const index = tasks.value.findIndex(t => t.id === task.id)
    if (index !== -1) {
      tasks.value[index] = data.data
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error al actualizar estado de tarea'
    console.error('Error al actualizar estado de tarea:', err)
  }
}

const saveEdit = async () => {
  try {
    const response = await fetchWithAuth(`${TAREAS_PATH}/${editingTask.value.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        titulo: editingTask.value.titulo,
        completada: editingTask.value.completada
      }),
    })

    if (!response.ok) throw new Error('Error al actualizar tarea')

    const data = await response.json()
    const index = tasks.value.findIndex(t => t.id === editingTask.value.id)
    if (index !== -1) {
      tasks.value[index] = data.data
    }
    editDialog.value = false
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error al actualizar tarea'
    console.error('Error al actualizar tarea:', err)
  }
}

const deleteTask = async (id: number) => {
  if (!confirm('¿Estás seguro de que quieres eliminar esta tarea?')) return

  try {
    const response = await fetchWithAuth(`${TAREAS_PATH}/${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) throw new Error('Error al eliminar tarea')

    tasks.value = tasks.value.filter(t => t.id !== id)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error al eliminar tarea'
    console.error('Error al eliminar tarea:', err)
  }
}

onMounted(() => {
  fetchTasks()
})
</script>