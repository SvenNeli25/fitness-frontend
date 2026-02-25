<template>
  <v-app>
    <v-app-bar color="blue-darken-3" elevation="2" v-if="jePrijavljen">
      <v-toolbar-title>🏋️‍♂️ Gym App</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn color="white" variant="outlined" @click="odjava">Odjava</v-btn>
    </v-app-bar>

    <v-main>
      <v-container>
        <router-view></router-view>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, watchEffect } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const jePrijavljen = ref(false)


watchEffect(() => {
  jePrijavljen.value = !!localStorage.getItem('token')
})

function odjava() {
  localStorage.removeItem('token') 
  jePrijavljen.value = false
  router.push({ name: 'login' }) 
}
</script>