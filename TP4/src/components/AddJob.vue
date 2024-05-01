<template>
  <div class="add-job">
    <h2>Ajouter une offre d'emploi</h2>
    <form @submit.prevent="addJob">
      <label for="jobTitle">Titre du poste</label>
      <input type="text" id="jobTitle" v-model="job.title" required>

      <label for="jobDescription">Description du poste</label>
      <textarea id="jobDescription" v-model="job.description" required></textarea>

      <button type="submit">Ajouter</button>
    </form>
  </div>
</template>

<script>
export default {
  name: 'AddJob',
  data() {
    return {
      job: { title: '', description: '' },
    };
  },
  methods: {
    addJob() {
      this.$emit('jobAdded', { ...this.job });
      console.log('Job added:', this.job);
      this.job.title = '';
      this.job.description = '';
    },
  },
};
</script>

<style>
.add-job form {
  display: grid;
  gap: 10px;
}

.add-job input,
.add-job textarea,
.add-job button {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
}

.add-job button {
  background-color: #007bff;
  color: #fff;
  border: none;
  cursor: pointer;
}
</style>
