module("luci.controller.owrt_web_sensor_value", package.seeall)

function index()
	entry({"admin", "services", "owrt_web_sensor_value"}, firstchild(), _("owrt_web_sensor_value"), 60)
	entry({"admin", "services", "owrt_web_sensor_value", "status"}, view("owrt_web_sensor_value/status"), _("owrt_web_status"), 10)
	entry({"admin", "services", "owrt_web_sensor_value", "settings"}, view("owrt_web_sensor_value/settings"), _("owrt_web_settngs"), 20)
end
