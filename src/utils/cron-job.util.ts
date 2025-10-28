import { schedule } from "node-cron";


export function cronJobScheduledUtil(cronExpression: string, func: () => void) {
    /* field	value
      1st {*} minute	0-59
      2nd {*} hour	0-23
      3rd {*} day of month	1-31
      4th {*} month	1-12 (or names)
      5th {*} day of week 0-7 (or names, 0 or 7 are sunday)
  
      // MM HH DAY(MONTH) MONTH DAY(WEEK)
      cronExpression "* * * * *"
    */
    schedule(
        cronExpression,
        () => {
            func();
        },
        {
            timezone: "Asia/Singapore",
        },
    );
}
