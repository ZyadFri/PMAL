<template>
    <div class="edit-job">
      <h2>Modifier une offre d'emploi</h2>
      <form @submit.prevent="submitForm">
        <!-- Formulaire pour modifier une offre d'emploi -->
        <label for="editJobTitle">Titre du poste</label>
        <input type="text" id="editJobTitle" v-model="jobTitle" required>
  
        <label for="editJobDescription">Description du poste</label>
        <textarea id="editJobDescription" v-model="jobDescription" required></textarea>
  
        <button type="submit">Modifier</button>
      </form>
    </div>
  </template>
  
  <script>
  export default {
    name: 'EditJob',
    data() {
      return {
        jobTitle: '',
        jobDescription: '',
      };
    },
    methods: {
      submitForm() {
        // Logique pour envoyer le formulaire de modification
        console.log('Formulaire de modification soumis');
      },
    },
  };
  </script>
  
  <style scoped>
  /* Styles spécifiques à EditJob.vue */
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
    background-color: #ffc107;
    color: #000;
    border: none;
    cursor: pointer;
  }
  </style>
  