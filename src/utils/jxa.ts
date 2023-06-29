import { runAppleScript } from "@raycast/utils";
import { showHUD } from "@raycast/api";
import { CalendarEvent } from "./types";

export const createCalendarEvent = async (item: CalendarEvent, calendarName: string) => {
  await runAppleScript(`
      var app = Application.currentApplication()
      app.includeStandardAdditions = true
      var Calendar = Application("Calendar")
      
      var eventStart = new Date(${item.startDate.getTime()})
      var eventEnd = new Date(${item.endDate.getTime()})
      
      var projectCalendars = Calendar.calendars.whose({name: "${calendarName}"})
      var projectCalendar = projectCalendars[0]
      var event = Calendar.Event({
        summary: "${item.eventTitle}", 
        location: "${item.product}",
        startDate: eventStart, 
        endDate: eventEnd, 
        alldayEvent: ${item.isAllDay},
        url: "${item.url}",
        description: "${item.desc}",
      })
      projectCalendar.events.push(event)
    `,
    { language: "JavaScript", humanReadableOutput: false });

  await runAppleScript(`
      var app = Application.currentApplication()
      app.includeStandardAdditions = true
      var Calendar = Application("Calendar")
      var date = new Date(${item.startDate.getTime()})
    `,
    // Calendar.viewCalendar({at: date})
    { language: "JavaScript", humanReadableOutput: false });
};

export const getCalendarEvents = async (calendarName: string, startDate: Date, endDate: Date) => {
  const res = await runAppleScript(
    `
    var app = Application.currentApplication()
    app.includeStandardAdditions = true
    var Calendar = Application("Calendar")

    var projectCalendars = Calendar.calendars.whose({name: "${calendarName}"})
    var projectCalendar = projectCalendars[0]
    var events = projectCalendar.events.whose({startDate: {_greaterThan: new Date(${startDate.getTime()})}, endDate: {_lessThanEquals: new Date(${endDate.getTime()})}})
    events.length
    var es = []
    for(var i=0; i<events.length; i++) { 
      event = events[i]
      if (event.url() == null || event.url() == ""){
       es.push({
          "id": event.uid(),
          "summary": event.summary(), 
          "startDate": event.startDate().getTime(),
          "endDate": event.endDate().getTime(),
          "description": event.description(),
          "product": event.location(),
          "calendar": "${calendarName}",
        });
       }
    }
    es
  `,
    { language: "JavaScript", humanReadableOutput: false, timeout: 30000}
  );
  // console.log(res);
  // await showHUD(res);
  return res;
};

export const updateEventUrlById = async (calendarName: string, url: string, id: string) => {
  const res = await runAppleScript(
    `
    var app = Application.currentApplication()
    var Calendar = Application("Calendar")
     
    var projectCalendars = Calendar.calendars.whose({name: "${calendarName}"})
    var projectCalendar = projectCalendars[0]
     
    var event = projectCalendar.events.byId("${id}")
    event.url = "${url}"
  `,
    { language: "JavaScript", humanReadableOutput: false }
  );
  // console.log(res);
  // await showHUD(res);
  return res;
}