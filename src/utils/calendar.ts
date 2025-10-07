import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

export interface CalendarEvent {
  title: string;
  description?: string;
  start: Dayjs;
  end?: Dayjs; // Exclusive when allDay=true
  allDay?: boolean; // Defaults to true for vaccination events
  location?: string;
}

function escapeTextForIcs(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

function formatDateForIcs(date: Dayjs, allDay: boolean): string {
  return allDay ? date.format('YYYYMMDD') : date.utc().format('YYYYMMDD[T]HHmmss[Z]');
}

export function buildGoogleCalendarUrl(event: CalendarEvent): string {
  const allDay = event.allDay !== false; // default true
  const startStr = allDay
    ? event.start.format('YYYYMMDD')
    : event.start.utc().format('YYYYMMDD[T]HHmmss[Z]');
  const endBase = event.end || (allDay ? event.start.add(1, 'day') : event.start.add(1, 'hour'));
  const endStr = allDay
    ? endBase.format('YYYYMMDD') // end is exclusive for all-day
    : endBase.utc().format('YYYYMMDD[T]HHmmss[Z]');

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    details: event.description || '',
    location: event.location || '',
    dates: `${startStr}/${endStr}`,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function generateIcsEvent(event: CalendarEvent): string {
  const uid = `${Date.now()}-${Math.random().toString(36).slice(2)}@riverpoultry`;
  const allDay = event.allDay !== false; // default true
  const dtStamp = dayjs().utc().format('YYYYMMDD[T]HHmmss[Z]');
  const dtStart = formatDateForIcs(event.start, allDay);
  const dtEnd = formatDateForIcs(
    event.end || (allDay ? event.start.add(1, 'day') : event.start.add(1, 'hour')),
    allDay
  );

  const lines = [
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtStamp}`,
    allDay ? `DTSTART;VALUE=DATE:${dtStart}` : `DTSTART:${dtStart}`,
    allDay ? `DTEND;VALUE=DATE:${dtEnd}` : `DTEND:${dtEnd}`,
    `SUMMARY:${escapeTextForIcs(event.title)}`,
    event.description ? `DESCRIPTION:${escapeTextForIcs(event.description)}` : '',
    event.location ? `LOCATION:${escapeTextForIcs(event.location)}` : '',
    'BEGIN:VALARM',
    'TRIGGER:-P1D',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escapeTextForIcs(event.title)} reminder`,
    'END:VALARM',
    'END:VEVENT',
  ].filter(Boolean);

  return lines.join('\r\n');
}

export function generateIcsCalendar(events: CalendarEvent[]): string {
  const header = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//River Poultry//Vaccination Scheduler//EN',
    'CALSCALE:GREGORIAN',
  ].join('\r\n');

  const body = events.map(generateIcsEvent).join('\r\n');
  const footer = 'END:VCALENDAR';

  return [header, body, footer].join('\r\n');
}

export function downloadIcsFile(filename: string, icsContent: string): void {
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadIcsForEvents(filename: string, events: CalendarEvent[]): void {
  const ics = generateIcsCalendar(events);
  downloadIcsFile(filename, ics);
}
