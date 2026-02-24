
<template>
  <v-app>
    <v-main>
      <v-container>
        <h1 class="mb-5"><v-icon icon="mdi-dumbbell"></v-icon> Dobrodošli v gym app</h1>
        <div class="d-flex justify-space-between align-center mb-5">
          <v-btn v-if="token" color="red" variant="outlined" @click="odjava">Odjava</v-btn>
        </div> 

        <div v-if="!token">
          <v-card class="mx-auto pa-5" max-width="400">
            <h2 class="text-center mb-4">{{  jePrijava ? 'Prijava' : 'Registracija' }}</h2>

            <v-text-field
              v-if="!jePrijava"
              label="Tvoje ime"
              v-model="avtPodatki.name"
            ></v-text-field>
            <v-text-field label="E-mail" v-model="avtPodatki.email" type="email"></v-text-field>
            <v-text-field label="Geslo" v-model="avtPodatki.password" type="password"></v-text-field>

            <v-btn color="primary" block class="mt-2" @click="izvediAvtentikacijo">
              {{ jePrijava ? 'Prijavi me' : 'Ustvari račun' }}
            </v-btn>

            <v-btn variant="text" block class="mt-2" @click="jePrijava = !jePrijava">
              {{ jePrijava ? 'Nimam računa, želim se registrirati' : 'Želim se prijaviti' }}
            </v-btn>
          </v-card>
        </div>

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

const token = ref(localStorage.getItem('token') || '')

const jePrijava = ref(true)

const avtPodatki = ref({
  name: '',
  email: '',
  password: ''
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
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Bearer ' +  token.value
          
        },
        body: JSON.stringify(podatki)
      })

      if(!response.ok) throw new Error('Napaka pri posodabljanju vaje')

      const posodobljenaVaja = await response.json()
      const index = workouts.value.findIndex(vaja => vaja.id === urejamoId.value)
      if (index !== -1) {
        workouts.value[index] = posodobljenaVaja
      }
    } else {
      response = await fetch('http://127.0.0.1:8000/api/workouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Bearer ' +  token.value
          
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
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer ' +  token.value,
      }
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

async function pridobiVaje(){

  if(!token.value) return;

  try{
    const response = await fetch('http://127.0.0.1:8000/api/workouts', {
      headers: {
        'Authorization': 'Bearer ' +  token.value,
        'Accept': 'application/json'
      }
    })
    const data = await response.json()
    workouts.value = data
    console.log("pridobljene vaje: ", data)
  }catch (error) {
    console.error("napaka pri pridobivanju vaj: ", error)
  }
   
  
}


async function izvediAvtentikacijo() 
{
  const url = jePrijava.value
    ? 'http://127.0.0.1:8000/api/login'
    : 'http://127.0.0.1:8000/api/register'

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(avtPodatki.value)
    })

    const data = await response.json()

    if(!response.ok) {
      alert(data.message || 'Napaka pri avtentikaciji')
      return
    }

    localStorage.setItem('token', data.token)
    token.value = data.token
    pridobiVaje()
    avtPodatki.value = {
      name: '',
      email: '',
      password: ''
    }
  } catch (error) {
    console.error("Napaka pri avtentikaciji: ", error)
  }
}

async function odjava() {
  try {
    await fetch('http://127.0.0.1:8000/api/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'Content-Type': 'application/json'
      }
    })
  } catch (error) {
    console.error("Napaka pri odjavi: ", error)
  } 

  localStorage.removeItem('token')
  token.value = ''
  workouts.value = []
}
onMounted(() => {
  pridobiVaje()
})
</script>
