// Utility for formatting values

sap.ui.define([
		"sap/ui/core/format/DateFormat", "sap/ui/core/format/NumberFormat", "sap/ui/core/Component"
], function(DateFormat, NumberFormat, Component) {
	"use strict";

	function fnGetBundle(oControl) {
		return (oControl.getModel("i18n") || sap.ui.component(Component.getOwnerIdFor(oControl)).getModel("i18n"))
				.getResourceBundle();
	}

	var fnDateAgoFormatter = DateFormat.getDateInstance({
		style : "medium",
		strictParsing : true,
		relative : true }), fnAmountFormatter = NumberFormat.getCurrencyInstance(), fnDeliveryDateFormatter = DateFormat
			.getDateInstance({
				style : "medium" });

	var me = {
		convertUIC : function(aUIC) {
			if (!jQuery.isArray(aUIC)) {
				return;
			}
			var oUIC = {};
			for (var i = 0; i < aUIC.length; i++) {
				var sAttr = aUIC[i].Ueid;
				oUIC[sAttr] = {
					Setf : aUIC[i].Setf,
					Visible : aUIC[i].Visible,
					Editable : aUIC[i].Editable,
					Require : aUIC[i].Require };
			}
			return oUIC;
		},

		setElementVER : function(v) {
			if (v) {
				return v;
			}
			return false;
		},

		setElementVERvS : function(r) {
			if (r) {
				return "Error";
			}
			return "None";
		},

		setElementTVERvS : function(r, g) {
			if (r && r[g]) {
				return "Error";
			}
			return "None";
		},
		dateString : function(value){
			if (value != "" && value != null){
			var year = value.substring(0,4);
			var month = value.substring(4,6);
			var day = value.substring(6,8);
			return year+"-"+month+"-"+day;
			}else{
				return value;
			}
		},
		timeString : function(value){
			if (value != "" && value != null){
			var hour = value.substring(0,2);
			var minute = value.substring(2,4);
			var seconds = value.substring(4,6);
			return hour+":"+minute + ":"+seconds;
			}else{
				return value;
			}
		},

		deleteRightZero : function(v)// ȥ����
		{
			if (v === null || v === undefined || v === 0 || v === "0") {
				v = 0
			}
			return parseFloat(v)
		},

		deleteLeftZero : function(v)// ȥǰ����
		{
			if (v === null || v === undefined || v === 0 || v === "0") {
				v = "0"
			}
			return v.replace(/^0+/, "");
		},

		showMessage : function(v) {
			if (v > 0) {
				return true;
			}
			return false;
		},
		_statusStateMap : {
			"P" : "Success",
			"N" : "Error"
			},
			statusState : function (value) {
				var map = ZXYL001.model.formatter._statusStateMap;
				var bundle = this.getModel("i18n").getResourceBundle().getText("StatusTextN");
				var bundle1 = this.getModel("i18n").getResourceBundle().getText("StatusTextP");
				if(value == bundle){
					return map[value];
				}else if(value == bundle1){
					return map[value];}
				},
		/*
		 * ������ɫ�����ڸ�ʽ
		 * 
		 * _statusStateMap : { "P" : "Success", "N" : "Error" }, statusText :
		 * function (value) { var bundle =
		 * this.getModel("i18n").getResourceBundle(); return
		 * bundle.getText("StatusText" + value, "?"); }, statusState : function
		 * (value) { var map = ZXYL001.model.formatter._statusStateMap; return
		 * (value && map[value]) ? map[value] : "None"; },
		 */
			
		daysAgo : function(dDate) {
			if (!dDate) {
				return "";
			}
			return fnDateAgoFormatter.format(dDate);
		},
		
		customTime : function(value) {
			if (value && value.ms) {
				var timeFormat = sap.ui.core.format.DateFormat.getTimeInstance({
					pattern : "HH:mm:ss" });
				var TZOffsetMs = new Date(0).getTimezoneOffset() * 60 * 1000;
				var timeStr = timeFormat.format(new Date(value.ms + TZOffsetMs));

				return timeStr;
			}
		},
		// ��ǰ���ڸ�ʽ��string����
		yyyymmdd : function(day){
			var mm = day.getMonth() + 1 ;
			var dd = day.getDate();
			return [day.getFullYear(),
					(mm > 9 ? '' : '0') + mm,
					(dd > 9 ? '' : '0') + dd].join('');
		},
		date : function(value) {
			if (value) {
				var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
					pattern : "yyyy-MM-dd" });
				return oDateFormat.format(new Date(value));
			}
			else {
				return value;
			}
		},
		
		checkBoxSelected : function(v) {
			return Boolean(v);
		},

		getElementVER : function(v) {
			if (v) {
				return v;
			}
			return false;
		},

		getElementVERvS : function(r) {
			if (r) {
				return "Error";
			}
			return "None";
		},

		getElementTVERvS : function(r, g) {
			if (r[g] != undefined) {
				return "Error";
			}
			return "None";
		},

		RelStatusText : function(v) {
			if (v == "A") {
				v = "����";
			};
			
			if (v == "S") {
				v = "���";
			};
			
			if (v == "D") {
				v = "ɾ��";
			};	
			return v;
		},
		
		PdStatusText : function(v) {
			if (v == "1") {
				v = "�̵���";
			};
			
			if (v == "2") {
				v = "���ύ";
			};
			
			if (v == "3") {
				v = "��ȷ��";
			};

			if (v == "4") {
				v = "�ѹ���";
			};
			
			if (v == "5") {
				v = "ɾ��";
			};	
			return v;
		},
		
		KclxText : function(v) {
			if (v == "1") {
				v = "�������";
			};
			
			if (v == "2") {
				v = "������";
			};
			return v;
		},
		};

	return me;
});