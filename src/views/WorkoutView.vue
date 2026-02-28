<template>
  <v-container max-width="800">
    <v-row v-if="nalagam">
      <v-col class="text-center mt-10">
        <v-progress-circular indeterminate color="blue-darken-3" size="50"></v-progress-circular>
        <p class="mt-4 text-grey">Pripravljam tvoj trening...</p>
      </v-col>
    </v-row>

    <div v-else-if="rutina">
      
      <v-card color="blue-darken-4" class="mb-6 text-center pa-4" elevation="4">
        <h1 class="text-h4 font-weight-bold mb-2">{{ rutina.name }}</h1>
        <div class="text-h2 font-weight-black text-blue-lighten-4 timer-font">
          {{ formatiranCas }}
        </div>
      </v-card>

      <v-card v-for="(vaja, vIndex) in aktivneVaje" :key="vaja.id" class="mb-6 border-top-blue" elevation="2">
        <v-card-title class="bg-grey-lighten-4 font-weight-bold d-flex align-center">
          <span class="text-h6">{{ vIndex + 1 }}. {{ vaja.exercise.name }}</span>
          <v-spacer></v-spacer>
          <v-chip size="small" color="blue-darken-3" variant="outlined">{{ vaja.exercise.type.name }}</v-chip>
        </v-card-title>

        <v-card-text class="pa-4">
          <v-row 
            v-for="(set, sIndex) in vaja.sets" 
            :key="set.id" 
            class="align-center py-1 set-row"
            :class="{ 'bg-green-lighten-5': set.is_completed }"
          >
            <v-col cols="2" class="font-weight-bold">Set {{ sIndex + 1 }}</v-col>

            <template v-if="vaja.exercise.type.name === 'Uteži'">
              <v-col cols="4">
                <v-text-field v-model="set.actual_weight" label="kg" type="number" variant="underlined" density="compact" hide-details></v-text-field>
              </v-col>
              <v-col cols="4">
                <v-text-field v-model="set.actual_reps" label="Ponovitve" type="number" variant="underlined" density="compact" hide-details></v-text-field>
              </v-col>
            </template>

            <template v-else-if="vaja.exercise.type.name === 'Telesna teža'">
              <v-col cols="8">
                <v-text-field v-model="set.actual_reps" label="Ponovitve" type="number" variant="underlined" density="compact" hide-details></v-text-field>
              </v-col>
            </template>

            <template v-else-if="vaja.exercise.type.name === 'Kardio'">
              <v-col cols="4">
                <v-text-field v-model="set.actual_time" label="Čas (min)" type="number" variant="underlined" density="compact" hide-details></v-text-field>
              </v-col>
              <v-col cols="4">
                <v-text-field v-model="set.actual_distance" label="Razdalja (km)" type="number" variant="underlined" density="compact" hide-details></v-text-field>
              </v-col>
            </template>

            <v-col cols="2" class="text-right">
              <v-checkbox-btn v-model="set.is_completed" color="green-darken-1"></v-checkbox-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <v-row class="mt-4 mb-8">
        <v-col cols="6">
          <v-btn color="red-darken-2" variant="tonal" block size="large" @click="prekiniTrening">Prekini</v-btn>
        </v-col>
        <v-col cols="6">
          <v-btn color="green-darken-2" variant="flat" block size="large" @click="zakljuciTrening">Zaključi trening</v-btn>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const rutina = ref(null)
const aktivneVaje = ref([]) 
const nalagam = ref(true)

//ŠTOPARICA
const casVSekundah = ref(0)
let timerInterval = null

const formatiranCas = computed(() => {
  const minute = Math.floor(casVSekundah.value / 60).toString().padStart(2, '0')
  const sekunde = (casVSekundah.value % 60).toString().padStart(2, '0')
  return `${minute}:${sekunde}`
})

function zazeniStoparico() {
  timerInterval = setInterval(() => { casVSekundah.value++ }, 1000)
}

function ustaviStoparico() {
  if (timerInterval) clearInterval(timerInterval)
}

//NALAGANJE PODATKOV
async function naloziTrening() {
  const token = localStorage.getItem('token')
  const id = route.params.id
  
  try {
    const response = await fetch(`http://127.0.0.1:8000/api/routines/${id}`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
    })

    if (response.ok) {
      const data = await response.json()
      rutina.value = data
      
      
      aktivneVaje.value = data.routine_exercises.map(re => ({
        ...re,
        sets: re.sets.map(set => ({
          ...set,
          actual_weight: set.target_weight,       
          actual_reps: set.target_reps,           
          actual_time: set.target_time,
          actual_distance: set.target_distance,
          is_completed: false                     
        }))
      }))

      zazeniStoparico() 
    } else {
      alert("Napaka pri nalaganju rutine.")
      router.push('/routines')
    }
  } catch (error) {
    console.error(error)
  } finally {
    nalagam.value = false
  }
}

//AKCIJE 
function prekiniTrening() {
  if (confirm("Si prepričan? Ta trening ne bo shranjen.")) {
    router.push('/routines')
  }
}

async function zakljuciTrening() {
  ustaviStoparico()

 
  const payload = {
    routine_id: rutina.value.id,
    duration_seconds: casVSekundah.value,
    exercises: aktivneVaje.value.map(vaja => ({
      exercise_id: vaja.exercise.id,
      sets: vaja.sets.map((set, index) => ({
        set_number: index + 1,
        actual_weight: set.actual_weight ? parseFloat(set.actual_weight) : null,
        actual_reps: set.actual_reps ? parseInt(set.actual_reps) : null,
        actual_time: set.actual_time ? parseInt(set.actual_time) : null,
        actual_distance: set.actual_distance ? parseFloat(set.actual_distance) : null,
        is_completed: set.is_completed
      })).filter(set => set.is_completed)
    })).filter(vaja => vaja.sets.length > 0) 
  }

  
  if (payload.exercises.length === 0) {
    alert("Nisi obkljukal nobene serije! Trening ne bo shranjen.")
    router.push('/routines')
    return
  }

  
  try {
    const token = localStorage.getItem('token')
    const response = await fetch('http://127.0.0.1:8000/api/workout-sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    if (response.ok) {
      
      alert(`Bravo! 🏆 Trening uspešno shranjen v zgodovino!\nČas treninga: ${formatiranCas.value}`)
      router.push('/routines')
    } else {
      const errorData = await response.json()
      console.error(errorData)
      alert("Napaka pri shranjevanju treninga! Poglej konzolo.")
    }
  } catch (error) {
    console.error(error)
  }
}


onMounted(() => {
  naloziTrening()
})


onUnmounted(() => {
  ustaviStoparico()
})
</script>

<style scoped>
.timer-font {
  font-family: 'Courier New', Courier, monospace; /* Lep digitalni izgled številk */
  letter-spacing: 2px;
}
.border-top-blue { border-top: 4px solid #1565C0; }
.set-row { transition: background-color 0.3s ease; }
</style>