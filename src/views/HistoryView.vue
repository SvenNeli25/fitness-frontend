<template>
  <v-container>
    <v-row class="mb-4 mt-4">
      <v-col>
        <h1 class="text-h4">Moj Dnevnik 📖</h1>
        <p class="text-subtitle-1 text-grey-darken-1">Pregled tvojega preteklega truda in znoja.</p>
      </v-col>
    </v-row>

    <v-row v-if="nalagam">
      <v-col class="text-center mt-10">
        <v-progress-circular indeterminate color="green-darken-2" size="50"></v-progress-circular>
      </v-col>
    </v-row>

    <v-row v-else-if="treningi.length === 0">
      <v-col class="text-center mt-10">
        <v-icon size="100" color="grey-lighten-2">mdi-history</v-icon>
        <h3 class="text-h5 text-grey mt-4">Zgodovina je prazna.</h3>
        <p class="text-grey">Opravi svoj prvi trening, da se prikaže tukaj!</p>
        <v-btn color="blue-darken-3" class="mt-4" to="/routines">Pojdi na rutine</v-btn>
      </v-col>
    </v-row>

    <v-row v-else>
      <v-col v-for="trening in treningi" :key="trening.id" cols="12" md="6">
        <v-card class="mb-4 border-top-green h-100" elevation="2">
          
          <v-card-title class="d-flex justify-space-between align-center bg-grey-lighten-4">
            <span class="font-weight-bold text-h6">
              {{ trening.routine ? trening.routine.name : 'Izbrisan plan' }}
            </span>
            <v-chip size="small" color="green-darken-2" variant="flat">
              <v-icon start icon="mdi-check-circle"></v-icon> Opravljeno
            </v-chip>
          </v-card-title>
          
          <v-card-text class="pt-4">
            <p class="text-subtitle-2 text-grey-darken-1 mb-3">
              <v-icon size="small" class="mr-1">mdi-calendar-clock</v-icon> 
              {{ formatirajDatum(trening.start_time) }}
            </p>
            
            <div v-for="set in trening.sets" :key="set.id" class="mb-2 pl-2 border-left-grey">
              <strong class="text-blue-darken-4">{{ set.exercise.name }}</strong> 
              <span class="text-grey-darken-2 text-caption ml-2">(Set {{ set.set_number }}):</span>
              
              <span class="ml-2 font-weight-medium">
                <template v-if="set.actual_weight">{{ set.actual_weight }} kg x </template>
                <template v-if="set.actual_reps">{{ set.actual_reps }} pon</template>
                <template v-if="set.actual_time">{{ set.actual_time }} min </template>
                <template v-if="set.actual_distance">{{ set.actual_distance }} km</template>
              </span>
            </div>

          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const treningi = ref([])
const nalagam = ref(true)

async function naloziZgodovino() {
  try {
    const token = localStorage.getItem('token')
    const response = await fetch('http://127.0.0.1:8000/api/workout-sessions', {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
    })
    
    if (response.ok) {
      treningi.value = await response.json()
    }
  } catch (error) {
    console.error(error)
  } finally {
    nalagam.value = false
  }
}

function formatirajDatum(datumStolpec) {
  if (!datumStolpec) return ''
  const datum = new Date(datumStolpec)
  return datum.toLocaleDateString('sl-SI') + ' ob ' + datum.toLocaleTimeString('sl-SI', { hour: '2-digit', minute:'2-digit' })
}

onMounted(() => {
  naloziZgodovino()
})
</script>

<style scoped>
.border-top-green { border-top: 4px solid #388E3C; }
.border-left-grey { border-left: 2px solid #E0E0E0; }
</style>