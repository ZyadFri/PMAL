<template>
  <div class="job-detail">
    <h2>Détails de l'offre d'emploi</h2>
    <div v-if="job">
      <h3>{{ job.title }}</h3>
      <p>{{ job.description }}</p>
      <p>Location: {{ job.location }}</p>
      <p>Salary: {{ job.salary }}</p>
      <p>Job Type: {{ job.jobType }}</p>
    </div>
    <div v-else>
      <p>Aucun détail disponible pour cette offre d'emploi.</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'JobDetail',
  props: {
    job: {
      type: Object,
      required: true,
    },
  },
};
</script>

<style scoped>
.job-detail {
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
  margin-bottom: 20px;
}
</style>
