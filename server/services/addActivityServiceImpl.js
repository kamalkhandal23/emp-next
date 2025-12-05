import RecentActivity from '../models/education/recentActivity.js';

const addActivity = async (studentId, activityType, description, extraData = {}) => {
  await RecentActivity.findOneAndUpdate(
    { studentId },
    {
      $push: {
        activities: {
          $each: [{ activityType, description, extraData, timestamp: new Date() }],
          $position: 0, // insert at the beginning
          $slice: 20,   // keep only latest 20 activities
        },
      },
    },
    { upsert: true, new: true }
  );
};

export default addActivity;