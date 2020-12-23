sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function(JSONModel, Device) {
	"use strict";

	return {

		createDeviceModel: function() {
			var oModel = new JSONModel(Device);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},
		createLocalModel: function() {
			var oModel = new JSONModel(this._initialLocalData());
			oModel.setSizeLimit(9999);
			return oModel;
		},
		_initialLocalData: function() {

			var localData = {

				// ---responseCode,data;
				Baecode: "",
				appProperties: {
					busy: false,
					editable: false,
					needSave: false,
					// 附件相关
					deleteVisible: true,
					uploadInvisible: false,
					bcode: "",
					fcode: ""
				},
				verReturn: {},
				messages: {
					buttonWidth: "0em",
					counter: 0,
					counterE: 0,
					content: []
				},
				ODataMetadata: {},

				searchHelp: {
					EMaxrecords: 500,
					F4ID: "",
					KEY1: "",
					KEY2: "",
					VALUE1: "",
					VALUE2: "",
					f4h2r: []
				},
				onSearchData:{
					PERNR:"",
					WERKS:"",
					BTRTL:"",
					PERSG:"",
					PERSK:"",
					DZDAMK:"",
					DZDALB:"",
					DZDAMKUP:"",
					DZDALBUP:"",
					DZDALBTUP:""
				}
			};

			var uR = $.ajax({
				url: "/sap/bc/ui2/start_up",
				async: false
			});

			if (uR.status === 500) {
				localData.userSet = uR.responseJSON;
			}

			return localData;
		}

	};
});