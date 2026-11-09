/**
 * Non-Negotiables calendar link.
 * Lets the app see one day of your Google Calendar so it can tell work days from days off.
 * It only returns event titles and times for the day asked for, and only to someone who has the
 * secret key below.
 *
 * Setup: script.google.com → New project → paste this → change KEY → Deploy → New deployment →
 * type "Web app", Execute as "Me", Who has access "Anyone" → Deploy → allow access → copy the URL.
 */
const KEY = 'change-me-to-something-long';

function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.key !== KEY) return json({ error: 'bad_key' });
  const date = /^\d{4}-\d{2}-\d{2}$/.test(p.date || '') ? p.date : Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  const days = Math.min(Math.max(Number(p.days) || 1, 1), 7);
  const [y, m, d] = date.split('-').map(Number);
  const start = new Date(y, m - 1, d);
  const end = new Date(y, m - 1, d + days);
  const events = CalendarApp.getDefaultCalendar().getEvents(start, end).map((ev) => ev.isAllDayEvent()
    ? { summary: ev.getTitle(), start: { date: iso(ev.getAllDayStartDate()) }, end: { date: iso(ev.getAllDayEndDate()) } }
    : { summary: ev.getTitle(), start: { dateTime: ev.getStartTime().toISOString() }, end: { dateTime: ev.getEndTime().toISOString() } });
  return json({ date, events });
}

function iso(dt) { return Utilities.formatDate(dt, Session.getScriptTimeZone(), 'yyyy-MM-dd'); }
function json(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
