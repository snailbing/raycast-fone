import { showToast, Toast } from '@raycast/api';
import osascript from 'osascript-tag';
import { CalendarEvent } from './types';


const executeJxa = async (script: string) => {
    try {
      const result = await osascript.jxa({ parse: true })`${script}`;
      return result;
    } catch (err: unknown) {
      if (typeof err === 'string') {
        const message = err.replace('execution error: Error: ', '');
        console.log(err);
        showToast(Toast.Style.Failure, 'Something went wrong', message);
      }
    }
  };

export const createCalendarEvent = async (item: CalendarEvent, calendarName: string) => {
    executeJxa(`
      var app = Application.currentApplication()
      app.includeStandardAdditions = true
      var Calendar = Application("Calendar")
      
      var eventStart = new Date(${item.startDate.getTime()})
      var eventEnd = new Date(${item.endDate.getTime()})
      
      var projectCalendars = Calendar.calendars.whose({name: "${calendarName}"})
      var projectCalendar = projectCalendars[0]
      var event = Calendar.Event({
        summary: "${item.eventTitle}", 
        startDate: eventStart, 
        endDate: eventEnd, 
        alldayEvent: ${item.isAllDay},
        url: "${item.url}",
        description: "${item.desc}",
      })
      projectCalendar.events.push(event)
    `);

    executeJxa(`
      var app = Application.currentApplication()
      app.includeStandardAdditions = true
      var Calendar = Application("Calendar")
      var date = new Date(${item.startDate.getTime()})
      Calendar.viewCalendar({at: date})
    `);
  };
