<template>
  <div class="calendar-wrapper">
    <v-touch
      v-on:swipeleft="selectDay(1)"
      v-on:swiperight="selectDay(-1)"
      v-on:pinchOut="pinchOut"
      class="calendar-main"
    >
      <div class="calendar-header">
        <div class="current-date">
          <span>
            {{ selectedDayName }} {{ selectedDay }}. {{ selectedMonthName }}
          </span>
        </div>
      </div>
      <div class="calendar-events-day">
        <div
          class="event-day"
          v-for="event in eventsOnSelectedDay"
          v-bind:key="event.id"
        >
          <div><span>></span> {{ event.summary }}</div>
          <i @click="deleteEvent(event.id)" class="material-icons">backspace</i>
        </div>
      </div>
    </v-touch>
    <div class="calendar-event-add">
      <input
        v-on:keydown.enter="createEvent"
        v-model="eventToCreate.title"
        type="text"
        placeholder="What would you like to do?"
      />
    </div>
  </div>
</template>

<script>
import { MONTHS, WEEKDAYS } from './../util/constants';

export default {
  name: 'DayView',
  data() {
    return {
      eventToCreate: {
        title: '',
        date: new Date(),
        end: undefined,
        reminder: 0,
      },
    };
  },
  props: {
    selectedDate: Date,
    events: Array,
    viewPort: String,
  },
  methods: {
    pinchOut() {
      this.$emit('pinchOut');
    },
    onSameDay(date1, date2) {
      return (
        date1.getDate() === date2.getDate() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getFullYear() === date2.getFullYear()
      );
    },
    selectDay(modifier) {
      this.$emit('selectDay', modifier);
    },
    buildDateTime(year, month, day, hours) {
      const dateTime = `${year}-${month}-${day}T${String(hours).padStart(
        2,
        '0',
      )}:00:00`;
      return dateTime;
    },
    buildEventObject() {
      const event = {
        summary: this.eventToCreate.title,
        end: {},
        start: {},
      };
      event.start.dateTime = this.eventToCreate.date.toISOString();
      this.eventToCreate.date.setHours(this.eventToCreate.date.getHours() + 1);
      event.end.dateTime = this.eventToCreate.date.toISOString();
      if (this.eventToCreate.reminder > 0) {
        const reminder = {
          useDefault: false,
          overrides: [
            { method: 'popup', minutes: this.eventToCreate.reminder },
          ],
        };
        event.reminders = reminder;
      }

      return event;
    },
    async createEvent() {
      const event = this.buildEventObject();
      await this.$emit('createEvent', event);
      this.eventToCreate.title = '';
    },
    deleteEvent(id) {
      this.$emit('deleteEvent', id);
    },
  },
  computed: {
    eventsOnSelectedDay() {
      return this.events.filter((e) =>
        this.onSameDay(e.date, this.selectedDate),
      );
    },
    currentMonth() {
      return new Date().getMonth();
    },
    currentDayOfWeek() {
      return new Date().getDay();
    },
    currentDay() {
      return new Date().getDate();
    },
    currentDayName() {
      return WEEKDAYS[this.currentDayOfWeek];
    },
    currentYear() {
      return new Date().getFullYear();
    },
    selectedMonth() {
      return this.selectedDate.getMonth();
    },
    selectedMonthName() {
      return MONTHS[this.selectedMonth];
    },
    selectedDayOfWeek() {
      return this.selectedDate.getDay();
    },
    selectedDay() {
      return this.selectedDate.getDate();
    },
    selectedDayName() {
      return WEEKDAYS[this.selectedDayOfWeek];
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
};
</script>

<style>
.event-day {
  margin-bottom: 0.3rem;
  color: var(--fg-light);
  font-size: 1.2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.event-day i {
  cursor: pointer;
}
.event-day span {
  color: var(--bright-yellow);
}
.calendar-event-add {
  width: 380px;
}
.calendar-event-add input {
  height: 35px;
  outline: none;
  padding: 10px 40px;
  width: 300px;
  border: 0;
  outline: none;
  font-size: 16px;
  -webkit-transition: height 0.2s linear, opacity 0.2s linear,
    color 0.02s linear;
  transition: height 0.2s linear, opacity 0.2s linear, color 0.02s linear;
}
.calendar-event-add input:focus {
}
</style>
