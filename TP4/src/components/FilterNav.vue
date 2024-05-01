<template>
  <div class="filter-nav">
    <h2>Filtrer les offres d'emploi</h2>
    <form @submit.prevent="applyFilters">
      <label for="filterKeyword">Mot-clé</label>
      <input type="text" id="filterKeyword" v-model="filters.keyword">

      <label for="filterLocation">Lieu</label>
      <input type="text" id="filterLocation" v-model="filters.location">

      <label for="filterSalary">Salaire</label>
      <input type="text" id="filterSalary" v-model.number="filters.salary" pattern="[0-9]+">

      <label for="filterJobType">Type d'emploi</label>
      <select id="filterJobType" v-model="filters.jobType">
        <option value="">Tous</option>
        <option value="CDI">CDI</option>
        <option value="CDD">CDD</option>
        <option value="Stage">Stage</option>
      </select>

      <button type="submit">Appliquer</button>
    </form>
  </div>
</template>

<script>
export default {
  name: 'FilterNav',
  data() {
    return {
      filters: {
        keyword: '',
        location: '',
        salary: null,
        jobType: '',
      },
    };
  },
  methods: {
    applyFilters() {
      const filteredJobs = this.filterJobs(this.filters);
      this.$emit('filtersApplied', filteredJobs);
      console.log('Filters applied:', this.filters);
    },
    filterJobs(filters) {
      const jobs = [
        { id: 1, title: 'Développeur Web', description: 'Description du poste de développeur web.', location: 'Paris', salary: 50000, jobType: 'CDI' },
        { id: 2, title: 'Ingénieur en logiciel', description: 'Description du poste d\'ingénieur en logiciel.', location: 'Lyon', salary: 60000, jobType: 'CDD' },
        { id: 3, title: 'Spécialiste en marketing', description: 'Description du poste de spécialiste en marketing.', location: 'Marseille', salary: 55000, jobType: 'Stage' },
   
      ];

  
      const filteredJobs = jobs.filter(job => {
        let matchKeyword = true;
        let matchLocation = true;
        let matchSalary = true;
        let matchJobType = true;

        if (filters.keyword) {
          matchKeyword = job.title.toLowerCase().includes(filters.keyword.toLowerCase());
        }
        if (filters.location) {
          matchLocation = job.location.toLowerCase().includes(filters.location.toLowerCase());
        }
        if (filters.salary) {
          matchSalary = job.salary >= filters.salary;
        }
        if (filters.jobType) {
          matchJobType = job.jobType === filters.jobType;
        }

        return matchKeyword && matchLocation && matchSalary && matchJobType;
      });

      return filteredJobs;
    },
  },
};
</script>

<style>
.filter-nav form {
  display: grid;
  gap: 10px;
}

.filter-nav input,
.filter-nav select,
.filter-nav button {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
}

.filter-nav button {
  background-color: #007bff;
  color : #fff;
  border: none;
  cursor: pointer;
}
</style>
