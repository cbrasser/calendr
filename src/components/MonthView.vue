<template>
  <div class="calendar-wrapper">
    <v-touch
      v-on:swipeleft="selectMonth(1)"
      v-on:swiperight="selectMonth(-1)"
      v-on:swipeup="selectYear(1)"
      v-on:swipedown="selectYear(-1)"
      v-on:press="selectCurrentDay()"
      v-on:pinchin="pinchIn"
      v-on:pinchout="pinchOut"
      @mouseenter="pinchIn"
      class="calendar-main"
    >
      <div class="calendar-header">
        <div class="current-date">
          <span ref="monthAndYear"
            >{{ getMonthName(selectedMonth) }} {{ selectedYear }}</span
          >
        </div>
      </div>
      <div class="calendar-day-names mobile" v-if="viewPort === 'mobile'">
        <div
          class="day-name"
          v-for="index in [0, 1, 2, 3, 4, 5, 6]"
          v-bind:key="'day_' + index"
        >
          {{ getDayName(index).substr(0, 2) }}
        </div>
      </div>
      <div class="calendar-day-names" v-else>
        <div
          class="day-name"
          v-for="index in [0, 1, 2, 3, 4, 5, 6]"
          v-bind:key="'day_' + index"
        >
          {{ getDayName(index) }}
        </div>
      </div>

      <div class="calendar-days">
        <div
          class="day prev-month"
          v-for="pDay in firstDayInSelectedMonth"
          v-bind:key="'pday_' + pDay"
        >
          <div
            class="day-label"
            @click="selectDate(pDay, selectedMonth - 1, selectedYear)"
          >
            <span>{{ pDay }}</span>
          </div>
        </div>

        <v-touch
          class="day"
          v-for="day in daysInSelectedMonth"
          v-bind:key="'day_' + day"
          v-on:press="openCreationPopup(selectedYear, selectedMonth, day)"
          v-on:tap="selectDate(day, selectedMonth, selectedYear)"
        >
          <div
            class="day-label"
            :data-day="day"
            :data-nrEvents="
              eventsOnDay(day, selectedMonth, selectedYear).length
            "
            :class="{
              selected: day == selectedDay,
              current: isCurrentDay(day, selectedMonth, selectedYear),
            }"
          >
            <input
              @keydown.enter="createEvent"
              placeholder="What would you like to do?"
              :data-year="selectedYear"
              :data-month="selectedMonth"
              :data-day="day"
              v-model="eventToCreate.title"
              class="appointment"
              type="text"
            />
            <span>{{ day }}</span>
            <em></em>
          </div>
        </v-touch>
        <div
          class="day next-month"
          v-for="nDay in 6 - lastDayInSelectedMonth"
          v-bind:key="'nday_' + nDay"
        >
          <div
            class="day-label"
            @click="selectDate(nDay, selectedMonth + 1, selectedYear)"
          >
            <span>{{ nDay }}</span>
          </div>
        </div>
      </div>
    </v-touch>
    <div
      class="calendar-events"
      v-bind:class="{
        open: eventsOnSelectedDay().length > 0 && !creationPopupOpen,
      }"
    >
      <div
        class="event-wrapper"
        v-for="event of eventsOnSelectedDay()"
        v-bind:key="event.id"
      >
        <span class="event-title">
          {{ event.summary }}
        </span>
        <div class="event-button" @click="deleteEvent(event.id)">
          <i class="material-icons">backspace</i>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { WEEKDAYS, MONTHS } from './../util/constants';

export default {
  data() {
    return {
      eventToCreate: {
        title: '',
        date: new Date(),
        end: undefined,
        reminder: 0,
      },
      creationPopupOpen: false,
    };
  },
  props: {
    selectedDate: Date,
    events: Array,
    viewPort: String,
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
    openCreationPopup(year, month, day) {
      // this.creationPopupOpen = true;
      this.$emit('selectDate', { day, month, year });

      document
        .querySelector(
          `[data-year='${year}'][data-month='${month}'][data-day='${day}']`,
        )
        .focus();
      this.eventToCreate.date = new Date(year, month, day, 12);
    },
    selectMonth(modifier) {
      this.$emit('selectMonth', modifier);
    },
    selectYear(modifier) {
      this.$emit('selectYear', modifier);
    },
    selectDate(day, month, year) {
      this.$emit('selectDate', { day, month, year });
    },
    selectCurrentDay() {
      this.$emit('selectCurrentDay');
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
    getMonthName(index) {
      return index < 0 ? MONTHS[11] : MONTHS[index % 12];
    },
    getDayName(index) {
      return WEEKDAYS[index];
    },
    isCurrentDay(day, month, year) {
      return (
        day === this.currentDay &&
        month === this.currentMonth &&
        year === this.currentYear
      );
    },
    eventsOnDay(day, month, year) {
      return this.events.filter((e) =>
        this.onSameDay(e.date, new Date(year, month, day)),
      );
    },
    eventsOnSelectedDay() {
      return this.events.filter((e) => this.isOnSelectedDay(e.date));
    },
    onSameDay(date1, date2) {
      return (
        date1.getDate() === date2.getDate() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getFullYear() === date2.getFullYear()
      );
    },
    isOnSelectedDay(date) {
      return (
        date.getDate() === this.selectedDay &&
        date.getMonth() === this.selectedMonth &&
        date.getFullYear() === this.selectedYear
      );
    },
    pinchIn() {
      console.log('test');
      this.$emit('pinchIn');
    },
    pinchOut() {
      this.$emit('pinchOut');
    },
  },
};
</script>

<style></style>
