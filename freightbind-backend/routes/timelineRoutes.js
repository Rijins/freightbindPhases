const express = require("express");
const router = express.Router();

const timelineController = require("../controllers/timelineController");
const { protect } = require("../middleware/auth");
const validateRequest = require("../middleware/validateRequest");
const {
  getTimelineValidation,
  getLatestTimelineValidation,
  statusUpdateValidation,
  locationUpdateValidation,
  dispatcherAssignValidation,
  noteValidation,
} = require("../validations/timelineValidation");

router.get(
  "/:shipmentId/latest",
  protect,
  getLatestTimelineValidation,
  validateRequest,
  timelineController.getLatestTimelineEvent
);

router.get(
  "/:shipmentId",
  protect,
  getTimelineValidation,
  validateRequest,
  timelineController.getTimeline
);

router.post(
  "/status",
  protect,
  statusUpdateValidation,
  validateRequest,
  timelineController.updateStatus
);

router.post(
  "/location",
  protect,
  locationUpdateValidation,
  validateRequest,
  timelineController.updateLocation
);

router.post(
  "/dispatcher",
  protect,
  dispatcherAssignValidation,
  validateRequest,
  timelineController.assignDispatcher
);

router.post(
  "/note",
  protect,
  noteValidation,
  validateRequest,
  timelineController.addNote
);

module.exports = router;
