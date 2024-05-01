<template>
  <div class="home">
    <h1>Liste des offres d'emploi</h1>
    <div v-if="jobs.length > 0">
      <ul>
        <li v-for="job in jobs" :key="job.id">
          <h2>{{ job.title }}</h2>
          <p>{{ job.description }}</p>
          <button @click="viewJobDetails(job.id)">Voir les détails</button>
        </li>
      </ul>
    </div>
    <div v-else>
      <p>Aucune offre d'emploi disponible pour le moment.</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home',
  data() {
    return {
      jobs: [
        {
          id: 1,
          title: "Faire les courses",
          description: "Acheter des légumes et du lait.",
          completed: false
        },
        {
          id: 2,
          title: "Faire du sport",
          description: "Courir pendant 30 minutes.",
          completed: true
        },
        {
          id: 3,
          title: "Réviser pour l'examen",
          description: "Relire le chapitre 5 du manuel.",
          completed: false
        }
      ]
    };
  },
  methods: {
    viewJobDetails(jobId) {
      this.$router.push(`/job/${jobId}`);
    },
  },
};
</script>

<style scoped>
.home {
  padding: 20px;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  margin-bottom: 20px;
}

button {
  background-color: #007bff;
  color: #fff;
  border: none;
  padding: 8px 12px;
  cursor: pointer;
}
</style>
