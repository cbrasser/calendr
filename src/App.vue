<template>
  <div id="app">
    <main>
      <router-view />
    </main>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {};
  },
  mounted() {},
  created() {},
};
</script>

<style>
@import url('https://fonts.googleapis.com/css?family=Dosis:400,700');

:root {
  --bg-dark: #2e3440;
  --fg-light: #eceff4;
  --bg-light: #eceff4;
  --orange: #d08770;
  --green: #a3be8c;
  --yellow: #ebcb8b;
  --purple: #b48ead;
  --teal: #8fbcbb;
  --light-blue: #81a1c1;
  --dark-blue: #5e81ac;
  --calendar-color: #29323f;
  --bright-yellow: #fcee6d;
}
html,
body {
  margin: 0;
}

#app {
  font-family: 'Dosis', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

.button {
}
.button.raised {
}

.material-icons {
  font-family: 'Material Icons';
  font-weight: normal;
  font-style: normal;
  font-size: 24px; /* Preferred icon size */
  display: inline-block;
  line-height: 1;
  text-transform: none;
  letter-spacing: normal;
  word-wrap: normal;
  white-space: nowrap;
  direction: ltr;

  /* Support for all WebKit browsers. */
  -webkit-font-smoothing: antialiased;
  /* Support for Safari and Chrome. */
  text-rendering: optimizeLegibility;

  /* Support for Firefox. */
  -moz-osx-font-smoothing: grayscale;

  /* Support for IE. */
  font-feature-settings: 'liga';
}
</style>
