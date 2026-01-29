<script setup></script>

<template>
  <v-app>
    <v-main>
      <v-container>
        <h1 class="mb-5"><v-icon icon="mdi-dumbbell"></v-icon> Dobrodošli v gym app</h1>

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
              <v-list-item-title>...</v-list-item-title>
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
