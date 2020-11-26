sap.ui.define([
	"sap/m/MessageBox", "sap/m/MessageToast", "sap/ui/model/json/JSONModel", "./designMode"
], function(MessageBox, MessageToast, JSONModel, designMode) {
	"use strict";

	function fnParseError(oParameter) {
		var sMessage = "",
			sDetails = "",
			oParameters = null,
			oError = {};
		oParameters = oParameter.getParameters ? oParameter.getParameters() : oParameter;
		sMessage = oParameters.message || oParameters.response.message;
		sDetails = oParameters.responseText || oParameters.response.responseText;

		if (jQuery.sap.startsWith(sDetails || "", "{\"error\":")) {
			var oErrModel = new JSONModel();
			oErrModel.setJSON(sDetails);
			sMessage = oErrModel.getProperty("/error/message/value");
		}

		oError.sDetails = sDetails;
		oError.sMessage = sMessage;
		return oError;
	}

	return {

		showODataError: function(oParameter, sTitle) {
			var oErrorDetails = fnParseError(oParameter);
			MessageBox.show(oErrorDetails.sMessage, {
				icon: MessageBox.Icon.ERROR,
				title: sTitle,
				details: oErrorDetails.sDetails,
				actions: MessageBox.Action.CLOSE,
				onClose: null,
				styleClass: designMode.getCompactCozyClass()
			});
		},

		showODataErrorText: function(oError) {
			MessageToast.show(fnParseError(oError).sMessage, {
				width: "20em",
				my: sap.ui.core.Popup.Dock.CenterCenter,
				at: sap.ui.core.Popup.Dock.CenterCenter
			});
		},

		showError: function(sText) {
			MessageBox.error(sText, {
				styleClass: designMode.getCompactCozyClass()
			});
		},

		showWarning: function(sText) {
			MessageBox.warning(sText, {
				styleClass: designMode.getCompactCozyClass()
			});
		},

		showInformation: function(sText) {
			MessageBox.information(sText, {
				styleClass: designMode.getCompactCozyClass()
			});
		},

		showText: function(sText) {
			MessageToast.show(sText, {
				width: "20em",
				my: sap.ui.core.Popup.Dock.CenterCenter,
				at: sap.ui.core.Popup.Dock.CenterCenter
			});
		},

		confirmAction: function(sTitle, sText, sChannelId, sEventId, oContext) {
			MessageBox.confirm(sText, {
				title: sTitle,
				icon: MessageBox.Icon.WARNING,
				actions: [
					MessageBox.Action.YES,
					MessageBox.Action.NO
				],
				onClose: function(sResult) {
					oContext._result = sResult;
					oContext.getEventBus().publish(sChannelId, sEventId, oContext);
				},
				styleClass: designMode.getCompactCozyClass()
			});
		}
	};
});