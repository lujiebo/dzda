sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/Device",
	"sap/ui/model/Filter",
	"sap/ui/model/json/JSONModel",
	"./designMode",
	"./messages",
	"com/shunyu/dzda/model/formatter"
], function (Object, Device, Filter, JSONModel, designMode, messages, formatter) {
	"use strict";

	return Object.extend("com.shunyu.dzda.controller.searchHelp", {
		formatter: formatter,

		constructor: function (oParentView) {
			this._oParentView = oParentView;
			this._oViewModel = this._oParentView.getModel();
			this._Controller = oParentView.getController();
			this._ResourceBundle = this._oParentView.getModel("i18n").getResourceBundle();
			this._ODataModel = this._oParentView.getModel("ZCommon");
		},

		openDialog: function () {
			if (!this._oDialog) {
				this._oDialog = sap.ui.xmlfragment(this._oParentView.getId(), "com.shunyu.dzda.view.searchHelp", this);
				designMode.syncStyleClass(this._oParentView, this._oDialog);
				this._oParentView.addDependent(this._oDialog);
			}
			this._oViewModel.setProperty("/appProperties/f4panel", false);
			this._oDialog.open();

		},

		onSearch: function (evt) {
			var searchHelp = this._oViewModel.getProperty("/searchHelp"),
				VALUE1,
				KEY1;

			if (searchHelp.KEY1 !== '') {
				KEY1 = searchHelp.KEY1;
				this._oViewModel.setProperty("/searchHelp/Note1", KEY1);
			}
			if (searchHelp.VALUE1 !== '') {
				VALUE1 = searchHelp.VALUE1;
				this._oViewModel.setProperty("/searchHelp/Note1", VALUE1);
			}
			var oFilters = [];
			var sUrl = "/ZSY_HR_SH_COMMSet";
			var that = this;
			oFilters.push(new Filter("F4ID", sap.ui.model.FilterOperator.EQ, this._oViewModel.getProperty("/appProperties/fcode")));
			if (searchHelp.KEY1 !== '') {
				oFilters.push(new Filter("KEY1", sap.ui.model.FilterOperator.EQ, KEY1));
			}
			if (searchHelp.VALUE1 !== '') {
				oFilters.push(new Filter("VALUE1", sap.ui.model.FilterOperator.EQ, VALUE1));
			}
			this._ODataModel.read(sUrl, { //
				filters: oFilters,
				success: function (oData, oResponse) {

					var oJson = oData.results;
					that._oViewModel.setProperty("/searchHelp/f4h2r", oJson);
					that._oViewModel.setSizeLimit(that._oViewModel.getProperty("/searchHelp/EMaxrecords"));
				},
				error: function (error) {
					that.getView().setBusy(false);
				}
			});
		},


		handleSearch: function (evt) {
			var aFilters = [];
			var afilter = [];
			var sValue = evt.getParameter("newValue");
			afilter.push(new Filter("Note1", sap.ui.model.FilterOperator.Contains, sValue));
			afilter.push(new Filter("Zvkey1", sap.ui.model.FilterOperator.Contains, sValue));
			// var oFilter = new Filter("Note1",
			// sap.ui.model.FilterOperator.Contains, sValue);
			var allFilters = new Filter(afilter, false); // false为并集
			aFilters.push(allFilters);
			var oBinding = this._oParentView.byId("LCGZ").getBinding("items");
			oBinding.filter(aFilters);
		},

		getTx: function (matnr) {
			var sUrl = "/ntzbSet";
			var oFilter1 = new sap.ui.model.Filter("EMatnr", sap.ui.model.FilterOperator.EQ, matnr);
			var aFilters = [
				oFilter1
			];
			var mParameters = {
				filters: aFilters,
				success: function (oData, response) {
					var Arry = oData.results;
					this._oViewModel.setProperty("/txb", Arry);
				}.bind(this),
				error: function (oError) {
					messages.showODataErrorText(oError);
					oDialog.close();
				}.bind(this)
			};
			this._ODataModel.read(sUrl, mParameters);
		},

		pressEvent: function (evt) {
			this._oDialog.close();
			var context = evt.getSource().getBindingContext();
			var item = context.getProperty(context.sPath);
			var fcode = this._oViewModel.getProperty("/appProperties/fcode");
			var oModelName = this._oViewModel.getProperty("/searchHelp/ModelName");
			var oPath = this._oViewModel.getProperty("/searchHelp/Path");
			var onSearchData = this._oParentView.getModel(oModelName).oData;
			var oTableData = this._oParentView.getModel(oModelName).oData;
			switch (fcode) {
				case "PERNR":
					onSearchData.PERNR = item.KEY1;
					this._oParentView.setModel(new JSONModel(onSearchData), oModelName);
					break;
				// case "PERNR":
				// 	this.oMultiPERNR.addToken(
				// 		new Token({
				// 			text: item.KEY1,
				// 			key: item.KEY1
				// 		})
				// 	);
				// 	break;
				case "WERKS":
					if(onSearchData.WERKS != item.KEY1) //说明选择的人事范围值发生了变化
					{
						onSearchData.BTRTL = "";
					}
					onSearchData.WERKS = item.KEY1;
					this._oParentView.setModel(new JSONModel(onSearchData), oModelName);
					break;
				case "BTRTL":
					onSearchData.BTRTL = item.KEY1;
					this._oParentView.setModel(new JSONModel(onSearchData), oModelName);
					break;
				case "PERSG":
					onSearchData.PERSG = item.KEY1;
					this._oParentView.setModel(new JSONModel(onSearchData), oModelName);
					break;
				case "PERSK":
					onSearchData.PERSK = item.KEY1;
					this._oParentView.setModel(new JSONModel(onSearchData), oModelName);
					break;
				case "DZDAMK":
					onSearchData.DZDAMK = item.KEY1;
					this._oParentView.setModel(new JSONModel(onSearchData), oModelName);
					break;
				case "DZDALB":
					onSearchData.DZDALB = item.KEY1;
					this._oParentView.setModel(new JSONModel(onSearchData), oModelName);
					break;
				case "DZDAMKUP":
					onSearchData.DZDAMKUP = item.KEY1;
					this._oParentView.setModel(new JSONModel(onSearchData), oModelName);
					break;
				case "DZDALBUP":
					onSearchData.DZDALBUP = item.KEY1;
					onSearchData.DZDALBTUP = item.VALUE1;
					this._oParentView.setModel(new JSONModel(onSearchData), oModelName);
					break;
			}

			this._oViewModel.setProperty("/searchHelp/KEY1", "");
			this._oViewModel.setProperty("/searchHelp/VALUE1", "");
			this._oViewModel.setProperty("/searchHelp/EMaxrecords", 500);
			// this._oParentView.byId("Zvkey1_Note1").clear();
			// this._Controller.setBusy(false);
		},

		pressSelectEvent: function (evt) {

			var context = evt.getSource().getBindingContext();
			var item = context.getProperty(context.sPath);
			var fcode = this._oViewModel.getProperty("/appProperties/fcode");
			if (fcode == "IvSmenr") {
				// 返利报表-柜组
				this.multiSelect(fcode);
			}
		},


		onSumbitAction: function () {
			var fcode = this._oViewModel.getProperty("/appProperties/fcode");
			this.multiSelect(fcode);
			this._oDialog.close();
			var oTable = this._oParentView.byId("GuiZu");
			oTable.setMode(sap.m.ListMode.Delete);
			oTable.setMode(sap.m.ListMode.MultiSelect);
		},

		setFCVisible: function (f) {
			if (f == "IvSmenr" || f == "Monat" || f == "KhinrFA" || f == "KostlFA" || f == "IpGdsdeptFA") {
				return false;
			}
			return true;
		},

		onCancelAction: function () {
			this._oDialog.close();
			this._oViewModel.setProperty("/searchHelp/KEY1", "");
			this._oViewModel.setProperty("/searchHelp/VALUE1", "");
			this._oViewModel.setProperty("/searchHelp/EMaxrecords", 500);
			// this._oParentView.byId("Zvkey1_Note1").clear();
			this._Controller.setBusy(false);
		},

		onPostSuccess: function (oController) {
			oController.getEventBus().publish("ZZCommon", "postExecuted", oController);
		}
	});
});