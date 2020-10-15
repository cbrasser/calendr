# calendr

> clean google calender pwa


![Alt Text](https://github.com/cbrasser/calendr/edit/main/Peek 2020-10-15 23-31.gif)

## Details

I've always been disatisfied with the design of most calendar apps. most of them are crazy cluttered with lots uf features i don't really use on a daily basis. My main usage of a calendar during the day is to quickly check what i have coming up next and to add some quick todos. 

meet `calendr`. The design cannot really get more minimal. 
It has PWA support so on most phones you should have an 'install' button on your browser when you access it. 

I'm currently hosting it on firebase since it's free: https://calendr-771d1.web.app/#/

Creating an event/todo is as simple as long-pressing a date, choosing a short title and submitting with enter. Deleting entries is just as simple. The duration of each created event is automatically set to 1 hour. Only the 100 upcoming events are fetched from the google api to keep load times short. Also only one-time events are fetched.

### Further controls
**swipe left**: next month

**swipe right**: previous month

**swipe up**: next year

**swipe down**: previous year

**long-press month name**: go to current day


## What this App is NOT

A full replacement for an agenda or weekly plan. It's really just an eye candy todo tracker with google calendar integration.

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report
```


