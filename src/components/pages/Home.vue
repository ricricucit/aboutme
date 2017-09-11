<template lang="html">
  <div class="home wrap wrap--contained">
    <div class="row">
      <div class="col info--history
                  col--7-12@lg
                  col--offset-4-12@lg
                  col--5-12@xl
                  col--offset-0-12@xl
                  col--4-12@xxl">
        <h6>What I do</h6>
        <p>
          My job is about helping businesses to build or improve their products (from scratch, simple ideas or existing projects)
          working at the intersection of people, technology, design and new medias.
        </p>
        <p>
          I've started with Web Development in 2006 in Torino, Italy.
        </p>
        <p>
          Over the past {{yearsOfActivity}} years I've been working (mostly as a consultant) with perfectionist –Type B– designers,
          complicated –Type A– developers, and spent a countless amount of hours writing e-mails and attending meetings with small-to-big companies,
          mainly in Europe, USA and Canada.
        </p>
        <p>
          I enjoy teamwork, i am capable of handling <em>stressful tasks</em> and i'm usually very intrigued by any new venture that i get to know
          or work at. I also occasionally give advices to early stage startups struggling to bootstrap.
        </p>
        <p>
          <a class="highlight highlight--skewed" href='http://sharedesk.net' rel="noopener" target="_blank"><span>My first venture</span></a> was co-founded in 2009
          with a team of friends and became <a class="highlight" href= 'http://www.forbes.com/sites/ericaswallow/2012/10/17/sharedesk-coworking/'><span>internationally recognized</span></a>
          in 2012 as the <em>Airbnb for flexible Workplaces</em>. Some time later it also <a class="highlight highlight--skewed" href= 'http://www.techvibes.com/blog/sharedesk-raises-11-million-seed-round-2014-02-19'  rel="noopener" target="_blank"><span>got successfully funded</span></a>, and its seed round ($ 1.1M) was led by Tim Draper.
          Today it's one of the main players in the Office Space and Coworking Business, also offering a <a href='http://www.optixapp.net/' class="highlight highlight--reskewed" rel="noopener" target="_blank"><span>solution for Smart Office Management</span></a>.
        </p>
        <p>
          <a class="highlight highlight--reskewed" href='http://stood.it' rel="noopener" target="_blank"><span>My second venture</span></a>, born in early 2015 (B2C+B2B),
          is now developing a <a href='https://www.facebook.com/stood.laptop.stand/videos/1922917721268336/' rel="noopener" target="_blank"><span>new product</span></a>.
          Our early B2B customers includes Tech Companies and Events. (eg. <a href='https://www.crunchbase.com/organization/exoclick#/entity' rel="noopener" target="_blank">exoclick</a> and <a href='https://www.crunchbase.com/organization/breather#/entity' rel="noopener" target="_blank">breather.com</a>)
        </p>
        <p>
          I'm currently working in Berlin, helping <a href='http://welance.com' class="highlight highlight--skewed" rel="noopener" target="_blank"><span>welance</span></a> redefine the freelancers collective.
          With them I've also co-founded my first <a class="highlight highlight--reskewed" href='http://digitalnomadsurvey.com' rel="noopener" target="_blank"><span>research project</span></a> about <strike>location</strike> independent workers trend, now moving towards its 2nd edition with <a href="http://flylancer.com/" target="_blank" rel="noopener">one of our partners</a>.
        </p>
        <h6 class="spaced">Work History</h6>
        <a href="https://hackmd.io/s/S1N_RhwSW" target="_blank" rel="noopener">CV</a>
        <h6 class="spaced">Get in touch</h6>
        <p>
          <a href="https://twitter.com/ricricucit" target="_blank" rel="noopener">Twitter</a> –
          <a href="https://linkedin.com/in/enricoicardi/" target="_blank" rel="noopener">LinkedIn</a> –
          <a href="https://github.com/ricricucit" target="_blank" rel="noopener">GitHub</a> –
          <a href="mailto:enrico@welance.com" target="_blank" rel="noopener">eMail</a>
        </p>
      </div>
      <div class="col
                  col--7-12@lg
                  col--offset-1-12@lg
                  col--6-12@xl
                  col--offset-1-12@xl
                  col--5-12@xxl
                  col--offset-1-12@xxl
                  info--latest">
        <h6>Latest Status Update</h6>
        <p class="big">
          Currently based in Berlin<br/>I'm working as an independent tech-consultant, helping <a href='http://welance.com' class="highlight highlight--skewed" rel="noopener" target="_blank"><span>welance</span></a> redefine itself as a freelancers collective.
        </p>
        <p>
          <a href="https://tillairplant.com/" target="_blank" rel="noopener">A<sup>↗</sup></a>
          <a href="https://hnf-heisenberg.com/" target="_blank" rel="noopener">few<sup>↗</sup></a>
          <a href="https://zms.zalando.com/" target="_blank" rel="noopener">clients<sup>↗</sup></a>
          <a href="https://www.kpm-berlin.com/" target="_blank" rel="noopener">think<sup>↗</sup></a>
          <a href="http://www.highsnobiety.com/" target="_blank" rel="noopener">we're good<sup>↗</sup></a>
          <a href="https://stood.it/" target="_blank" rel="noopener">at<sup>↗</sup></a>
          <a href="https://sharedesk.net/" target="_blank" rel="noopener">what we do<sup>↗</sup></a>.
        </p>

      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'home',
  watch: {
    '$route' (to, from) {
      console.log('route changed');
    }
  },
  computed:{
    yearsOfActivity: () => {
      return new Date().getFullYear() - 2006;
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
@import "~localstyles/main-no-prints.scss";

.info{
  &--history{
    @include mq($from: xl){
      order: 1;
    }
    @include mq($until: xl){
      order: 2;
      @include mt(4);
    }
  }
  &--latest{
    @include mq($from: xxl){
      order: 2;
      @include mt(39);
    }
    @include mq($from: xl){
      order: 2;
      margin-top: 13.25rem;
    }
    @include mq($until: xl){
      order: 1;
      margin-top: 0;
    }
  }
}

</style>
