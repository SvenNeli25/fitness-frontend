
<template>
  <v-app>
    <v-main>
      <v-container>
        <h1 class="mb-5"><v-icon icon="mdi-dumbbell"></v-icon> Dobrodošli v gym app</h1>
        
        <v-card class="mb-5 pa-4">
          <h3> {{ urejamoId ? 'Uredi Vajo' : 'Dodaj Vajo' }}</h3>
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
          <v-btn color="primary" @click="shraniVajo">{{ urejamoId ? 'Posodobi' : 'Shrani' }}</v-btn>

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
              
              <template v-slot:append>
                <v-btn 
                  icon="mdi-pencil" 
                  color="orange"
                  variant="text"
                  class="mr-2"
                  @click="napolniObrazec(workout)"
                >
                  
                </v-btn>


                <v-btn 
                  icon="mdi-delete" 
                  color="red"
                  variant="text"
                  @click="izbrisiVajo(workout.id)"
                >
                  
                </v-btn>
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

  if(!novaVaja.value.name || !novaVaja.value.reps || !novaVaja.value.calories){
    alert("Prosim izpolnite vsa polja")
    return
  }

  const podatki = {
    name: novaVaja.value.name,
    reps: novaVaja.value.reps,
    calories: novaVaja.value.calories
  }

  try{
    let response;

    if(urejamoId.value){
      response = await fetch(`http://127.0.0.1:8000/api/workouts/${urejamoId.value}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(podatki)
      })
      const posodobljenaVaja = await response.json()
      const index = workouts.value.findIndex(vaja => vaja.id === urejamoId.value)
      if (index !== -1) {
        workouts.value[index] = posodobljenaVaja
      }
    } else {
      response = await fetch('http://127.0.0.1:8000/api/workouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(podatki)
      })
      const shranjenaVaja = await response.json()
      workouts.value.push(shranjenaVaja)
  }
  preklicUrejanja()
}catch (error) {
    console.error("napaka pri shranjevanju vaje: ", error)
  }
}

async function izbrisiVajo(id) {
  try{
    await fetch(`http://127.0.0.1:8000/api/workouts/${id}`, {
      method: 'DELETE'
    })
    workouts.value = workouts.value.filter(vaja => vaja.id != id)
}catch (error) {
    console.error("napaka pri brisanju vaje: ", error)
  }
}

const urejamoId = ref(null)
function napolniObrazec(workout) {
  novaVaja.value = {
    name: workout.name,
    reps: workout.reps,
    calories: workout.calories
  }
  urejamoId.value = workout.id
}
function preklicUrejanja(){
  novaVaja.value = {
    name: '',
    reps: '',
    calories: ''
  }
  urejamoId.value = null
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
