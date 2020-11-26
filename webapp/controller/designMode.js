sap.ui.define([
	"sap/ui/Device"
], function(Device) {
	"use strict";

	var sCompactCozyClass = Device.support.touch ? "sapUiSizeCozy" : "sapUiSizeCompact";

	return {
		getCompactCozyClass : function() {
			return sCompactCozyClass;
		},

		syncStyleClass : function(oView, oControl) {
			jQuery.sap.syncStyleClass(sCompactCozyClass, oView, oControl);
		} };
});