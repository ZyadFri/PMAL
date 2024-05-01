<template>
  <div class="edit-job">
    <h2>Modifier l'offre d'emploi</h2>
    <form @submit.prevent="saveJob">
      <label for="editJobTitle">Titre du poste</label>
      <input type="text" id="editJobTitle" v-model="editedJob.title" required>

      <label for="editJobDescription">Description du poste</label>
      <textarea id="editJobDescription" v-model="editedJob.description" required></textarea>

      <button type="submit">Enregistrer</button>
    </form>
  </div>
</template>

<script>
export default {
  name: 'EditJob',
  props: {
    job: Object, 
  },
  data() {
    return {
      editedJob: { ...this.job }, 
    };
  },
  methods: {
    saveJob() {
      this.$emit('jobSaved', this.editedJob);
      console.log('Job saved:', this.editedJob);
    },
  },
};
</script>

<style>
.edit-job form {
  display: grid;
  gap: 10px;
}

.edit-job input,
.edit-job textarea,
.edit-job button {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
}

.edit-job button {
  background-color: #007bff;
  color: #fff;
  border: none;
  cursor: pointer;
}
</style>
