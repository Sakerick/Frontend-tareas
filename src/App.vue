<template>
  <v-app>
    <v-app-bar app>
      <v-toolbar-title>My App</v-toolbar-title>
      <v-btn to="/" color="primary">Main</v-btn>
        <v-btn to="/login" color="primary">Login</v-btn>

    </v-app-bar>

    <v-main>
      <router-view/>
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>
  //
</script>
