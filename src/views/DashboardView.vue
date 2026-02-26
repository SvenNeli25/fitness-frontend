<template>
  <v-container>
    <v-row class="align-center mb-4 mt-4">
      <v-col cols="12" sm="8">
        <h1 class="text-h4">Moja knjižnica vaj 🏋️‍♂️</h1>
        <p class="text-subtitle-1 text-grey-darken-1">
          Tukaj je seznam vseh razpoložljivih vaj. lahko jih tudi dodas
        </p>
      </v-col>
      <v-col cols="12" sm="4" class="text-sm-right">
        <v-btn color="green-darken-1" prepend-icon="mdi-plus" size="large" @click="dialog = true">
          Dodaj vajo
        </v-btn>
      </v-col>
    </v-row>

    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h5 bg-grey-lighten-3 pa-4">
          Nova vaja
        </v-card-title>

        <v-card-text class="pa-4">
          <v-form @submit.prevent="shraniVajo">
            <v-text-field
              v-model="novaVaja.name"
              label="Ime vaje (npr. Bolgarski počep)"
              variant="outlined"
              required
              class="mb-2"
            ></v-text-field>

            <v-select
              v-model="novaVaja.exercise_type_id"
              :items="tipiVaj"
              item-title="name"
              item-value="id"
              label="Kategorija (Tip vaje)"
              variant="outlined"
              required
              class="mb-2"
            ></v-select>

            <v-textarea
              v-model="novaVaja.description"
              label="Opis in navodila (opcijsko)"
              variant="outlined"
              rows="3"
            ></v-textarea>
          </v-form>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" variant="text" @click="zapriDialog">Prekliči</v-btn>
          <v-btn color="blue-darken-3" variant="flat" @click="shraniVajo" :loading="shranjujem">Shrani vajo</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-row v-if="nalagam">
      <v-col class="text-center mt-10">
        <v-progress-circular indeterminate color="blue-darken-3" size="50"></v-progress-circular>
      </v-col>
    </v-row>

    <v-row v-else>
      <v-col v-for="vaja in vaje" :key="vaja.id" cols="12" sm="6" md="4">
        <v-card elevation="2" class="h-100 d-flex flex-column hover-card">
          <v-card-item>
            <template v-slot:title>
              {{ vaja.name }}
            </template>
            <template v-slot:subtitle>
              <v-chip size="small" color="blue-darken-3" variant="flat" class="mt-2 font-weight-bold">
                {{ vaja.type.name }}
              </v-chip>
            </template>
          </v-card-item>
          <v-card-text class="flex-grow-1 mt-2 text-body-1">
            {{ vaja.description }}
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'


const vaje = ref([])
const tipiVaj = ref([])
const nalagam = ref(true)


const dialog = ref(false)
const shranjujem = ref(false)
const novaVaja = ref({
  name: '',
  exercise_type_id: null,
  description: ''
})


const token = localStorage.getItem('token') 
const headers = {
  'Authorization': `Bearer ${token}`,
  'Accept': 'application/json',
  'Content-Type': 'application/json'
}


async function pridobiVaje() {
  try {
    const response = await fetch('http://127.0.0.1:8000/api/exercises', { headers })
    if (response.ok) vaje.value = await response.json()
  } catch (error) {
    console.error('Napaka pri vajah', error)
  } finally {
    nalagam.value = false
  }
}


async function pridobiTipeVaj() {
  try {
    const response = await fetch('http://127.0.0.1:8000/api/exercise-types', { headers })
    if (response.ok) tipiVaj.value = await response.json()
  } catch (error) {
    console.error('Napaka pri tipih', error)
  }
}


async function shraniVajo() {
  if (!novaVaja.value.name || !novaVaja.value.exercise_type_id) {
    alert("Ime in kategorija sta obvezna!")
    return
  }

  shranjujem.value = true
  try {
    const response = await fetch('http://127.0.0.1:8000/api/exercises', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(novaVaja.value)
    })

    if (response.ok) {
      const shranjenaVaja = await response.json()
      //doda novo vajo na zacetek seznama
      vaje.value.unshift(shranjenaVaja) 
      zapriDialog()
    } else {
      alert("Napaka pri shranjevanju na strežnik.")
    }
  } catch (error) {
    console.error("Napaka:", error)
  } finally {
    shranjujem.value = false
  }
}

function zapriDialog() {
  dialog.value = false
  // Pocisti obrazec
  novaVaja.value = { name: '', exercise_type_id: null, description: '' }
}

// Ko se stran nalozi, potegne tipe in vaje
onMounted(() => {
  pridobiVaje()
  pridobiTipeVaj()
})
</script>

<style scoped>
.hover-card {
  transition: transform 0.2s ease-in-out;
}
.hover-card:hover {
  transform: translateY(-5px);
}
</style>