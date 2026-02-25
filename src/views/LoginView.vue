<template>
  <v-container class="d-flex justify-center mt-10">
    <v-card width="400" elevation="4">
      <v-card-title class="text-center text-h5 mt-4">Prijava 🔐</v-card-title>
      
      <v-card-text>
        <v-form @submit.prevent="izvediPrijavo">
          <v-text-field
            v-model="email"
            label="E-pošta"
            type="email"
            variant="outlined"
            required
            class="mt-4"
          ></v-text-field>
          
          <v-text-field
            v-model="geslo"
            label="Geslo"
            type="password"
            variant="outlined"
            required
            class="mt-2"
          ></v-text-field>
          
          <v-btn type="submit" color="blue-darken-3" block size="large" class="mt-4">
            Prijavi me
          </v-btn>
        </v-form>
      </v-card-text>

      <v-card-actions class="justify-center mb-4 text-body-2">
        <span>Nimaš računa? <router-link to="/register" class="text-blue-darken-3 font-weight-bold">Registriraj se</router-link></span>
      </v-card-actions>
      
    </v-card>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const email = ref('')
const geslo = ref('')
const router = useRouter() // Možgani za preusmerjanje

async function izvediPrijavo() {
  if (!email.value || !geslo.value) {
    alert("Prosim izpolni vsa polja!")
    return
  }

  try {
    const response = await fetch('http://127.0.0.1:8000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        email: email.value,
        password: geslo.value
      })
    })

    const data = await response.json()

    if (response.ok) {
      // 1. Shranim žeton v sef (localStorage)
      localStorage.setItem('token', data.token)
      
      // 2. Preusmerim uporabnika na glavno stran! 
      router.push({ name: 'dashboard' })
    } else {
      alert("Napaka pri prijavi: " + (data.message || "Napačni podatki"))
    }
  } catch (error) {
    console.error("Napaka:", error)
    alert("Povezava s strežnikom ni uspela.")
  }
}
</script>