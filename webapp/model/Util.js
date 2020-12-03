sap.ui.define([], function () {
	"use strict";
	return {
		isNotNull: function (ele) {
			if (typeof ele === 'undefined') { //先判断类型
				return false;
			} else if (ele == null) {
				return false;
			} else if (ele == '') {
				return false;
			}
			return true;
		},
		isDigitNum: function (value, digit) {
			var reg;
			if (digit == 10)
				reg = new RegExp(/^\d{10}$/);
			else
				reg = new RegExp(/^\d{12}$/);
			if (reg.test(value))
				return true;
			else
				return false;
		},
		convertUndefined: function (ele) {
			if (typeof ele === 'undefined') { //先判断类型
				return "";
			} else if (ele == null) {
				return "";
			} else {
				return ele;
			}
		},
		cutFrontZero: function (sValue) {
			return sValue.replace(/\b(0+)/gi, "");
		},
		PrefixInteger: function (num, n) {
			return (Array(n).join(0) + num).slice(-n);
		}
	};
});