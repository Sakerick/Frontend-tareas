<template>
  <v-container>
    <v-card class="pa-4 ma-4">
      <v-card-title>Agregar Tarea</v-card-title>
      <v-card-text>
        <v-btn color="primary" @click="createTaskDialog = true">+ Nueva Tarea</v-btn>
      </v-card-text>
    </v-card>

    <v-card class="pa-4 ma-4">
      <v-card-title>Buscar y filtrar tareas</v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="searchTitle"
              label="Buscar por nombre"
              clearable
              @keyup.enter="applyFilters"
            />
          </v-col>
          <v-col cols="12" md="4">
            <v-select
              v-model="selectedTagId"
              :items="tags"
              item-title="nombre"
              item-value="id"
              label="Filtrar por etiqueta"
              clearable
            />
          </v-col>
          <v-col cols="12" md="3" class="d-flex align-center">
            <v-btn class="mr-2" color="primary" @click="applyFilters">Buscar</v-btn>
            <v-btn variant="outlined" @click="resetFilters">Limpiar</v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-card class="pa-4 ma-4">
      <v-card-title>Tareas Actuales</v-card-title>
      <v-card-text>
        <v-alert v-if="error" type="error" class="mb-4">{{ error }}</v-alert>
        <v-progress-circular v-if="loading" indeterminate color="primary" />

        <v-list v-else-if="tasks.length > 0">
          <v-list-item v-for="task in tasks" :key="task.id" border class="mb-2 rounded-lg">
            <v-list-item-title :class="{ 'text-decoration-line-through text-grey': task.completada }" class="text-h6">
              {{ task.titulo }}
            </v-list-item-title>

            <v-list-item-subtitle>
              <div class="mt-1 mb-1" v-if="task.descripcion">
                <p class="text-caption">{{ task.descripcion }}</p>
              </div>
              <div class="mt-2 mb-1">
                <v-chip
                  v-for="tag in task.tags"
                  :key="tag.id"
                  :color="tag.color || 'primary'"
                  size="x-small"
                  class="mr-1 font-weight-bold"
                  variant="elevated"
                >
                  {{ tag.nombre }}
                </v-chip>
                <span v-if="!task.tags || task.tags.length === 0" class="text-caption text-italic text-grey">
                  Sin etiquetas
                </span>
              </div>
              <v-icon size="small" :color="task.completada ? 'success' : 'warning'">
                {{ task.completada ? 'mdi-check-decagram' : 'mdi-clock-outline' }}
              </v-icon>
              <span class="ml-1 text-caption">
                {{ task.completada ? 'Finalizada' : 'En progreso' }}
              </span>
            </v-list-item-subtitle>

            <template #append>
              <v-btn icon variant="text" color="primary" @click="toggleTaskStatus(task)">
                <v-icon>{{ task.completada ? 'mdi-undo' : 'mdi-check' }}</v-icon>
              </v-btn>
              <v-btn icon variant="text" color="grey-darken-1" @click="editTask(task)">
                <v-icon>mdi-pencil-outline</v-icon>
              </v-btn>
              <v-btn icon variant="text" color="error" @click="deleteTask(task.id)">
                <v-icon>mdi-trash-can-outline</v-icon>
              </v-btn>
            </template>
          </v-list-item>
        </v-list>

        <p v-else-if="!loading">No hay tareas disponibles.</p>
      </v-card-text>
    </v-card>

    <!-- Diálogo para crear tarea -->
    <v-dialog v-model="createTaskDialog" max-width="600">
      <v-card>
        <v-card-title>Crear Nueva Tarea</v-card-title>
        <v-card-text>
          <v-form @submit.prevent="addTask">
            <v-text-field
              v-model="newTaskForm.titulo"
              label="Nombre de la tarea"
              required
              class="mb-4"
            />
            <v-textarea
              v-model="newTaskForm.descripcion"
              label="Descripción"
              rows="3"
              class="mb-4"
            />
            <div class="mb-4">
              <label class="text-subtitle-2">Etiquetas existentes</label>
              <v-chip-group v-model="newTaskForm.selectedTagIds" multiple>
                <v-chip
                  v-for="tag in tags"
                  :key="tag.id"
                  :value="tag.id"
                  :color="tag.color || 'primary'"
                  variant="outlined"
                >
                  {{ tag.nombre }}
                </v-chip>
              </v-chip-group>
            </div>
            <v-divider class="my-4" />
            <div class="mb-4">
              <label class="text-subtitle-2">O crear una nueva etiqueta</label>
              <v-row>
                <v-col cols="12" md="8">
                  <v-text-field
                    v-model="newTag.nombre"
                    label="Nombre de la etiqueta"
                    placeholder="ej: Urgente, Trabajo, etc."
                  />
                </v-col>
                <v-col cols="12" md="4">
                  <v-color-picker
                    v-model="newTag.color"
                    mode="hex"
                    class="mx-auto"
                    hide-inputs
                  />
                </v-col>
              </v-row>
              <v-btn variant="outlined" color="secondary" @click="createAndAddTag" :disabled="!newTag.nombre.trim()">
                + Agregar etiqueta
              </v-btn>
            </div>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="closeCreateDialog">Cancelar</v-btn>
          <v-btn color="primary" @click="addTask" :disabled="!newTaskForm.titulo.trim()">Crear Tarea</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Diálogo para editar tarea -->
    <v-dialog v-model="editDialog" max-width="500">
      <v-card>
        <v-card-title>Editar Tarea</v-card-title>
        <v-card-text>
          <v-text-field v-model="editingTask.titulo" label="Nombre de la tarea" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
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
const TAGS_PATH = '/api/tags'

interface Tag {
  id: number;
  nombre: string;
  color?: string;
}

interface Tarea {
  id: number;
  titulo: string;
  descripcion?: string;
  completada: boolean;
  tags?: Tag[];
}

const createTaskDialog = ref(false)
const editDialog = ref(false)
const searchTitle = ref('')
const selectedTagId = ref<number | null>(null)
const loading = ref(false)
const error = ref('')
const tags = ref<Tag[]>([])
const tasks = ref<Tarea[]>([])
const editingTask = ref<Tarea>({ id: 0, titulo: '', completada: false })

const newTaskForm = ref({
  titulo: '',
  descripcion: '',
  selectedTagIds: [] as number[]
})

const newTag = ref({
  nombre: '',
  color: '#FF5252'
})

const normalizeTasks = (payload: any) => {
  if (Array.isArray(payload)) return payload
  if (payload?.data && Array.isArray(payload.data)) return payload.data
  if (payload?.tasks && Array.isArray(payload.tasks)) return payload.tasks
  return []
}

const fetchTasks = async () => {
  try {
    loading.value = true
    error.value = ''
    const response = await fetchWithAuth(TAREAS_PATH)
    if (response.status === 401) {
      error.value = 'Sesión expirada. Por favor inicia sesión de nuevo.'
      return
    }
    const payload = await response.json()
    tasks.value = normalizeTasks(payload)
  } catch (err) {
    error.value = 'No se pudo conectar con el servidor.'
    console.error(err)
  } finally {
    loading.value = false
  }
}

const fetchTags = async () => {
  try {
    const response = await fetchWithAuth(TAGS_PATH)
    if (response.ok) {
      tags.value = await response.json()
    }
  } catch (err) {
    console.error('Error cargando etiquetas:', err)
  }
}

const applyFilters = async () => {
  error.value = ''
  loading.value = true
  try {
    if (selectedTagId.value) {
      const response = await fetchWithAuth(`${TAREAS_PATH}/tag/${selectedTagId.value}`)
      const payload = await response.json()
      tasks.value = normalizeTasks(payload)
    } else if (searchTitle.value.trim()) {
      const response = await fetchWithAuth(`${TAREAS_PATH}/buscar?titulo=${encodeURIComponent(searchTitle.value.trim())}`)
      const payload = await response.json()
      tasks.value = normalizeTasks(payload)
    } else {
      await fetchTasks()
      return
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error al filtrar tareas'
    console.error(err)
  } finally {
    loading.value = false
  }
}

const resetFilters = () => {
  searchTitle.value = ''
  selectedTagId.value = null
  fetchTasks()
}

const closeCreateDialog = () => {
  createTaskDialog.value = false
  newTaskForm.value = { titulo: '', descripcion: '', selectedTagIds: [] }
  newTag.value = { nombre: '', color: '#FF5252' }
}

const createAndAddTag = async () => {
  if (!newTag.value.nombre.trim()) return

  try {
    const response = await fetchWithAuth(TAGS_PATH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTag.value)
    })

    if (!response.ok) throw new Error('Error al crear etiqueta')

    const createdTag = await response.json()
    tags.value.push(createdTag)
    newTaskForm.value.selectedTagIds.push(createdTag.id)
    newTag.value = { nombre: '', color: '#FF5252' }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error al crear etiqueta'
    console.error('Error al crear etiqueta:', err)
  }
}

const addTask = async () => {
  if (!newTaskForm.value.titulo.trim()) return

  try {
    const payload = {
      titulo: newTaskForm.value.titulo.trim(),
      descripcion: newTaskForm.value.descripcion.trim(),
      completada: false,
      tagIds: newTaskForm.value.selectedTagIds
    }

    const response = await fetchWithAuth(TAREAS_PATH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const contentType = response.headers.get('content-type') || ''
      let message = `Error al crear tarea (${response.status})`
      if (contentType.includes('application/json')) {
        const body = await response.json()
        message = body.error || body.message || message
      } else {
        const text = await response.text()
        if (text) message = text
      }
      throw new Error(message)
    }

    const data = await response.json()
    if (!Array.isArray(tasks.value)) {
      tasks.value = []
    }
    tasks.value.push(data.data || data)
    closeCreateDialog()
    await fetchTags()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error al crear tarea'
    console.error('Error al crear tarea:', err)
  }
}

const editTask = (task: Tarea) => {
  editingTask.value = { ...task }
  editDialog.value = true
}

const toggleTaskStatus = async (task: { id: number; completada: boolean }) => {
  try {
    const response = await fetchWithAuth(`${TAREAS_PATH}/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completada: !task.completada })
    })

    if (!response.ok) throw new Error('Error al actualizar estado de tarea')

    const data = await response.json()
    const updated = data.data || data
    const index = tasks.value.findIndex(t => t.id === task.id)
    if (index !== -1) tasks.value[index] = updated
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error al actualizar estado de tarea'
    console.error('Error al actualizar estado de tarea:', err)
  }
}

const saveEdit = async () => {
  try {
    const response = await fetchWithAuth(`${TAREAS_PATH}/${editingTask.value.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titulo: editingTask.value.titulo, completada: editingTask.value.completada })
    })

    if (!response.ok) throw new Error('Error al actualizar tarea')

    const data = await response.json()
    const updated = data.data || data
    const index = tasks.value.findIndex(t => t.id === editingTask.value.id)
    if (index !== -1) tasks.value[index] = updated
    editDialog.value = false
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error al actualizar tarea'
    console.error('Error al actualizar tarea:', err)
  }
}

const deleteTask = async (id: number) => {
  if (!confirm('¿Estás seguro de que quieres eliminar esta tarea?')) return

  try {
    const response = await fetchWithAuth(`${TAREAS_PATH}/${id}`, { method: 'DELETE' })
    if (!response.ok) throw new Error('Error al eliminar tarea')
    tasks.value = tasks.value.filter(t => t.id !== id)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error al eliminar tarea'
    console.error('Error al eliminar tarea:', err)
  }
}

onMounted(() => {
  fetchTags()
  fetchTasks()
})
</script>
