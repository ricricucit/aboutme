<template lang="html">
  <div id="vue-portfolio" class="app">
    <header class="header-main wrap wrap--contained">
      <div class="row">
        <div class="col
                    col--12-12@md
                    col--8-12@lg
                    col--offset-4-12@lg
                    col--6-12@xl
                    col--offset-6-12@xl
                    col--7-12@xxl
                    col--offset-5-12@xxl">
          <h1>Enrico Icardi</h1>
          <h6 class="main">Product Development + Management</h6>
        </div>
      </div>
    </header>

    <router-view></router-view>

    <footer class="footer-main wrap wrap--contained">
      <div class="row">
        <div class="col
                    col--12-12@xs
                    col--11-12@lg
                    col--12-12@xl
                    col--10-12@xxl">
          <h6 class="main">Enrico Icardi</h6>
          <h6><em>September 10, 2017</em></h6>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>

export default {
  name: 'vue-portfolio',
  components: {},
  mounted() {
    console.info( "\n\n\nCreated with VueJS by %chttp://welance.com/%c – a Freelancers Collective.\n\n\n%c🤓\n%c\nIf you like Front-End and you're looking for gigs and colleagues\nYou should %cmeet Enrico and join our Collective!\n\n\n%cJoin here: %chttps://welance.com\n\n\n\n", "color: #FDB68E;", "color: auto", "font-size: 5em", "font-size: 1.5em", "font-size: 1.5em;color: #FDB68E;", "font-size: 1em;color: auto;", "color: #FDB68E;");
  }
};
</script>

<style lang="scss">
@import "~localstyles/main-no-prints.scss";

.app{
  &--no-overflow{
    overflow: hidden;
  }
}

</style>
