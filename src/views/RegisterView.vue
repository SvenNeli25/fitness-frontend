<template>
  <v-container class="d-flex justify-center mt-10">
    <v-card width="400" elevation="4">
      <v-card-title class="text-center text-h5 mt-4">Registracija 📝</v-card-title>
      
      <v-card-text>
        <v-form @submit.prevent="izvediRegistracijo">
          
          <v-text-field
            v-model="ime"
            label="Ime"
            variant="outlined"
            required
            class="mt-4"
          ></v-text-field>

          <v-text-field
            v-model="email"
            label="E-pošta"
            type="email"
            variant="outlined"
            required
            class="mt-2"
          ></v-text-field>
          
          <v-text-field
            v-model="geslo"
            label="Geslo"
            type="password"
            variant="outlined"
            required
            class="mt-2"
          ></v-text-field>

          <v-text-field
            v-model="potrdiGeslo"
            label="Potrdi geslo"
            type="password"
            variant="outlined"
            required
            class="mt-2"
          ></v-text-field>
          
          <v-btn type="submit" color="blue-darken-3" block size="large" class="mt-4">
            Ustvari račun
          </v-btn>
        </v-form>
      </v-card-text>

      <v-card-actions class="justify-center mb-4 text-body-2">
        <span>Že imaš račun? <router-link to="/login" class="text-blue-darken-3 font-weight-bold">Prijavi se</router-link></span>
      </v-card-actions>
      
    </v-card>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const ime = ref('')
const email = ref('')
const geslo = ref('')
const potrdiGeslo = ref('')
const router = useRouter()

async function izvediRegistracijo() {
  if (!ime.value || !email.value || !geslo.value) {
    alert("Prosim izpolni vsa polja!")
    return
  }

  
  if (geslo.value !== potrdiGeslo.value) {
    alert("Gesli se ne ujemata!")
    return
  }

  try {
    const response = await fetch('http://127.0.0.1:8000/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        name: ime.value,
        email: email.value,
        password: geslo.value,
        password_confirmation: potrdiGeslo.value 
      })
    })

    const data = await response.json()

    if (response.ok) {
      // 1. Shranim žeton
      localStorage.setItem('token', data.token)
      
      // 2. Preusmerim naravnost na aplikacijo!
      router.push({ name: 'dashboard' })
    } else {
      alert("Napaka pri registraciji: " + (data.message || "Neveljavni podatki"))
    }
  } catch (error) {
    console.error("Napaka:", error)
    alert("Povezava s strežnikom ni uspela.")
  }
}
</script>