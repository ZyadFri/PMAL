<template>
    <div class="add-job">
      <h2>Ajouter une offre d'emploi</h2>
      <form @submit.prevent="submitForm">
        <!-- Formulaire pour ajouter une offre d'emploi -->
        <label for="jobTitle">Titre du poste</label>
        <input type="text" id="jobTitle" v-model="jobTitle" required>
  
        <label for="jobDescription">Description du poste</label>
        <textarea id="jobDescription" v-model="jobDescription" required></textarea>
  
        <button type="submit">Ajouter</button>
      </form>
    </div>
  </template>
  
  <script>
  export default {
    name: 'AddJob',
    data() {
      return {
        jobTitle: '',
        jobDescription: '',
      };
    },
    methods: {
      submitForm() {
        // Logique pour envoyer le formulaire
        console.log('Formulaire soumis');
      },
    },
  };
  </script>
  
  <style scoped>
  /* Styles spécifiques à AddJob.vue */
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
  