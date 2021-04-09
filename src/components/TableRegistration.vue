<template>
  <div class="registrationTable">
    <h1>{{ tableTitle }} | {{ counter }}</h1>
    <button @click="cstmHndlr">555</button>
    <download-csv
      class="btn btn-primary"
      :data="regs"
      :separatorExcel="true"
      per-page="3"
      name="export.csv">
      <b-icon-download /> Download
    </download-csv>

    <!-- Search by email, egn -->
    <b-container fluid>
      <b-row class="my-1">
        <b-col sm="1">
          <label for="email"><code>Email</code></label>
        </b-col>
        <b-col sm="2">
          <b-form-input v-model="email" id="email" name="email" type="search"></b-form-input>
        </b-col>
      </b-row>
      <b-row class="my-1">
        <b-col sm="1">
          <label for="egn"><code>Egn</code></label>
        </b-col>
        <b-col sm="2">
          <b-form-input v-model="egn" id="egn" name="egn" type="search"></b-form-input>
        </b-col>
      </b-row>
    </b-container>

    <!-- Human readable search -->
    <ul>
      <li>Sort by: <code>{{ sortBy }}</code></li>
      <li>Sort order: <code v-if="sortDesc">Descending </code><code v-else>Ascending </code></li>
      <li>Status: <code v-if="status">{{status}}</code><code v-else>All </code></li>
      <li>Filters:
        <ul>
          <li v-if="email">email: <code>{{ email }}</code></li>
          <li v-if="egn">egn: <code>{{ egn }}</code></li>
        </ul>
      </li>
    </ul>

    <!-- Search button, apply all filters and searches -->
    <b-button variant="success" @click="handleSearch">
        <b-spinner  v-if="!rows" label="Loading..."></b-spinner>
        <span v-else>Apply & Search</span>
    </b-button>

      <!-- <p class="mt-3">Current Page: {{ currentPage }}</p> -->

    <b-row class="my-4">
      <b-col sm="3">
        <!-- Filter by status buttons -->
        <b-button-group vertical>
          <b-button :disabled="status === 'in progress'" @click="handleStatus('in progress')">In progress</b-button>
          <b-button :disabled="status === 'canceled'" @click="handleStatus('canceled')">Canceled</b-button>
          <b-button :disabled="status === ''" @click="handleStatus('all')">All</b-button>
        </b-button-group>
      </b-col>
      <b-col sm="9">
        <!-- Pagination -->
        <b-pagination
          v-model="currentPage"
          :total-rows="rows"
          :per-page="perPage"
          aria-controls="my-table" />
      </b-col>
    </b-row>

      <!--
      @row-selected="onRowSelected"
      selectable
      select-mode="single"
      hover
      -->
    <b-table
      class=""
      :sort-by.sync="sortBy"
      :sort-desc.sync="sortDesc"
      :head-variant="headVariant"
      :items="regs"
      :fields="fields"
      sort-icon-left
    >
    <template v-slot:cell(name)="data">
      <router-link :to="`/regs/${data.item.id}`">{{data.item.name}}</router-link>
    </template>
    <template v-slot:cell(show_details)="row">
      <b-button
        :disabled="row.item.locked == 1"
        size="sm"
        @click="onRowSelected(row)"
        v-b-modal.modal-1
        class="mr-2">
        View
      </b-button>

      <!-- <b-button size="sm" @click="row.toggleDetails" class="mr-2">
        {{ row.detailsShowing ? 'Hide' : 'Show'}} Details
      </b-button> -->

      <!-- As `row.showDetails` is one-way, we call the toggleDetails function on @change -->
      <!-- <b-form-checkbox v-model="row.detailsShowing" @change="row.toggleDetails">
        Details via check
      </b-form-checkbox> -->
    </template>
      <!-- <template v-slot:row-details="row">
        <b-card>
          {{row.item}}
          {{row.item.age}}
          <b-button size="sm" @click="row.toggleDetails">Hide Details</b-button>
        </b-card>
      </template> -->
    </b-table>

    <b-modal v-if="selected.item !== undefined" id="modal-1" :title="selected.item.name">
      <p class="my-4">{{ selected.item.id }} | {{ selected.item.name }} | {{ selected.item.email }}</p>
      <p class="my-4">{{ selected }}</p>
    </b-modal>

  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  name: 'TableRegistration',
  props: {
    tableTitle: String
  },
  data () {
    return {
      status: 'in progress',
      sortBy: 'age',
      sortDesc: false,
      email: '',
      egn: '',
      queryParams: '',
      querySort: '',
      regs: [],
      headVariant: 'dark',
      selectable: true,
      selected: [],
      perPage: 3,
      currentPage: 1,
      fields: [
        { key: 'name', sortable: true },
        { key: 'email', sortable: true },
        { key: 'age', sortable: true },
        { key: 'status', sortable: true },
        { key: 'locked', sortable: true },
        { key: 'created_at', sortable: true },
        { key: 'updated_at', sortable: true },
        { key: 'show_details', sortable: false }
      ]
    }
  },
  methods: {
    search () {
      // Append email to query
      if (this.email) {
        if (this.queryParams !== '') {
          this.queryParams = this.queryParams + '&'
        }
        this.queryParams = this.queryParams + 'email=' + this.email
      }

      // Append egn to query
      if (this.egn) {
        if (this.queryParams !== '') {
          this.queryParams = this.queryParams + '&'
        }
        this.queryParams = this.queryParams + 'egn=' + this.egn
      }

      // Append egn to query
      if (this.status) {
        if (this.queryParams !== '') {
          this.queryParams = this.queryParams + '&'
        }
        this.queryParams = this.queryParams + 'status=' + this.status
      }

      // Handle sort_by and sort_desc
      if (this.sortBy && this.sortDesc !== '') {
        this.querySort = 'sort_by=' + this.sortBy + '&sort_desc=' + this.sortDesc
      }

      // Append sort to query
      if (this.queryParams || this.querySort) {
        this.queryParams = '?' + this.queryParams + '&' + this.querySort
      }

      let apiUrl = 'http://127.0.0.1:8000/api/registrations'
      if (this.queryParams) {
        apiUrl = apiUrl + this.queryParams
      }

      fetch(apiUrl, {
        method: 'get'
      })
        .then((response) => {
          return response.json()
        })
        .then((jsonData) => {
          // this.regs = jsonData
          this.regs = jsonData.data
        })
      this.queryParams = ''
      // this.status = ''
    },
    onRowSelected (items) {
      console.log(this.selected)
      this.selected = items
    },
    handleSearch () {
      this.search()
    },
    handleStatus (value) {
      if (value !== 'all') {
        this.status = value
      } else {
        this.status = ''
      }
    },
    cstmHndlr () {
      this.$store.dispatch('modifyCounter')
    }
  },
  computed: {
    ...mapState(['counter']),
    ...mapActions(['modifyCounter']),
    rows () {
      return this.regs.length
    }
  },
  mounted: function () {
    this.search()
  }
}
</script>

<style scoped>
  .position_fixed {
    position: fixed;
  }
</style>
