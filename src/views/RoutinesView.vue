<template>
  <v-container>
    <v-row class="align-center mb-4 mt-4">
      <v-col cols="12" sm="8">
        <h1 class="text-h4">Moje Rutine 📋</h1>
        <p class="text-subtitle-1 text-grey-darken-1">Tvoji osebni plani treningov.</p>
      </v-col>
      <v-col cols="12" sm="4" class="text-sm-right">
        <v-btn color="blue-darken-3" prepend-icon="mdi-plus" size="large" @click="dialog = true">
          Sestavi rutino
        </v-btn>
      </v-col>
    </v-row>

    <v-dialog v-model="dialog" fullscreen transition="dialog-bottom-transition">
      <v-card>
        <v-toolbar color="blue-darken-3">
          <v-btn icon @click="zapriDialog"><v-icon>mdi-close</v-icon></v-btn>
          <v-toolbar-title>Nova Rutina</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="shraniRutino" :loading="shranjujem">Shrani</v-btn>
        </v-toolbar>

        <v-card-text class="pa-6">
          <v-text-field v-model="novaRutina.name" label="Ime rutine (npr. Leg Day)" variant="outlined" class="mb-4"></v-text-field>

          <v-autocomplete
            v-model="izbranaVajaZaDodajanje"
            :items="vseVaje"
            item-title="name"
            item-value="id"
            label="Poišči in dodaj vajo..."
            variant="outlined"
            append-inner-icon="mdi-plus"
            @update:modelValue="dodajVajoVRutino"
            clearable
          ></v-autocomplete>

          <v-divider class="my-6"></v-divider>

          <div v-for="(vaja, index) in novaRutina.exercises" :key="index" class="mb-6 pa-4 border rounded">
            <div class="d-flex justify-space-between align-center mb-2">
              <div>
                <h3 class="text-h6 d-inline-block mr-2">{{ vaja.name }}</h3>
                <v-chip size="small" color="blue-lighten-4" class="text-blue-darken-4 font-weight-bold">
                  {{ vaja.type }}
                </v-chip>
              </div>
              <v-btn color="red" variant="text" icon="mdi-delete" size="small" @click="odstraniVajo(index)"></v-btn>
            </div>

            <v-row v-for="(serija, serijaIndex) in vaja.sets" :key="serijaIndex" class="align-center mt-1">
              <v-col cols="2" class="text-center font-weight-bold">Set {{ serijaIndex + 1 }}</v-col>
              
              <template v-if="vaja.type === 'Uteži'">
                <v-col cols="4">
                  <v-text-field v-model="serija.target_weight" label="Teža (kg)" type="number" variant="underlined" density="compact" hide-details></v-text-field>
                </v-col>
                <v-col cols="4">
                  <v-text-field v-model="serija.target_reps" label="Ponovitve" type="number" variant="underlined" density="compact" hide-details></v-text-field>
                </v-col>
              </template>

              <template v-else-if="vaja.type === 'Telesna teža'">
                <v-col cols="8">
                  <v-text-field v-model="serija.target_reps" label="Ponovitve" type="number" variant="underlined" density="compact" hide-details></v-text-field>
                </v-col>
              </template>

              <template v-else-if="vaja.type === 'Kardio'">
                <v-col cols="4">
                  <v-text-field v-model="serija.target_time" label="Čas (min)" type="number" variant="underlined" density="compact" hide-details></v-text-field>
                </v-col>
                <v-col cols="4">
                  <v-text-field v-model="serija.target_distance" label="Razdalja (km)" type="number" variant="underlined" density="compact" hide-details></v-text-field>
                </v-col>
              </template>

              <v-col cols="2" class="text-right">
                <v-btn icon="mdi-close" variant="text" color="grey" size="small" @click="odstraniSerijo(index, serijaIndex)"></v-btn>
              </v-col>
            </v-row>

            <v-btn color="grey-darken-2" variant="tonal" size="small" class="mt-4" prepend-icon="mdi-plus" @click="dodajSerijo(index)">
              Dodaj serijo
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-row v-if="!nalagam">
      <v-col v-for="rutina in rutine" :key="rutina.id" cols="12" md="4">
       <v-card elevation="2" class="h-100 border-top-blue d-flex flex-column">
          
          <v-card-title class="d-flex justify-space-between align-center">
            <span class="font-weight-bold">{{ rutina.name }}</span>
            <v-btn icon="mdi-delete" variant="text" color="red" size="small" @click="izbrisiRutino(rutina.id)"></v-btn>
          </v-card-title>
          
          <v-card-text class="flex-grow-1">
            <p class="text-grey mb-3 text-caption">Ustvarjeno: {{ new Date(rutina.created_at).toLocaleDateString() }}</p>
            
            <div v-if="rutina.routine_exercises && rutina.routine_exercises.length > 0">
              <p class="text-subtitle-2 mb-1">Vaje v rutini:</p>
              <v-chip 
                v-for="re in rutina.routine_exercises" 
                :key="re.id" 
                size="small" 
                variant="tonal" 
                color="blue-darken-3" 
                class="mr-1 mb-1"
              >
                {{ re.exercise.name }} ({{ re.sets.length }} set)
              </v-chip>
            </div>
            <div v-else class="text-grey text-caption">
              Ta rutina nima vaj.
            </div>
          </v-card-text>

          <v-card-actions class="pa-4 pt-0">
            <v-btn color="blue-darken-3" variant="flat" block @click="zacniTrening(rutina.id)">
              Začni trening
            </v-btn>
          </v-card-actions>
          
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const rutine = ref([])
const vseVaje = ref([])
const nalagam = ref(true)

const dialog = ref(false)
const shranjujem = ref(false)
const izbranaVajaZaDodajanje = ref(null)

const novaRutina = ref({
  name: '',
  exercises: []
})

const token = localStorage.getItem('token')
const headers = {
  'Authorization': `Bearer ${token}`,
  'Accept': 'application/json',
  'Content-Type': 'application/json'
}

async function naloziPodatke() {
  try {
    const resRutine = await fetch('http://127.0.0.1:8000/api/routines', { headers })
    if (resRutine.ok) rutine.value = await resRutine.json()

    const resVaje = await fetch('http://127.0.0.1:8000/api/exercises', { headers })
    if (resVaje.ok) vseVaje.value = await resVaje.json()
  } catch (e) {
    console.error(e)
  } finally {
    nalagam.value = false
  }
}

// -- LOGIKA GRADITELJA RUTINE --

function dodajVajoVRutino(exerciseId) {
  if (!exerciseId) return
  
  const vaja = vseVaje.value.find(v => v.id === exerciseId)
  
  // Zapišem tudi tip vaje (Uteži, Kardio...), da vem, kaj prikazati na zaslonu!
  novaRutina.value.exercises.push({
    exercise_id: vaja.id,
    name: vaja.name,
    type: vaja.type.name, 
    sets: [ { target_weight: null, target_reps: null, target_time: null, target_distance: null } ]
  })

  izbranaVajaZaDodajanje.value = null
}

function odstraniVajo(vajaIndex) {
  novaRutina.value.exercises.splice(vajaIndex, 1)
}

function dodajSerijo(vajaIndex) {
  novaRutina.value.exercises[vajaIndex].sets.push({ target_weight: null, target_reps: null, target_time: null, target_distance: null })
}

function odstraniSerijo(vajaIndex, serijaIndex) {
  novaRutina.value.exercises[vajaIndex].sets.splice(serijaIndex, 1)
}

// -- SHRANJEVANJE --

async function shraniRutino() {
  if (!novaRutina.value.name || novaRutina.value.exercises.length === 0) {
    alert('Vnesi ime rutine in dodaj vsaj eno vajo!')
    return
  }

  shranjujem.value = true

  
 
  const ocisceniPodatki = JSON.parse(JSON.stringify(novaRutina.value))
  ocisceniPodatki.exercises.forEach(vaja => {
    vaja.sets.forEach(set => {
      set.target_weight = set.target_weight ? parseFloat(set.target_weight) : null
      set.target_reps = set.target_reps ? parseInt(set.target_reps) : null
      set.target_time = set.target_time ? parseInt(set.target_time) : null
      set.target_distance = set.target_distance ? parseFloat(set.target_distance) : null
    })
  })

  try {
    const response = await fetch('http://127.0.0.1:8000/api/routines', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(ocisceniPodatki) // Pošlje očiščene podatke
    })

    if (response.ok) {
      await naloziPodatke()
      zapriDialog()
    } else {
      const errorData = await response.json()
      console.error(errorData)
      alert("Napaka pri shranjevanju! Preveri konzolo.")
    }
  } catch (error) {
    console.error("Napaka:", error)
  } finally {
    shranjujem.value = false
  }
}

function zapriDialog() {
  dialog.value = false
  novaRutina.value = { name: '', exercises: [] }
}

//Trening
function zacniTrening(rutinaOd){
  router.push({ name: 'workout', params: { id: rutinaOd } })
}

//BRISANJE RUTINE
async function izbrisiRutino(id) {
  if (!confirm("Si prepričan, da želiš izbrisati to rutino?")) return;

  try {
    const response = await fetch(`http://127.0.0.1:8000/api/routines/${id}`, {
      method: 'DELETE',
      headers: headers
    })

    if (response.ok) {
      await naloziPodatke() 
    } else {
      alert("Napaka pri brisanju.")
    }
  } catch (error) {
    console.error(error)
  }
}





onMounted(() => {
  naloziPodatke()
})
</script>

<style scoped>
.border { border: 1px solid #e0e0e0; }
.border-top-blue { border-top: 4px solid #1565C0; }
</style>