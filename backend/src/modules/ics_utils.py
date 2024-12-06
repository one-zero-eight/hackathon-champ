import datetime

import icalendar

TIMEZONE = "Europe/Moscow"


def get_base_calendar() -> icalendar.Calendar:
    """
    Get base calendar with default properties (version, prodid, etc.)
    :return: base calendar
    :rtype: icalendar.Calendar
    """

    calendar = icalendar.Calendar(
        prodid="-//one-zero-eight//Календарь Спорта РФ",
        version="2.0",
        method="PUBLISH",
    )

    calendar["x-wr-caldesc"] = "Календарь Спорта РФ"
    calendar["x-wr-timezone"] = TIMEZONE
    #
    # add timezone
    timezone = icalendar.Timezone(tzid=TIMEZONE)
    timezone["x-lic-location"] = TIMEZONE
    # add standard timezone
    standard = icalendar.TimezoneStandard()
    standard.add("tzoffsetfrom", datetime.timedelta(hours=3))
    standard.add("tzoffsetto", datetime.timedelta(hours=3))
    standard.add("tzname", "MSK")
    standard.add("dtstart", datetime.datetime(1970, 1, 1))
    timezone.add_component(standard)
    calendar.add_component(timezone)

    return calendar
