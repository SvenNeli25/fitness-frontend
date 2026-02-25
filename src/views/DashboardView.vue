<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4 mt-4">Moja knjižnica vaj 🏋️‍♂️</h1>
        <p class="text-subtitle-1 mb-6 text-grey-darken-1">
          Tukaj je seznam vseh razpoložljivih vaj v bazi. pol grejo lahka v rutine ka pa to a.
        </p>
      </v-col>
    </v-row>

    <v-row v-if="nalagam">
      <v-col class="text-center mt-10">
        <v-progress-circular indeterminate color="blue-darken-3" size="50"></v-progress-circular>
        <p class="mt-4 text-grey">Nalagam vaje iz baze...</p>
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
const nalagam = ref(true)


async function pridobiVaje() {
  try {
    
    const token = localStorage.getItem('token') 
    
    const response = await fetch('http://127.0.0.1:8000/api/exercises', {
      headers: {
        'Authorization': `Bearer ${token}`, 
        'Accept': 'application/json'
      }
    })

    if (response.ok) {
      vaje.value = await response.json()
    } else {
      console.error('Backend je zavrnil dostop. Preveri žeton.')
    }
  } catch (error) {
    console.error('Povezava s strežnikom ni uspela', error)
  } finally {
    nalagam.value = false 
  }
}


onMounted(() => {
  pridobiVaje()
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