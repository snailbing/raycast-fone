export interface CalendarEvent {
    id: string;
    eventTitle: string;
    desc?: string;
    startDate: Date;
    endDate: Date;
    isAllDay: boolean;
    validated: boolean;
    url: string;
  }