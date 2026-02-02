
<template>
  <v-app>
    <v-main>
      <v-container>
        <h1 class="mb-5"><v-icon icon="mdi-dumbbell"></v-icon> Dobrodošli v gym app</h1>
        
        <v-card class="mb-5 pa-4">
          <h3> Dodaj Vajo! </h3>
          <v-row>
            <v-col cols="12" md="4">
              <v-text-field label="Ime" v-model="novaVaja.name"></v-text-field>
            </v-col>
            <v-col cols="6" md="4">
              <v-text-field label="Ponovitve" v-model="novaVaja.reps" type="number"></v-text-field>
            </v-col>
            <v-col cols="6" md="4">
              <v-text-field label="Kalorije" v-model="novaVaja.calories" type="number"></v-text-field>
            </v-col>


          </v-row>
          <v-btn color="primary" @click="shraniVajo">Shrani Vajo</v-btn>

        </v-card>


        <v-card>
          <v-list lines="two">
            <v-list-subheader>Moje vaje</v-list-subheader>

            <v-list-item
              v-for="workout in workouts"
              :key="workout.id"
              :title="workout.name"
              :subtitle="workout.reps + ' ponovitve ' + workout.calories + ' kcal'"
            >
              <template v-slot:prepend>
                <v-icon icon="mdi-run" color="blue"></v-icon>
              </template>
            </v-list-item>

            <v-list-item v-if="workouts.length === 0">
              <v-list-item-title>...BIP BOP...</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card>
      </v-container>
    </v-main>
  </v-app>

</template>

<script setup>
import { ref, onMounted } from "vue"

const workouts = ref([])

const novaVaja = ref({
  name: '',
  reps: null,
  calories: null
})

async function shraniVajo() {
  const podatki = {
    name: novaVaja.value.name,
    reps: novaVaja.value.reps,
    calories: novaVaja.value.calories
  }

  try{
    const response = await fetch('http://127.0.0.1:8000/api/workouts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(podatki)
    })
    
    const shranjenaVaja = await response.json()
    workouts.value.push(shranjenaVaja)

    novaVaja.value.name = ''
    novaVaja.value.reps = ''
    novaVaja.value.calories = ''

  } catch (error) {
    console.error("napaka pri shranjevanju vaje: ", error)
  }
}

onMounted(async () => {
  try{
    const respond = await fetch('http://127.0.0.1:8000/api/workouts')
    const data = await respond.json()
    workouts.value = data
    console.log("podatki so tu: ", data)
  } catch (error) {
    console.error("napaka pri pridobivanju podatkov: ", error)
  }
})
</script>
