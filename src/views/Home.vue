<template>
  <v-touch
    class="content"
    v-on:pinchin="changeScope(-1)"
    v-on:pinchout="changeScope(1)"
  >
    <!-- <div class="login-box" v-if="!loggedIn">
      <div class="login-content">
        <h3>Hello, Friend!</h3>
        <p>Log in with google to get started!</p>
        <button class="button button-raised" @click="loginWithGoogle">
          Log in with Google
        </button>
      </div>
    </div> -->
    <div class="main">
      <MonthView
        v-if="scope == 2"
        v-bind:selectedDate="selectedDate"
        v-bind:events="events"
        v-bind:viewPort="viewPort"
        v-on:selectMonth="selectMonth"
        v-on:selectYear="selectYear"
        v-on:selectDate="selectDate"
        v-on:selectCurrentDay="selectCurrentDay"
        v-on:createEvent="createEvent"
        v-on:deleteEvent="deleteEvent"
        v-on:pinchIn="changeScope(1)"
        v-on:pinchOut="changeScope(-1)"
      />
      <DayView
        v-if="scope == 1"
        v-bind:selectedDate="selectedDate"
        v-bind:events="events"
        v-bind:viewPort="viewPort"
        v-on:pinchOut="changeScope(-1)"
        v-on:selectDay="selectDay"
        v-on:createEvent="createEvent"
        v-on:deleteEvent="deleteEvent"
      />
    </div>
  </v-touch>
</template>

<script>
import firebase from 'firebase';
import VueTouch from 'vue-touch';
import Vue from 'vue';

import MonthView from './../components/MonthView';
import DayView from './../components/DayView';

Vue.use(VueTouch);

export default {
  name: 'Home',
  data() {
    return {
      loggedIn: false,
      user: undefined,
      selectedDate: new Date(),
      events: [],
      viewPort: 'mobile',
      scope: 2,
    };
  },
  components: {
    MonthView,
    DayView,
  },
  computed: {
    currentMonth() {
      return new Date().getMonth();
    },
    currentDayOfWeek() {
      return new Date().getDay();
    },
    currentDay() {
      return new Date().getDate();
    },
    currentYear() {
      return new Date().getFullYear();
    },
    selectedMonth() {
      return this.selectedDate.getMonth();
    },
    selectedDayOfWeek() {
      return this.selectedDate.getDay();
    },
    selectedDay() {
      return this.selectedDate.getDate();
    },
    selectedYear() {
      return this.selectedDate.getFullYear();
    },
    daysInSelectedMonth() {
      return new Date(this.selectedYear, this.selectedMonth + 1, 0).getDate();
    },
    firstDayInSelectedMonth() {
      const weekday = new Date(
        this.selectedYear,
        this.selectedMonth,
        1,
      ).getDay();
      // convert from week starting at sun to starting at mon
      return weekday === 0 ? 6 : weekday - 1;
    },
    lastDayInSelectedMonth() {
      const weekday = new Date(
        this.selectedYear,
        this.selectedMonth + 1,
        0,
      ).getDay();
      return weekday === 0 ? 6 : weekday - 1;
    },
  },
  methods: {
    changeScope(modifier) {
      this.scope = Math.max(1, Math.min(this.scope + modifier, 2));
    },
    createEvent(event) {
      const request = gapi.client.calendar.events.insert({
        calendarId: 'primary',
        resource: event,
      });
      request.execute(() => {
        console.log('created');
        this.getCalendar();
      });
    },
    deleteEvent(id) {
      const request = gapi.client.calendar.events.delete({
        calendarId: 'primary',
        eventId: id,
      });
      request.execute(() => {
        console.log('deleted');
        this.events = this.events.filter((e) => e.id !== id);
        this.getCalendar();
      });
    },
    selectDay(modifier) {
      this.selectedDate = new Date(
        this.selectedYear,
        this.selectedMonth,
        this.selectedDay + modifier,
      );
    },
    selectMonth(modifier) {
      this.selectedDate = new Date(
        this.selectedYear,
        this.selectedMonth + modifier,
        1,
      );
      this.creationPopupOpen = false;
    },
    selectYear(modifier) {
      this.selectedDate = new Date(
        this.selectedYear + modifier,
        this.selectedMonth,
        this.selectedDay,
      );
      this.creationPopupOpen = false;
    },
    selectCurrentDay() {
      this.selectedDate = new Date(
        this.currentYear,
        this.currentMonth,
        this.currentDay,
      );
    },
    selectDate({ day, month, year }) {
      this.selectedDate = new Date(year, month, day);
      this.creationPopupOpen = false;
    },

    async loginWithGoogle() {
      const googleUser = await gapi.auth2.getAuthInstance().signIn();
      console.log(googleUser);
      // const token = googleUser.getAuthResponse().id_token;
      // const credential = firebase.auth.GoogleAuthProvider.credential(token);
      // const result = await firebase
      //  .auth()
      //  .signInAndRetrieveDataWithCredential(credential);
      // console.log(result);
      this.getCalendar();
      this.$router.push({ name: 'Home', params: {} });
    },
    async logout() {
      // firebase.auth().signOut();
      gapi.auth2.getAuthInstance().signOut();
    },
    async getCalendar() {
      const response = await gapi.client.calendar.events.list({
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        showDeleted: false,
        singleEvents: true,
        maxResults: 100,
      });
      const events = response.result.items;
      events.forEach((event) => {
        const { start, summary, reminders, id } = event;
        let date;
        if (start.dateTime) {
          date = new Date(start.dateTime);
        } else {
          date = new Date(
            start.date.split('-')[0],
            start.date.split('-')[1],
            start.date.split('-')[2],
          );
        }
        if (!this.events.find((e) => e.id === id)) {
          this.events.push({
            date,
            summary,
            reminders,
            id,
          });
        }
      });
    },
    async isLoggedIn() {
      return firebase.auth().currentUser;
    },
    async updateSigninStatus(isSignedIn) {
      if (isSignedIn) {
        this.getCalendar();
      } else {
        const googleUser = await gapi.auth2.getAuthInstance().signIn();
        console.log(googleUser);
        this.getCalendar();
      }
    },
    handleWindowResize() {
      if (window.innerWidth <= 500) {
        this.viewPort = 'mobile';
      } else {
        this.viewPort = 'desktop';
      }
    },
    async handleGapiLoad() {
      gapi.load('client:auth2', () => {
        gapi.client.init({
          apiKey: 'AIzaSyARNlsH7UxK4hulY1fRRlKqG9cwvCUYlmI',
          clientId:
            '268265568262-vjn7rpaapd7i3dko7vhg4go1gkvuj1rk.apps.googleusercontent.com',
          discoveryDocs: [
            'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest',
          ],
          scope: 'https://www.googleapis.com/auth/calendar',
        });

        gapi.client.load('calendar', 'v3', async () => {
          gapi.auth2
            .getAuthInstance()
            .isSignedIn.listen(this.updateSigninStatus);
          this.updateSigninStatus();
        });
      });
    },
  },
  async mounted() {
    Vue.loadScript('https://apis.google.com/js/api.js')
      .then(async () => {
        this.handleGapiLoad();
      })
      .catch(() => {
        console.log('error');
      });

    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.loggedIn = true;
        const { displayName, email, photoUrl } = user;
        this.user = {
          name: displayName,
          mail: email,
          photoUrl,
        };
      } else {
        this.loggedIn = false;
        this.user = undefined;
      }
    });
    const user = await this.isLoggedIn();
    if (user) {
      this.loggedIn = true;
      const { displayName, email, photoUrl } = user;
      this.user = {
        name: displayName,
        mail: email,
        photoUrl,
      };
    }
  },
  created() {
    window.addEventListener('resize', this.handleWindowResize);
  },
  destroyed() {
    window.removeEventListener('resize', this.handleWindowResize);
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
.current-date span {
  text-align: center;
  color: var(--bright-yellow);
  margin: 0 0 30px 0;
  font-weight: bold;
  font-size: 1.3rem;
}

.calendar-wrapper {
  position: relative;
}
.calendar-main {
  background: var(--calendar-color);
  z-index: 99;
  max-width: 700px;
  position: relative;
  width: 290px;
  padding: 45px;
  box-shadow: 5px 10px 20px rgba(0, 0, 0, 0.6);
  border-radius: 5px;
}
.calendar-events,
.calendar-create {
  position: absolute;
  z-index: 1;
  bottom: 0;
  left: 0;
  width: calc(380px - 90px);
  background: var(--calendar-color);
  padding: 45px;
  transform: translateY(0);
  transition: transform 0.3s ease-in-out;
  box-shadow: 5px 10px 20px rgba(0, 0, 0, 0.6);
  border-radius: 5px;
}

.calendar-events.open,
.calendar-create.open {
  transform: translateY(105%);
}
.calendar-header {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
}
.calendar-header .past-month,
.calendar-header .next-month {
  color: var(--orange);
  cursor: pointer;
}
.current-date {
  position: relative;
}
.current-date i {
  font-size: 0.7rem;
  position: absolute;
  left: 50%;
}
.current-date .prev {
  top: -60%;
}
.current-date .next {
  bottom: -60%;
}
.current-date i,
.current-date span {
  display: block;
  margin: auto;
  width: max-content;
}
.calendar-day-names {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  margin-bottom: 1rem;
}
.day-name {
  display: inline-block;
  width: 25px;
  margin: 8px;
  text-align: center;
  color: #999;
}
.calendar-days {
  position: relative;
  display: -webkit-box;
  display: flex;
  -webkit-box-orient: horizontal;
  -webkit-box-direction: normal;
  flex-direction: row;
  flex-wrap: wrap;
  -webkit-box-align: start;
  align-items: flex-start;
  align-content: flex-start;
}
.day {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}
.day-label {
  cursor: pointer;

  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 0.8rem;
  transition: color 0.4s ease-in-out;
}
.day.prev-month .day-label,
.day.next-month .day-label {
  opacity: 0.5;
}

.day-label.selected {
  border-radius: 50%;
  color: var(--green) !important;
}
.day-label.current {
  border-radius: 50%;
  color: var(--purple) !important;
}

.day-label {
  color: var(--red);
}
.content {
  height: 100vh;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  background-image: url('./../assets/bg_login.jpg');
  background-position: center;
  background-size: cover;
}
.login-box {
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--bg-dark);
  min-width: 300px;
  min-height: 500px;
}
.login-content {
  color: var(--fg-light);
}
.login-content button {
  border: 2px solid var(--fg-light);
  background-color: var(--bg-dark);
  color: var(--fg-light);
  padding: 0.7rem;
  margin-top: 1rem;
  border-radius: 25px;
  cursor: pointer;
}
.event-wrapper {
  display: flex;
  justify-content: space-between;
}
.event-wrapper i {
  color: var(--fg-light);
  cursor: pointer;
}
.event-title {
  color: var(--yellow);
}
.event-button i {
  color: var(--fg-light);
}
.calendar-create .title {
  color: var(--fg-light);
}

@media only screen and (max-width: 375px) {
  .main {
    width: 90%;
  }
  .calendar-main {
    padding: 1rem;
  }
  .day-label input[type='text']:focus {
    left: -1rem !important;
    width: 242px !important;
  }

  .calendar-events {
    padding: 1rem;
  }
  .calendar-event-add input {
    width: 242px !important;
  }
}

.day-label input {
  border: 0;
  opacity: 0;
  position: absolute;
  margin-top: 40px;
  left: -45px;
  width: 380px;
  height: 1px;
  padding: 0;
  outline: none;
  font-size: 16px;
  -webkit-transition: height 0.2s linear, opacity 0.2s linear,
    color 0.02s linear;
  transition: height 0.2s linear, opacity 0.2s linear, color 0.02s linear;
  color: #fff;
}
.day-label input:focus {
  opacity: 1;
  height: 35px;
  padding: 10px 40px;
  left: -45px;
  width: 300px;
  color: #29323f;
}
.day-label span {
  display: inline-block;
  width: 25px;
  height: 25px;
  line-height: 25px;
  margin: -2px 0 0 -2px;
  border-radius: 50%;
  border: 2px solid #29323f;
  text-align: center;
  -webkit-transition: all 0.2s linear;
  transition: all 0.2s linear;
  cursor: pointer;
  color: var(--fg-light);
}
.day-label {
  display: inline-block;
  width: 25px;
  margin: 8px;
}
.day-label span:hover {
  border-color: var(--yellow);
}
.day-label.selected span {
  border-color: var(--green);
}
.day-label.current span {
  border-color: var(--purple);
}
.day-label em {
  display: inline-block;
  position: absolute;
  border-radius: 50%;
  border-color: #29323f;
  width: 3px;
  height: 3px;
  background-color: #685e02;
  margin-left: 11px;
  margin-top: 2px;
  opacity: 0;
  -webkit-transition: all 0.2s linear;
  transition: all 0.2s linear;
}
.day-label input[type='text'] {
  border: 0;
  opacity: 0;
  position: absolute;
  margin-top: 40px;
  left: -45px;
  width: 380px;
  height: 1px;
  padding: 0;
  outline: none;
  font-size: 16px;
  -webkit-transition: height 0.2s linear, opacity 0.2s linear,
    color 0.02s linear;
  transition: height 0.2s linear, opacity 0.2s linear, color 0.02s linear;
  color: #fff;
}
.day-label input[type='text']:focus {
  opacity: 1;
  height: 35px;
  padding: 10px 40px;
  left: -45px;
  width: 300px;
  color: #29323f;
}
.day-label input[type='text']:focus + span {
  color: var(--yellow);
  border-color: var(--green);
  background: var(--green);
  color: #29323f;
  font-weight: bold;
  margin-bottom: 65px;
}
.day-label input[type='text']:focus ~ em {
  border-radius: 0;
  border: 5px solid transparent;
  background: transparent;
  border-bottom-color: white;
  margin-top: -62px;
  margin-left: 7px;
  width: 0;
  height: 0;
  display: inline-block;
  opacity: 1;
}
.day-label.selected[data-nrEvents='0'] input[type='text'] ~ em {
  display: inline-block;
  opacity: 1;
}

.day-label.selected input[type='text'] ~ em {
  display: inline-block;
  opacity: 1 !important;
  background-color: #29323f !important;
}

.day-label.selected input[type='text']:focus ~ em {
  display: inline-block;
  opacity: 1 !important;
  background-color: #29323f !important;
}

.day-label[data-nrEvents='0'] input[type='text'] ~ em {
  display: inline-block;
  opacity: 0;
}

.day-label[data-nrEvents='1'] input[type='text'] ~ em {
  display: inline-block;
  opacity: 1;
  background-color: var(--yellow);
}

.day-label[data-nrEvents='2'] input[type='text'] ~ em {
  display: inline-block;
  opacity: 1;
  background-color: var(--orange);
}

.day-label input[type='text'] ~ em {
  display: inline-block;
  opacity: 1;
  background-color: var(--red);
}
</style>
